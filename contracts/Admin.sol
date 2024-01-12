// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title Admin
 * @dev Library for managing requests for adding nodes
 */
contract Admin {
  // Roles contract
  address owner;
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

  // set owner when the contract is created
  /*constructor(address _owner) {
    owner = _owner;
  }*/

  modifier onlyRoles() {
    require(msg.sender == owner, "Only Roles contract can call this function");
    _;
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

  function requestApprove(address requester, Role role) external onlyRoles {
    // just add role to mapping
    currentRole[requester] = role;

    // emit event
    emit approveRequest(requester, role);
  }

}