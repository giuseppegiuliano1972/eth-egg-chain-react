import { useState, useCallback, useEffect } from 'react'
import { useWeb3 } from './useWeb3'

export const useAdmin = () => {
  // eslint-disable-next-line no-unused-vars
  const { web3, accounts, selected, gateway, web3Error, web3Starting } = useWeb3()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Function to show incoming requests for admission
  const fetchRequests = useCallback(async () => {
    if (!web3Error && !web3Starting && gateway!=null) {
      var _requests = []
      var _approved = []
      var _refused = []
      var promise1, promise2, promise3;
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

        promise3 = await gateway.getPastEvents('refuseRequest', {
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
            _refused.push([account, role])
          }
        })
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([promise1, promise2, promise3]).then(() => {
          let set_of_requests = []
          for (const e of _requests) {
            //console.log(e);
            let count_a = 0;
            let count_b = 0;
            for (const a of _requests) {
              //console.log("a: ", a);
              if (e[0] == a[0] && e[1] == a[1]) count_a++;
            }
            for (const b of _refused) {
              //console.log("b: ", b);
              if (e[0] == b[0] && e[1] == b[1]) count_b++;
            }
            if (count_a > count_b) set_of_requests.push(e);
          }

          let difference = _requests.filter(r => !_approved.some(a => (r[0]===a[0] && r[1]===a[1])))
          if (difference === null) { difference = new Set(['','']); }
          // setRequests([...new Set(difference)])
          if (set_of_requests.length < 1) { set_of_requests = new Set(); }
          setRequests([...new Set(set_of_requests)])
        })
        setLoading(false)
      }
    } else {
      console.log('please wait for kubo and web3 to start')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, gateway, web3Error, web3Starting])

  const approveRequest = useCallback(async (account, role) => {
    if (!web3Error && !web3Starting && gateway!==null && accounts!==null) {
      try {
        setLoading(true)

        if(role !== 0) await gateway.methods['requestApprove'](account, role).send({
          from: selected,
        }).on('confirmation', function(confirmation, receipt){
          // Put here any feedback on transaction result
          console.log("Transaction confirmed!");
        })
        .on('error', function(error, receipt){
          setError(error);
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

  const refuseRequest = useCallback(async (account, role) => {
    if (!web3Error && !web3Starting && gateway!==null && accounts!==null) {
      try {
        setLoading(true)

        if(role !== 0) await gateway.methods['requestRefuse'](account, role).send({
          from: selected,
        }).on('confirmation', function(confirmation, receipt){
          // Put here any feedback on transaction result
          console.log("Transaction confirmed!");
        })
        .on('error', function(error, receipt){
          setError(error);
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
  
  return { requests, approveRequest, refuseRequest, loading, error }
}