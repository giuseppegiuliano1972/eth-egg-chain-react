/* eslint-disable no-console */

import Web3 from 'web3'
import PropTypes from 'prop-types'
import {
  React,
  useEffect,
  useState,
  useCallback,
  createContext
} from 'react'

// Import gateway
import Gateway from "../abi/Gateway.json";

export const Web3Context = createContext({
  web3: null,
  accounts: [],
  selected: 'no accounts selected',
  setSelected: null,
  gateway: null,
  error: false,
  starting: true
})

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [selected, setSelected] = useState('no accounts selected')
  const [gateway, setGateway] = useState(null)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState(null)

  
  const startWeb3 = useCallback(async () => {
    let _web3, _gateway, _accounts
    if (web3) {
      console.info('web3 already started')
    } else if (window.ethereum) {
      try {
        console.info('found a windowed instance of web3, populating ...')

        const createWeb3 = (async () => {
          window.ethereum.on('accountsChanged', function (accounts) {
            setAccounts(accounts)
            setSelected(accounts[0])
          });
          return new Web3(window.ethereum);
        })
      
        const createGateway = (async (web3) => {
          const index = Object.keys(Gateway.networks).reduce((a,b) => a > b ? a : b);
          const contract_address = Gateway.networks[index].address;

          return new web3.eth.Contract(
            Gateway.abi,
            contract_address
          );
        })
        _web3 = await createWeb3()
        _gateway = await createGateway(_web3)
        _accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      } catch(e) {
        console.error(e)
        setError(true)
      } finally {
        setWeb3(_web3)
        setGateway(_gateway)
        setAccounts(_accounts)
        setSelected(_accounts[0])
        setStarting(false)
      }
    } else {
      try {
        console.info('Starting Web3')
        const createWeb3 = (async () => {
          return new Web3(Web3.givenProvider || "http://localhost:8545")
        })
        
        const createGateway = (async (web3) => {
          const index = Object.keys(Gateway.networks).reduce((a,b) => a > b ? a : b);
          const contract_address = Gateway.networks[index].address;

          return new web3.eth.Contract(
            Gateway.abi,
            contract_address
          );
        })
        _web3 = await createWeb3()
        _gateway = await createGateway(_web3)
        //_accounts = await _web3.eth.requestAccounts()
        
        _web3.on('accountsChanged', function (accounts) {
          setAccounts(accounts)
          setSelected(accounts[0])
        });
        setStarting(false)
      } catch (e) {
        console.error(e)
        setError(true)
      } finally {
        if(_web3) setWeb3(_web3)
        if(_gateway) setGateway(_gateway)
        if(_accounts) setAccounts(_accounts)
        if(_accounts) setSelected(_accounts[0])
        setStarting(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    startWeb3()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Web3Context.Provider
      value={{
        web3,
        accounts,
        selected,
        setSelected,
        gateway,
        error,
        starting
      }}
    >{children}</Web3Context.Provider>
  )
}

Web3Provider.propTypes = {
  children: PropTypes.any
}