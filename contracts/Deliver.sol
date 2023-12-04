// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Deliver{

using Roles for Roles.Role;

event DeliverAdded (address indexed account);

Roles.Role private Deliver;

constructor() {
        _addDeliver(msg.sender);
}

function addDeliver(address account) public{
        _addDeliver(account);
}


function _addDeliver(address account) internal{
    Deliver.add(account);
    emit DeliverAdded(account);
}
}