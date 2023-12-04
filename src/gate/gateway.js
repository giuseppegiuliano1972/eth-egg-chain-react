import web3 from "./web3";
import Gateway from "../abi/Gateway.json";
const instance = new web3.eth.Contract(
  Gateway.abi,
  "0x0103d29c464A350e66FaBdb01fD5F2Db9Abb02cA"
);
export default instance;
