/* eslint-disable no-console */

import PropTypes from 'prop-types'
import {
  React,
  useEffect,
  useState,

  useCallback,
  createContext
} from 'react'

// import the client to call ipfs
import { create } from 'kubo-rpc-client'

export const KuboContext = createContext({
  kubo: null,
  error: false,
  starting: true
})

export const KuboProvider = ({ children }) => {
  const [kubo, setKubo] = useState(null)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState(null)

  const startKubo = useCallback(async () => {
    if (kubo) {
      console.info('kubo already started')
    } else if (window.kubo) {
      console.info('found a windowed instance of kubo, populating ...')
      setKubo(window.kubo)
      setStarting(false)
    } else {
      try {
        console.info('Starting the Kubo Client')

        const kubo = await create('/ip4/127.0.0.1/tcp/5001');

        setKubo(kubo)
        setStarting(false)
      } catch (e) {
        console.error(e)
        setError(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    startKubo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <KuboContext.Provider
      value={{
        kubo,
        error,
        starting
      }}
    >{children}</KuboContext.Provider>
  )
}

KuboProvider.propTypes = {
  children: PropTypes.any
}