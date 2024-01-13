// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import "./ManageEgg.sol";


contract Gateway is ManageEgg {
  constructor()  payable{

  }

 // function kill() public onlyOwner{
 //   selfdestruct(msg.sender);
 // }

 // function transferOwner(address newOwner) public onlyOwner{
 //   transferOwnership(newOwner);
 // }
}
