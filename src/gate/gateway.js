import web3 from "./web3";
import Gateway from "../abi/Gateway.json";
const instance = new web3.eth.Contract(
  Gateway.abi,
  "0x6936b163F13ae0d8eD1e4feEbF82e95946AfaAC0"
);
export default instance;
