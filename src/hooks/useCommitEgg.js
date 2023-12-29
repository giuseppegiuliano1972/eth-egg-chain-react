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

  const commitEgg = useCallback(async (json) => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true);

        // Add input validation

        // add egg as a dag json to ipfs
        const cid = await kubo.dag.put(json);

        // convert to string and set cid
        setCidString(cid.toString())

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
        setLoading(false)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kuboError, kuboStarting, kubo])

  const fetchCommittedEgg = useCallback(async () => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        setLoading(true)

        console.log('Fetching: ', cidString)
        const _cid = CID.parse(cidString);

        // Get all events involving the egg
        // eventually handle multiple results
        await gateway.getPastEvents('eggPacked', {
          filter: {_hash: web3.utils.bytesToHex(_cid.multihash.digest)},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(function(events){
          for (const event of events) {
            const address = web3.eth.abi.decodeParameter('address', event.topics[1])
            console.log('Owner: ', address);
          }
        })

        // convert from string to CID format
        const cid = CID.parse(cidString)

        // query ipfs for the json of the egg
        const json = await kubo.dag.get(cid);

        // set field with returned values
        setCommittedEgg(json.value);

        setLoading(false)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, web3Error, web3Starting, kubo, kuboError, kuboStarting, cidString])
  
  return { loading, cidString, setCidString, committedEgg, commitEgg, fetchCommittedEgg }
}