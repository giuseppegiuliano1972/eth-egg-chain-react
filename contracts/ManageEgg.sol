// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;

import "./Admin.sol";

contract ManageEgg is Admin{
    address chickenOwner;

     enum State{
        Default, //0
        Packed, //1
        Delivered, //2
        FactoryBought, //3
        MarketArrived, //4
        FoodFactoryArrived, //5
        MarketForSale, //6
        ConsumerBought //7
     }

    // mapping for current egg states
    mapping(bytes32 => State) eggState;
    // mapping for current egg owner
    mapping(bytes32 => address) eggOwner;
    // mapping for current genesis egg owner
    mapping(bytes32 => address) eggFarmer;

    event FactoryBought(address indexed _from, address indexed _to, uint amount, uint balance);
    event ConsumerBought(address indexed _from, address indexed _to, uint amount, uint balance);
    

    constructor()  payable{
        chickenOwner = msg.sender;
    }

    
    // Event emitted after the initial packaging of the egg
    event eggPacked(address indexed owner, bytes32 indexed _hash);

    // Wrapper Function that emits event eggPacked
    function packEgg(address owner, bytes32 _hash) public {
        // Check if the caller is the same farmer as the one declared
        require(msg.sender == owner, "The Farmer Address should be equal to the user address");
        // Check if caller is a farmer
        require(isFarmer(owner), "The Farmer Address should be an existing farmer address");
        // Check if egg is already in the ledger
        require(eggState[_hash] == State.Default, "The egg already exists!");
        // Change state to packed
        eggState[_hash] = State.Packed;
        // Change owner to caller
        eggOwner[_hash] = owner;
        // Set genesis owner to caller
        eggFarmer[_hash] = owner;

        emit eggPacked(owner, _hash);
    }

    // Wrapper Function that emits event eggPacked
    function packMarketEgg(address owner, bytes32 original, bytes32 _hash) public {
        
        // Check if the owner is the same farmer in the written address
        require(msg.sender == owner, "The Market Address should be equal to the caller address");
        // Could be costly, maybe use has
        require(isMarket(owner), "The Market Address should be an existing market address");
        // Require that egg exists
        require(eggState[original] != State.Default, "Egg is not on the chain");
        // Check state of egg to be market arrived
        require(eggState[original] == State.MarketArrived, "The egg state is not MarketArrived");
        
        // Change state to market for sale
        eggState[original] = State.MarketForSale;
        // Change owner to caller
        eggOwner[original] = owner;

        emit eggPacked(owner, _hash);
    }

    // Events emitted after egg moves to another node
    // Split into two because we can read at most three arguments in event log
    event eggTransfer(bytes32 indexed transfer, bytes32 indexed _hash, State indexed state);
    event eggTransaction(address indexed seller, address indexed buyer, bytes32 indexed transfer);

    // Wrapper Function that emits event eggTransfer
    // Can work for any transfer since data is stored in ipfs
    function transferEgg(address sender, address receiver, bytes32 transfer, bytes32 _hash) public {
        // Require sender is the caller
        require(msg.sender == sender, "The sender should be the transaction caller");
        // Require that egg exists
        require(eggState[_hash] != State.Default, "Egg is not on the chain");
        // Require sender is current owner
        require(sender == eggOwner[_hash], "Sender should own the egg");

        State state = State.Default;
        // Act depending on egg state
        if(eggState[_hash] == State.Packed) {
            // Require sender and receiver to be correct
            require(isFarmer(sender), "Sender should be farmer");
            require(isDeliver(receiver), "Receiver should be deliverer");
            // Change egg state
            state = State.Delivered;
        }
        if(eggState[_hash] == State.Delivered) {
            // Require sender and receiver to be correct
            require(isDeliver(sender), "Sender should be deliverer!");
            require(isFoodFactory(receiver)||isMarket(receiver), "Receiver should be either food factory or market");
            // Change egg state in case of factory
            if(isFoodFactory(receiver)) state = State.FoodFactoryArrived;
            // Change egg state in case of market
            if(isMarket(receiver)) state = State.MarketArrived;
        }
      
        
        // Require change of state and set new state
        require(state != State.Default, "Sender and Receiver roles are not compatible for a transfer");
        eggState[_hash] = state;
        // Set new owner
        eggOwner[_hash] = receiver;

        // emit the events to retrieve transactions
        emit eggTransfer(transfer, _hash, state);
        emit eggTransaction(sender, receiver, transfer);
    }

       function buyEgg(address payable seller, address payable buyer, bytes32 transfer, bytes32 _hash, uint price) payable external {
        
        // Require sender is the caller
        require(msg.sender == buyer, "The buyer should be the transaction caller");
        // Require that egg exists
        require(eggState[_hash] != State.Default, "Egg is not on the chain");
        
        State state = State.Default;
        // Act depending on egg state
      
        if(eggState[_hash] == State.MarketForSale) {

            // Require Seller is current owner
            require(seller == eggOwner[_hash], "Seller should own the egg");

            // Require sender and receiver to be correct
            require(isMarket(seller), "Seller should be a market");
            require(isConsumer(buyer), "Buyer should be a consumer");
            //check the consumer balance
            require(price <= buyer.balance, "Insufficient balance");
            // Change egg state
            state = State.ConsumerBought;

            bool sent = payable(seller).send(price);
            require(sent, "Failed to send Ether");

            emit ConsumerBought(buyer, seller, price, buyer.balance);
        }

        if(eggState[_hash] == State.FoodFactoryArrived) {

            // Require Buyer is current owner
            require(buyer == eggOwner[_hash], "Buyer should own the egg");

            // Require sender and receiver to be correct
            require(isFarmer(seller), "seller should be Farmer");
            require(isFoodFactory(buyer), "buyer should be Food Factory");

            require(price <= buyer.balance, "Insufficient balance");

            // Require that Seller is the original farmer for the egg
            require(eggFarmer[_hash] == seller, "Seller should be the farmer that packed this egg");

            // Change egg state
            state = State.FactoryBought;

            bool sent = payable(seller).send(price);
            require(sent, "Failed to send Ether");



            emit FactoryBought(buyer, seller, price, buyer.balance);
        }
        
        // Require change of state and set new state
        require(state != State.Default, "Seller and Buyer roles are not compatible for a transfer");
        eggState[_hash] = state;
        // Set new owner
        eggOwner[_hash] = buyer;

        // emit the events to retrieve transactions
        emit eggTransfer(transfer, _hash, state);
        emit eggTransaction(seller, buyer, transfer);
    }
   
}