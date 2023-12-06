import web3 from "./web3";
import Gateway from "../abi/Gateway.json";
const instance = new web3.eth.Contract(
  Gateway.abi,
  "0x5A7085c253BA31484347Bd25796f7fd0B75FFb20"
);
export default instance;
