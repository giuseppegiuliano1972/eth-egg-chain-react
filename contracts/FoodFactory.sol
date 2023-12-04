// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract FoodFactory {

using Roles for Roles.Role;

event FoodFactoryAdded (address indexed account);

Roles.Role private FoodFactory;

constructor() {
        _addFoodFactory(msg.sender);
}

function addFoodFactory(address account) public{
        _addFoodFactory(account);
}


function _addFoodFactory(address account) internal{
    FoodFactory.add(account);
    emit FoodFactoryAdded(account);
}
}