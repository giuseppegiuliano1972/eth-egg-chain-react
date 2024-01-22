const { Web3 } = require('web3');
const Gateway = require('../src/abi/Gateway.json'); // Adjust the path to where your ABI is located
const index = Object.keys(Gateway.networks).reduce((a,b) => a > b ? a : b);
const contract_address = Gateway.networks[index].address;

// Connect to the local Ethereum node
var web3 = new Web3(new Web3.providers.HttpProvider(`http://127.0.0.1:8545`));

// The address of the contract you want to interact with
const contractAddress = contract_address;

// The ABI (Application Binary Interface) of the contract
const contractABI = Gateway.abi;

// The contract object
const contract = new web3.eth.Contract(contractABI, contractAddress);

// The address that will be interacting with the contract (change this manually everytime you need to test)
const fromAddress = '0x913Eab7B88d353740Ff91b8815Ba6c6961Dbb359';

// Function to deactivate the contract
async function deactivateContract() {
  try {
    // Estimate Gas
    const gas = await contract.methods.deactivateContract().estimateGas({
      from: fromAddress,
      to: contractAddress,
      data: contract.methods.deactivateContract().encodeABI()
    });
    
    // Prepare the transaction
    const tx = contract.methods.deactivateContract();

    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');

    // Sign the transaction with the private key
    const signedTx = await web3.eth.accounts.signTransaction({
      to: contractAddress,
      data: tx.encodeABI(),
      gas: gas,
      maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'), // Example priority fee
      maxFeePerGas: web3.utils.toWei('50', 'gwei'), // Example max fee
      nonce: nonce
    }, '0xcde96cdf601dae53b9c85d57231a1971a9c3ad46884ae9ff29de570199e20669'); // Replace with the actual private key

    // Send the transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction receipt:', receipt);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Call the function to deactivate the contract
deactivateContract();
