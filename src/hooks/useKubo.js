import { useContext } from 'react'
import { KuboContext } from '../provider/KuboProvider'

export const useKubo = () => {
  const { kubo, error, starting } = useContext(KuboContext)
  return { kubo, error, starting }
}