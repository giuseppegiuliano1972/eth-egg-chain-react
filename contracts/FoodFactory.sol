// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;


import './Roles.sol';

contract FoodFactory {

using Roles for Roles.Role;

event FoodFactoryAdded (address indexed account);

Roles.Role private FoodFactoryRole;

constructor() {
        addFoodFactory(msg.sender);
}

modifier onlyFoodFactory(){
        require(isFoodFactory(msg.sender), 'Not a Food Factory');
        _;
}

function isFoodFactory(address account) public view returns(bool){
        return FoodFactoryRole.has(account);
}

function addFoodFactory(address account) internal{
    FoodFactoryRole.add(account);
    emit FoodFactoryAdded(account);
}
}