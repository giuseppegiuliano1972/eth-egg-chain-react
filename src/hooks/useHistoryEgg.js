import { useState, useCallback, useEffect } from 'react'
import { useWeb3 } from './useWeb3'

import { CID } from 'multiformats/cid'

export const useHistoryEgg = () => {
  // eslint-disable-next-line no-unused-vars
  const { web3, accounts, selected, gateway, web3Error, web3Starting } = useWeb3()
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [historyEgg, setHistoryEgg] = useState([])

  // Function to show all eggs of the account
  const fetchHistory = useCallback(async () => {
    if (!web3Error && !web3Starting && accounts !== null) {
      var history = []
      try {
        setLoading(true)

        await gateway.getPastEvents('eggPacked', {
          filter: {owner: selected},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(async function(events){
          for (const event of events) {
            // compress following into a function
            const bytes = web3.utils.hexToBytes((event.topics[2]).toString());
            const digest = new Uint8Array(34);
            digest.set([18, 32])
            digest.set(bytes, 2)
            const cid = CID.create(1, 0x71, {bytes: digest })
            history.push(cid.toString())
          }
        })

        await gateway.getPastEvents('eggTransaction', {
          filter: {buyer: selected},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(async function(events){
          for (const event of events) {
            // compress following into a function
            const bytes = web3.utils.hexToBytes((event.topics[2]).toString());
            const digest = new Uint8Array(34);
            digest.set([18, 32])
            digest.set(bytes, 2)
            const cid = CID.create(1, 0x71, {bytes: digest })
            history.push(cid.toString())
          }
        })
      } catch (e) {
        console.error(e)
      } finally {
        setHistoryEgg([...new Set(history)])
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, selected, gateway, web3Error, web3Starting])

  useEffect(() => {
    if(gateway!==null)
      fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])
  
  return { loading, historyEgg, fetchHistory }
}