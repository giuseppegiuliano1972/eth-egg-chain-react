// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Deliver{

using Roles for Roles.Role;

event DeliverAdded (address indexed account);

Roles.Role private DeliverRole;

constructor() {
        _addDeliver(msg.sender);
}

function addDeliver(address account) public{
        _addDeliver(account);
}

modifier onlyDeliver(){
        require(isDeliver(msg.sender), 'Not a Deliver');
        _;
}

function isDeliver(address account) public view returns(bool){
        return DeliverRole.has(account);
}

function _addDeliver(address account) internal{
    DeliverRole.add(account);
    emit DeliverAdded(account);
}
}