import { useState, useCallback } from 'react'
import { useKubo } from './useKubo'
import { useWeb3 } from './useWeb3'

import { CID } from 'kubo-rpc-client'

export const useCommitEgg = () => {
  const { kubo, kuboError, kuboStarting } = useKubo()
  // eslint-disable-next-line no-unused-vars
  const { web3, accounts, gateway, web3Error, web3Starting } = useWeb3()
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [cidString, setCidString] = useState('')
  const [committedEgg, setCommittedEgg] = useState({})

  const states = [
    'Default', //0
    'Packed', //1
    'Delivered', //2
    'FactoryBought', //3
    'MarketArrived', //4
    'FoodFactoryArrived', //5
    'MarketForSale', //6
    'ConsumerBought' //7
  ]

  const commitEgg = useCallback(async (json) => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true);

        // Add nonce to differentiate eggs
        json.nonce = await web3.eth.getBlockNumber()

        // Input validation

        // get quantity and validate it's a number
        const quantity = parseInt(json.quantity);

        // Check that quantity is a positive integer
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error('The quantity must be a positive integer.');
        }
        
        // get price and validate it's a number
        const price = parseFloat(json.price);

        // Check that price is a number, greater than zero, and not NaN
        if (typeof price !== 'number' || price <= 0 || isNaN(price)) {
            throw new Error('The price must be a number greater than zero.');
        }

        
        // add egg as a dag json to ipfs
        // store price and quantity as strings
        const cid = await kubo.dag.put({
          ...json,
          price: price.toString(),
          quantity: quantity.toString()
        });

        // convert to string and set cid
        setCidString(cid.toString());

        // register egg and handle outcome
        console.log(cid)
        await gateway.methods.packEgg(json.address, web3.utils.bytesToHex(cid.multihash.digest))
                                .send({from: json.address})
                                .on('confirmation', function(confirmation, receipt){
                                  // Put here any feedback on transaction result
                                  console.log("Transaction confirmed!");
                                })
                                .on('error', function(error, receipt){
                                  console.error(error);
                                });

        // Handle outcome, for now a simple log
        console.log('Added egg with CID:', cid.toString())
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kuboError, kuboStarting, kubo])

  const commitMarketEgg = useCallback(async (json) => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true);
        
        // get original egg for checks
        const egglink = CID.parse(json.egglink)
        const original_egg = await kubo.dag.get(egglink);

        // get quantity and validate it's a number
        const quantity = parseInt(json.quantity);

        // Check that quantity is a positive integer
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error('The quantity must be a positive integer.');
        }
        
        // get price and validate it's a number
        const price = parseFloat(json.price);

        // Check that price is a number, greater than zero, and not NaN
        if (typeof price !== 'number' || price <= 0 || isNaN(price)) {
            throw new Error('The price must be a number greater than zero.');
        }
        
        // Check that eggs quantity is higher or equal than quantity of eggs received
        if (parseInt(original_egg.quantity) < quantity){
            throw new Error('New quantity cannot be higher than the quantity of eggs received! ');
        }

        // add egg as a dag json to ipfs
        // store price and quantity as strings
        const cid = await kubo.dag.put({
          ...json,
          price: price.toString(),
          quantity: quantity.toString()
        });

        // convert to string and set cid
        setCidString(cid.toString())

        // register egg and handle outcome
        console.log(cid)
        await gateway.methods.packMarketEgg(json.address, web3.utils.bytesToHex(egglink.multihash.digest), web3.utils.bytesToHex(cid.multihash.digest))
                                .send({from: json.address})
                                .on('confirmation', function(confirmation, receipt){
                                  // Put here any feedback on transaction result
                                  console.log("Transaction confirmed!");
                                })
                                .on('error', function(error, receipt){
                                  console.error(error);
                                });

        // Handle outcome, for now a simple log
        console.log('Added egg with CID:', cid.toString())
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kuboError, kuboStarting, kubo, cidString])

  const fetchCommittedEgg = useCallback(async () => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true)

        console.log('Fetching: ', cidString)
        const _cid = CID.parse(cidString);

        let state = 0
        let address
        let transfers = []

        // Get all events involving the egg
        // Here we get the first packing
        await gateway.getPastEvents('eggPacked', {
          filter: {_hash: web3.utils.bytesToHex(_cid.multihash.digest)},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(function(events){
          for (const event of events) {
            address = web3.eth.abi.decodeParameter('address', event.topics[1]);
            state = 1;
          }
        })

        // Here we get the transfers
        await gateway.getPastEvents('eggTransfer', {
          filter: {_hash: web3.utils.bytesToHex(_cid.multihash.digest)},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(function(events){
          for (const event of events) {
            const bytes = web3.utils.hexToBytes((event.topics[1]).toString());
            const digest = new Uint8Array(34);
            digest.set([18, 32])
            digest.set(bytes, 2)
            const cid = CID.create(1, 0x71, {bytes: digest })
            transfers.push(cid)
            state = web3.eth.abi.decodeParameter('uint8', event.topics[3])
          }
        })

        // convert from string to CID format
        const cid = CID.parse(cidString);

        // query ipfs for the json of the egg
        const json = (await kubo.dag.get(cid)).value;

        if(address !== json.address) throw new Error('Egg address on ipfs was not found on the blockchain.');

        json.state = states[state];
        for (const transfer of transfers) {
          const transfer_json = (await kubo.dag.get(transfer)).value;
          json[transfer.toString()] = transfer_json
        }

        // set field with returned values
        setCommittedEgg(json);
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kubo, kuboError, kuboStarting, cidString])
  
  return { loading, cidString, setCidString, committedEgg, commitEgg, commitMarketEgg, fetchCommittedEgg }
}