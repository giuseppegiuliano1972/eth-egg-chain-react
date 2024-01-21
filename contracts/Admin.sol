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

  // Possible roles
  enum Role {
    None, //0
    Farmer, //1
    Deliver,  //2
    FoodFactory,  //3
    Market, //4
    Consumer  //5
  }

  // Admin of the contract
  address admin;
  // Map addresses to roles
  mapping(address => Role) currentRole;

  // Set admin at creation
  constructor() {
    admin = msg.sender;
  }

  /// Request event with the address of the requester and the desired role
  /// @param requester address of the applicant
  /// @param role uint8 of the desired role
  event addRequest(address indexed requester, Role indexed role);

  /// Error for handling wrong sender
  /// @param sender address of the function caller
  /// @param required address given as input
  error InvalidSender(address sender, address required, string message);

  /// Error for handling already registered account
  /// @param current uint8 current role
  /// @param requested uint8 requested role
  error InvalidRole(Role current, Role requested, string message);

  /// Wrapper function for addRequest event
  /// Checks if request is valid and emits the event
  function requestAdd(address requester, Role role) public {
    // Check if sender is requester
    if (msg.sender != requester) revert InvalidSender({
      sender: msg.sender,
      required: requester,
      message: "Invalid sender"
    });
    // Check if given role is valid
    if (role > Role.Consumer) revert InvalidRole({
      current: currentRole[requester],
      requested: role,
      message: "Invalid Role"
    });
    // Check if requester is already registered
    if (currentRole[requester] != Role.None) revert InvalidRole({
      current: currentRole[requester],
      requested: role,
      message: "You already have a role"
    });
    
    // If everything is good emit event
    emit addRequest(requester, role);
  }
  
  /// Event emitted when a request was approved
  /// @param requester address of the applicant
  /// @param role uint8 of the approved role
  event approveRequest(address indexed requester, Role indexed role);

  /// Wrapper function for approveRequest event
  /// Checks if sender is the admin and emits the event
  function requestApprove(address requester, Role role) public {
    // Verify that sender is admin
    if (admin != msg.sender) revert InvalidSender({
      sender: msg.sender,
      required: admin,
      message: "You are not authorized"
    });
    // Add role to mapping
    currentRole[requester] = role;

    // Call the correct adder
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

    // If sender is admin then emit event
    emit approveRequest(requester, role);
  }

}