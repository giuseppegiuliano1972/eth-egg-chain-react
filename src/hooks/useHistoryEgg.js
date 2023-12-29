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
      try {
        setLoading(true)

        await gateway.getPastEvents('eggPacked', {
          filter: {_owner: selected},
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(async function(events){
          let history = []
          for (const event of events) {
            // compress following into a function
            const bytes = web3.utils.hexToBytes((event.topics[2]).toString());
            const digest = new Uint8Array(34);
            digest.set([18, 32])
            digest.set(bytes, 2)
            const cid = CID.create(1, 0x71, {bytes: digest })
            history.push(cid.toString())
          }

          if(history.length < 1) history.push("This account hasn't packed any eggs. Select another account from the top.")

          setHistoryEgg(history)
        })

        setLoading(false)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, selected, gateway, web3Error, web3Starting])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])
  
  return { loading, historyEgg, fetchHistory }
}