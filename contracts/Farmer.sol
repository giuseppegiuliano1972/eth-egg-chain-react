// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Farmer{

using Roles for Roles.Role;

event FarmerAdded (address indexed account);

Roles.Role private Farmer;

constructor() {
        _addFarmer(msg.sender);
}

function addFarmer(address account) public{
        _addFarmer(account);
}


function _addFarmer(address account) internal{
    Farmer.add(account);
    emit FarmerAdded(account);
}
}