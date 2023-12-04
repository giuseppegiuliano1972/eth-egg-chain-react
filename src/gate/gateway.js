import web3 from "./web3";
import Gateway from "../abi/Gateway.json";
const instance = new web3.eth.Contract(
  Gateway.abi,
  "0xcAda99518DA34D6b79E985B42ebEA259E1A2eD0e"
);
export default instance;
