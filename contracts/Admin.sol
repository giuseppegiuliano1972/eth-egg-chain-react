// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Farmer.sol";
import "./Deliver.sol";
import "./Consumer.sol";
import "./FoodFactory.sol";
import "./Market.sol";

/**
 * @title Admin
 * @dev Contract for managing requests for adding nodes
 */
contract Admin is Farmer, Deliver, FoodFactory, Market, Consumer{
  // Roles contract
  address admin;
  // Possible roles
  enum Role {
    None, //0
    Farmer, //1
    Deliver,  //2
    FoodFactory,  //3
    Market, //4
    Consumer  //5
  }
  // Map addresses to roles
  mapping(address => Role) currentRole;

  // Set admin at creation
  constructor() {
    admin = msg.sender;
  }

  // Request event with the address of the requester and the desired role
  event addRequest(address indexed requester, Role indexed role);

  error InvalidRole(Role current, Role requested);

  // Wrapper function for addRequest event
  // Checks if request is valid and emits the event
  function requestAdd(address requester, Role role) public {
    // check if sender is requester
    require(msg.sender == requester, "Request wasn't sent by given address");
    // check if requester is already in
    if (currentRole[requester] != Role.None) revert InvalidRole({
      current: currentRole[requester],
      requested: role
    });
    require(currentRole[requester] == Role.None, "Requester already has a role");
    // check if given role is valid
    require(role <= Role.Consumer, "Role is not valid");
    
    // if everything is good emit event
    emit addRequest(requester, role);
  }
  
  // Event emitted when a request was approved
  event approveRequest(address indexed requester, Role indexed role);

  error InvalidCaller(address caller);

  function requestApprove(address requester, Role role) public {
    if (admin!=msg.sender) revert InvalidCaller({
      caller: requester
    });
    // verify that sender is admin
    require(admin==msg.sender);
    // just add role to mapping
    currentRole[requester] = role;

    // Might be able do it faster if instead of role we get the contract
    if (role==Role.Farmer) {
      addFarmer(requester);
    }
    else if (role==Role.Deliver) {
      addDeliver(requester);
    }
    else if (role==Role.FoodFactory) {
      addFoodFactory(requester);
    }
    else if (role==Role.Market) {
      addMarket(requester);
    }
    else if (role==Role.Consumer) {
      addConsumer(requester);
    }

    // emit event
    emit approveRequest(requester, role);
  }

}