 // SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import "./ManageEgg.sol";


contract Gateway is ManageEgg {
  address payable owner;

  constructor()  payable{
    owner = payable(msg.sender);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");
    _;
  }

  // Function to deactivate the contract, it will need to be improved for production...
  function deactivateContract() public onlyOwner {
    selfdestruct(owner);
  }
}
