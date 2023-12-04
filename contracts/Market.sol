// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract Market {

using Roles for Roles.Role;

event MarketAdded (address indexed account);

Roles.Role private Market;

constructor() {
        _addMarket(msg.sender);
}

function addMarket(address account) public{
        _addMarket(account);
}


function _addMarket(address account) internal{
    Market.add(account);
    emit MarketAdded(account);
}
}