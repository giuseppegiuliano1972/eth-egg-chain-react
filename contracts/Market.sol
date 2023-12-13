// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Market {

using Roles for Roles.Role;

event MarketAdded (address indexed account);

Roles.Role private MarketRole;

constructor() {
        _addMarket(msg.sender);
}

function addMarket(address account) public{
        _addMarket(account);
}

modifier onlyMarket(){
        require(isMarket(msg.sender), 'Not a Market');
        _;
}

function isMarket(address account) public view returns(bool){
        return MarketRole.has(account);
}


function _addMarket(address account) internal{
    MarketRole.add(account);
    emit MarketAdded(account);
}
}