// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import "./Farmer.sol";
import "./Deliver.sol";
import "./Consumer.sol";
import "./FoodFactory.sol";
import "./Market.sol";

contract Gateway is Farmer,Deliver, Consumer,FoodFactory, Market{
  constructor()  payable{

  }

 // function kill() public onlyOwner{
 //   selfdestruct(msg.sender);
 // }

 // function transferOwner(address newOwner) public onlyOwner{
 //   transferOwnership(newOwner);
 // }
}
