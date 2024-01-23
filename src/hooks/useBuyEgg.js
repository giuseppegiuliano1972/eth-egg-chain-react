import { useState, useCallback } from 'react'
import { useKubo } from './useKubo'
import { useWeb3 } from './useWeb3'

import { CID } from 'kubo-rpc-client'

export const useBuyEgg = () => {
  const { kubo, kuboError, kuboStarting } = useKubo()
  // eslint-disable-next-line no-unused-vars
  const { web3, accounts, selected, gateway, web3Error, web3Starting } = useWeb3()
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [buyCID, setBuyCID] = useState('')
  const [boughtEgg, setBoughtEgg] = useState({})

  const buyEgg = useCallback(async (json) => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true);

        // Input validation
        const farmer_egg_cid = CID.parse(json.eggcid)
        const farmer_egg = (await kubo.dag.get(farmer_egg_cid)).value

        var market_egg;

        // Get market pack egg event from chain
        await gateway.getPastEvents('eggTransfer', {
          filter: {_hash: web3.utils.bytesToHex(farmer_egg_cid.multihash.digest), state: 6},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(async function(events){
          for (const event of events) {
            // compress following into a function
            const bytes = web3.utils.hexToBytes((event.topics[1]).toString());
            const digest = new Uint8Array(34);
            digest.set([18, 32]);
            digest.set(bytes, 2);
            const market_egg_cid = CID.create(1, 0x71, {bytes: digest });
            market_egg = (await kubo.dag.get(market_egg_cid)).value
          }
        })

        var egg_price;

        if (market_egg === undefined) {
          // It's the farmer's egg
          egg_price = farmer_egg.price;

        } else {
          // It's the market's egg
          egg_price = market_egg.price;
        }

        // get price and validate it's a number
        const price = parseFloat(json.price);

        // Check that price is a number, greater than zero, and not NaN
        if (typeof price !== 'number' || price <= 0 || isNaN(price)) {
          throw new Error('The price must be a number greater than zero.');
        } 
        
        if (parseFloat(egg_price) != price) {
          throw new Error('This packed egg costs: ' + egg_price + ' ETH');
        }

        // add transfer as a dag json to ipfs
        // store price as string
        const cid = await kubo.dag.put({
          ...json,
          price: price.toString(),
          egglink: farmer_egg_cid.toString(),
        });


        console.log("cid: " + cid.address);
        console.log("original_egg dig: " + web3.utils.bytesToHex(farmer_egg_cid.multihash.digest));
        // register transfer and handle outcome
        await gateway.methods.buyEgg(json.seller, json.buyer, web3.utils.bytesToHex(cid.multihash.digest), web3.utils.bytesToHex(farmer_egg_cid.multihash.digest), web3.utils.toWei( json.price, "ether"))
                                .send({from: selected,  value: web3.utils.toWei( json.price, "ether")})
                                .on('confirmation', function(confirmation, receipt){
                                  // convert to string and set cid
                                  console.log("confirmationNumber", confirmation);
                                  console.log("receipt", receipt);
                                  setBuyCID(cid.toString());
                                })
                                .on("receipt", function (receipt) {
                                  // receipt example
                                  console.log("receipt:", receipt);
                                })
                                .on('error', function(error, receipt){
                                  setBuyCID('')
                                  console.error(error);
                                });
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kuboError, kuboStarting, kubo])

  const fetchBoughtEgg = useCallback(async () => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true)

        console.log('Fetching: ', buyCID)
        const _cid = CID.parse(buyCID);

        // Get all events involving the egg
        // eventually handle multiple results
        await gateway.getPastEvents('eggTransfer', {
          filter: {transfer: web3.utils.bytesToHex(_cid.multihash.digest)},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(function(events){
          for (const event of events) {
            // compress following into a function
            const bytes = web3.utils.hexToBytes((event.topics[1]).toString());
            const digest = new Uint8Array(34);
            digest.set([18, 32])
            digest.set(bytes, 2)
            const egglink = CID.create(1, 0x71, {bytes: digest })

            console.log('EggCID: ', egglink);
          }
        })

        // convert from string to CID format
        const cid = CID.parse(buyCID)

        // query ipfs for the json of the transfer
        const json = await kubo.dag.get(cid);

        // set field with returned values
        setBoughtEgg(json.value);
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kubo, kuboError, kuboStarting, buyCID])
  
  return { loading, buyCID, setBuyCID, boughtEgg, buyEgg, fetchBoughtEgg }
}