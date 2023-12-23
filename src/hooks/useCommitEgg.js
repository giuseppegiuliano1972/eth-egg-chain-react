/* eslint-disable no-console */

import { useState, useCallback } from 'react'
import { useHelia } from '../hooks/useHelia'
import { useWeb3 } from '../hooks/useWeb3'
// In progress: adding web3

import { CID } from 'multiformats/cid'

export const useCommitEgg = () => {
  const { helia, dj, heliaError, heliaStarting } = useHelia()
  const { web3, accounts, gateway, web3Error, web3Starting } = useWeb3()
  const [cidString, setCidString] = useState('')
  const [committedEgg, setCommittedEgg] = useState({})

  const commitEgg = useCallback(async (json) => {
    if (!heliaError && !heliaStarting && !web3Error && !web3Starting) {
      try {
        const cid = await dj.add(
          json,
          helia.blockstore
        )
        setCidString(cid.toString())

        //accounts = await web3.eth.getAccounts()
        await gateway.methods.packEgg(json.address, cid.toString())
                                .send({from: json.address})
                                .on('confirmation', function(confirmation, receipt){
                                  console.log("Transaction confirmed!");
                                })
                                .on('error', function(error, receipt){
                                  console.error(error);
                                });
        console.log('Added egg with CID:', cid.toString())
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for helia and web3 to start')
    }
  }, [heliaError, heliaStarting, helia, dj])

  const fetchCommittedEgg = useCallback(async () => {
    let json = {}
    if (!heliaError && !heliaStarting && !web3Error && !web3Starting) {
      try {
        console.log('Fetching1902: ', cidString)
        await gateway.getPastEvents('eggPacked', {
          filter: {_hash: cidString},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(function(events){
          console.log('Owner: ', events[0].topics[1]);
        })

        const cid = CID.parse(cidString)
        json = await dj.get(cid)
        setCommittedEgg(json)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for helia and web3 to start')
    }
  }, [heliaError, heliaStarting, dj, cidString])
  
  return { cidString, setCidString, committedEgg, commitEgg, fetchCommittedEgg }
}