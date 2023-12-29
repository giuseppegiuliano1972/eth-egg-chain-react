import { useContext } from 'react'
import { Web3Context } from '../provider/Web3Provider'

export const useWeb3 = () => {
  const { web3, accounts, selected, setSelected, gateway, error, starting } = useContext(Web3Context)
  return { web3, accounts, selected, setSelected, gateway, error, starting }
}