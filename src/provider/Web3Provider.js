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
  accounts: null,
  gateway: null,
  error: false,
  starting: true
})

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [gateway, setGateway] = useState(null)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState(null)

  const startWeb3 = useCallback(async () => {
    if (web3) {
      console.info('web3 already started')
    // CAN BE IMPROVED BY PUTTING THE FUNCTIONS OUTSIDE
    /*} else if (window.web3) {
      console.info('found a windowed instance of web3, populating ...')
      //setWeb3(new Web3(window.ethereum))
      setWeb3(window.web3)
      setAccounts(await web3.eth.getAccounts())
      setGateway(new web3.eth.Contract(
        Gateway.abi,
        "0x3a3a91BDE5f593453BB6F231690df66487a400BB"
      ))
      setStarting(false)*/
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
        const _web3 = await createWeb3()
        //const _gateway = await createGateway(_web3)
        const _gateway = await createGateway(_web3)
        
        setWeb3(_web3)
        setAccounts(await _web3.eth.getAccounts())
        setGateway(_gateway)
        setStarting(false)
      } catch (e) {
        console.error(e)
        setError(true)
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