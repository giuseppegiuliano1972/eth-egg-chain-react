// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import "./ManageEgg.sol";


contract Gateway is ManageEgg {
  address payable owner;

  constructor()  payable{
    owner = payable(msg.sender);
  }

  function kill() public {
        require(msg.sender == owner, "Only the contract owner can call this function");
         selfdestruct(owner);
  }

 // function transferOwner(address newOwner) public onlyOwner{
 //   transferOwnership(newOwner);
 // }
}
