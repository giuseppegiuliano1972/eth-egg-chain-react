import { useState, useCallback } from 'react'
import { useKubo } from './useKubo'
import { useWeb3 } from './useWeb3'

import { CID } from 'kubo-rpc-client'

export const useTransferEgg = () => {
  const { kubo, kuboError, kuboStarting } = useKubo()
  // eslint-disable-next-line no-unused-vars
  const { web3, accounts, selected, gateway, web3Error, web3Starting } = useWeb3()
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [transferCID, setTransferCID] = useState('')
  const [transferedEgg, setTransferedEgg] = useState({})

  const transferEgg = useCallback(async (json) => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true);

        // TODO: Add input validation

        // add transfer as a dag json to ipfs
        const cid = await kubo.dag.put(json);

        // convert eggid to appropiate format
        const egglink = CID.parse(json.egglink)

        // register transfer and handle outcome
        await gateway.methods.transferEgg(json.sender, json.receiver, web3.utils.bytesToHex(cid.multihash.digest), web3.utils.bytesToHex(egglink.multihash.digest))
                                .send({from: json.sender})
                                .on('confirmation', function(confirmation, receipt){
                                  // convert to string and set cid
                                  setTransferCID(cid.toString())
                                })
                                .on('error', function(error, receipt){
                                  setTransferCID('')
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

  const fetchTransferedEgg = useCallback(async () => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true)

        console.log('Fetching: ', transferCID)
        const _cid = CID.parse(transferCID);

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
        const cid = CID.parse(transferCID)

        // query ipfs for the json of the transfer
        const json = await kubo.dag.get(cid);

        // set field with returned values
        setTransferedEgg(json.value);
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kubo, kuboError, kuboStarting, transferCID])
  
  return { loading, transferCID, setTransferCID, transferedEgg, transferEgg, fetchTransferedEgg }
}