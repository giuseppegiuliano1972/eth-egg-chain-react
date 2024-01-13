import { useState, useCallback, useEffect } from 'react'
import { useWeb3 } from './useWeb3'

export const useAdmin = () => {
  // eslint-disable-next-line no-unused-vars
  const { web3, accounts, selected, gateway, web3Error, web3Starting } = useWeb3()
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])

  // Function to show incoming requests for admission
  const fetchRequests = useCallback(async () => {
    if (!web3Error && !web3Starting && gateway!=null) {
      var _requests = []
      var _approved = []
      var promise1;
      var promise2;
      try {
        setLoading(true)

        promise1 = await gateway.getPastEvents('addRequest', {
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(async function(events){
          for (const event of events) {
            // parse event arguments
            const account = web3.eth.abi.decodeParameter('address', event.topics[1])
            const role = web3.eth.abi.decodeParameter('uint8', event.topics[2])
            _requests.push([account, role])
          }
        })

        promise2 = await gateway.getPastEvents('approveRequest', {
          fromBlock: 0,
          toBlock: 'latest'
        }, function(error, events) {
          console.error(error);
          console.log(events);
        }).then(async function(events){
          for (const event of events) {
            // parse event arguments
            const account = web3.eth.abi.decodeParameter('address', event.topics[1])
            const role = web3.eth.abi.decodeParameter('uint8', event.topics[2])
            _approved.push([account, role])
          }
        })
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([promise1, promise2]).then(() => {
          const difference = _requests.filter(r => !_approved.some(a => r[0]===a[0]))
          if(difference.length < 1) { difference.add(["There are no new requests.", ""]); }
          setRequests([...new Set(difference)])
        })
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, gateway, web3Error, web3Starting])

  const approveRequest = useCallback(async (account, role) => {
    if (!web3Error && !web3Starting && gateway!=null && accounts!=null) {
      try {
        setLoading(true)

        if(role !== 0) await gateway.methods['requestApprove'](account, role).send({
          from: accounts[0],
        }).on('confirmation', function(confirmation, receipt){
          // Put here any feedback on transaction result
          console.log("Transaction confirmed!");
        })
        .on('error', function(error, receipt){
          console.error(error);
        });
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, gateway, web3Error, web3Starting])

  useEffect(() => {
    fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway])
  
  return { loading, requests, approveRequest }
}