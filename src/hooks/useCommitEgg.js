/* eslint-disable no-console */

import { useState, useCallback } from 'react'
import { useKubo } from './useKubo'
import { useWeb3 } from '../hooks/useWeb3'
// In progress: adding web3

import { CID } from 'kubo-rpc-client'

export const useCommitEgg = () => {
  const { kubo, kuboError, kuboStarting } = useKubo()
  const { web3, accounts, gateway, web3Error, web3Starting } = useWeb3()
  const [cidString, setCidString] = useState('')
  const [committedEgg, setCommittedEgg] = useState({})

  const commitEgg = useCallback(async (json) => {
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        // add egg as a dag json to ipfs
        const cid = await kubo.dag.put(json);

        // convert to string and set cid
        setCidString(cid.toString())

        // register egg and handle outcome
        await gateway.methods.packEgg(json.address, cid.toString())
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
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
  }, [kuboError, kuboStarting, kubo])

  const fetchCommittedEgg = useCallback(async () => {
    let json = {}
    if (!kuboError && !kuboStarting && !web3Error && !web3Starting) {
      try {
        console.log('Fetching: ', cidString)

        // Get all events involving the egg
        // eventually handle multiple results
        await gateway.getPastEvents('eggPacked', {
          filter: {_hash: cidString},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(function(events){
          for (const event of events) {
            const address = event.topics[1].replace(/^(0x)0+((\w)+)$/, "$1$2");
            console.log('Owner: ', address);
          }
        })

        // convert from string to CID format
        const cid = CID.parse(cidString)

        // query ipfs for the json of the egg
        const json = await kubo.dag.get(cid);

        // set field with returned values
        setCommittedEgg(json.value);
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
  }, [kuboError, kuboStarting, cidString])
  
  return { cidString, setCidString, committedEgg, commitEgg, fetchCommittedEgg }
}