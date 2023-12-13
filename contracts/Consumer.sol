// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Consumer {

using Roles for Roles.Role;

event ConsumerAdded (address indexed account);

Roles.Role private ConsumerRole;

constructor() {
        _addConsumer(msg.sender);
}

modifier onlyConsumer(){
        require(isConsumer(msg.sender), 'Not a Consumer');
        _;
}

function isConsumer(address account) public view returns(bool){
        return ConsumerRole.has(account);
}


function addConsumer(address account) public{
        _addConsumer(account);
}


function _addConsumer(address account) internal{
    ConsumerRole.add(account);
    emit ConsumerAdded(account);
}
}