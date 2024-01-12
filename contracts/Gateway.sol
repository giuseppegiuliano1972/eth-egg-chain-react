// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import "./ManageEgg.sol";
import "./Admin.sol";


contract Gateway is ManageEgg(), Admin() {
  constructor()  payable{

  }

 // function kill() public onlyOwner{
 //   selfdestruct(msg.sender);
 // }

 // function transferOwner(address newOwner) public onlyOwner{
 //   transferOwnership(newOwner);
 // }
}
