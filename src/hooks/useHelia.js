import { useContext } from 'react'
import { HeliaContext } from '../provider/HeliaProvider'

export const useHelia = () => {
  const { helia, dj, error, starting } = useContext(HeliaContext)
  return { helia, dj, error, starting }
}