// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Consumer {

using Roles for Roles.Role;

event ConsumerAdded (address indexed account);

Roles.Role private Consumer;

constructor() {
        _addConsumer(msg.sender);
}

function addConsumer(address account) public{
        _addConsumer(account);
}


function _addConsumer(address account) internal{
    Consumer.add(account);
    emit ConsumerAdded(account);
}
}