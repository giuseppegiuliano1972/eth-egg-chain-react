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
        
        // TODO: Add input validation

        console.log("json egglink: " + json.egglink);
        // convert eggid to appropiate format
        const egglink = CID.parse(json.egglink);
        console.log(" egglink: " + egglink);
        // get original egg for checks
        const original_egg = await kubo.dag.get(egglink);
        console.log(" original_egg: " + original_egg);
        console.log("Seller:", json.seller, "Buyer:", json.buyer);

        //check for zero price
        if (parseInt(json.price) === 0){
       
          throw new Error('The price cannot be zero! ');
        }

        console.log("json seller: " + json.seller);
        console.log("selected: " + selected);
        console.log("json buyer: " + json.buyer);

        // add transfer as a dag json to ipfs
        const cid = await kubo.dag.put(json);


        console.log("cid: " + cid.address);
        console.log("original_egg dig: " + web3.utils.bytesToHex(egglink.multihash.digest));
        // register transfer and handle outcome
        await gateway.methods.buyEgg(json.seller, json.buyer, web3.utils.bytesToHex(cid.multihash.digest), web3.utils.bytesToHex(egglink.multihash.digest), web3.utils.toWei( json.price, "ether"))
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