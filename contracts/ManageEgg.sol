// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;

import "./Admin.sol";

contract ManageEgg is Admin{
    address chickenOwner;

     uint id;
    
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

    struct EggProduct  {
        uint id;
        address payable ownerID; 
        address payable farmerAddr;
        string note;
        uint price;
        uint marketPrice;
        uint totalEggsInPackage;
        uint totalEggsInMarketPackage;
        State eggState;
        address deliveryAddr;
        address payable marketAddr;
        address payable foodFactoryAddr;
        address payable consumerAddr;
        string heliaID;
    }

    //  mapping egg product
    mapping(uint => EggProduct) eggProduct;
    // mapping for history eggs
    mapping(uint => string[]) eggHistory;

    // mapping for current egg states
    mapping(bytes32 => State) eggState;
    // mapping for current egg owner
    mapping(bytes32 => address) eggOwner;

    event Packed(uint id);
    event Delivered(uint id);
    event FactoryBought(uint id);
    event MarketArrived(uint id);
    event MarketForSale(uint id);
    event FoodFactoryArrived(uint id);
    event ConsumerBought(uint id);
    

    constructor()  payable{
        chickenOwner = msg.sender;
        id = 1;
    }

    // Verifies the paid amount is sufficient to cover the price
    modifier enoughFunds(uint _id, uint eggPrice){
        uint _price = eggProduct[_id].price;
        require(eggPrice >= _price, 'Insufficient amount for egg price!');
        _;
    }

    // check what has been paied and refund
    modifier checkAmountPaid(uint _id, uint eggprice){
        _;
        uint _price = eggProduct[_id].price;
        if (eggprice > _price) { //paid more than the real price - refund
            uint amountToReturn = eggprice - _price;
            bool sent = payable(msg.sender).send(amountToReturn);
            require(sent, "checkAmountPaid Failed to send Ether");
        }
    }

    // Checks id  is packed
    modifier isPacked(uint _id){
        require(eggProduct[_id].eggState == State.Packed, 'Egg state is still not packed');
        _;
    }

    modifier isFoodFactoryArrived(uint _id){
        require(eggProduct[_id].eggState == State.FoodFactoryArrived, 'Egg state is still not arrived to Food Factory');
        _;
    }

    modifier isMarketForSale(uint _id){
        require(eggProduct[_id].eggState == State.MarketForSale, 'Egg state is still not Market For Sale');
        _;
    }

    // Checks id  is delivered
    modifier isDelivered(uint _id){
        require(eggProduct[_id].eggState == State.Delivered, 'Egg state is still not delivered');
        _;
    }

    modifier isMarketArrived(uint _id){
        require(eggProduct[_id].eggState == State.MarketArrived, 'Egg state is still not market arrived');
        _;
    }
    function getAndPackEggs
        (
        uint idEgg,
        address farmerEggAddr,
        string memory strNote,
        uint eggPrice,
        uint totEggs,
        string memory _heliaID
        ) public onlyFarmer {

        // Check if the egg is already in the ledger
        require(eggProduct[idEgg].ownerID == address(0), "This eggProduct already exists!");
        // Check if the price is <= 0
        require(eggPrice > 0, "EggPrice should be a positive number major than 0");
        // Check if the number of eggs is <= 0
        require(totEggs > 0, "The number of eggs should be a positive number major than 0");
        // Check if the owner is the same farmer in the written address
        require(msg.sender == farmerEggAddr, "The owner address should be equal to the farmer address");
        // Could be costly, maybe use has
        require(isFarmer(farmerEggAddr), "The farmerAddress should be an existing farmer address");

        eggProduct[idEgg] = EggProduct({
            id : idEgg,
            ownerID: payable(msg.sender),
            farmerAddr: payable(farmerEggAddr),
            note: strNote,
            price: eggPrice,
            marketPrice: 0,
            totalEggsInPackage: totEggs,
            totalEggsInMarketPackage: 0,
            eggState: State.Packed,
            deliveryAddr: address(0),
            marketAddr: payable(address(0)),
            foodFactoryAddr: payable(address(0)),
            consumerAddr: payable(address(0)),
            heliaID: _heliaID
        });

        id  = id + 1;
        emit Packed(idEgg);
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

        emit eggPacked(owner, _hash);
    }

    // Wrapper Function that emits event eggPacked
    function packMarketEgg(address owner, bytes32 _hash) public {
        
        // Check if the owner is the same farmer in the written address
        require(msg.sender == owner, "The Market Address should be equal to the user address");
        // Could be costly, maybe use has
        require(isMarket(owner), "The Market Address should be an existing market address");
        // Check state of egg to be market arrived
        require(eggState[_hash] == State.MarketArrived);
        
        // Change state to market for sale
        eggState[_hash] = State.MarketForSale;
        // Change owner to caller
        eggOwner[_hash] = owner;

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
        if(eggState[_hash] == State.MarketForSale) {
            // Require sender and receiver to be correct
            require(isMarket(sender), "Sender should be market");
            require(isConsumer(receiver), "Receiver should be consumer");
            // Change egg state
            state = State.ConsumerBought;
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

       function buyEgg(address payable seller, address payable buyer, bytes32 transfer, bytes32 _hash) public payable {
        // Require sender is the caller
        require(msg.sender == buyer, "The seller should be the transaction caller");
        // Require that egg exists
        require(eggState[_hash] != State.Default, "Egg is not on the chain");
        

        State state = State.Default;
        // Act depending on egg state
      
        if(eggState[_hash] == State.MarketForSale) {
            // Require Seller is current owner
            require(seller == eggOwner[_hash], "Seller should own the egg");

            // Require sender and receiver to be correct
            require(isMarket(seller), "Seller should be market");
            require(isConsumer(buyer), "Buyer should be consumer");
            // Change egg state
            state = State.ConsumerBought;
        }

        if(eggState[_hash] == State.FoodFactoryArrived) {
            // Require sender and receiver to be correct
            require(isFarmer(seller), "seller should be Farmer");
            require(isFoodFactory(buyer), "buyer should be Food Factory");

             require(msg.value <= buyer.balance, "Insufficient balance");

            // Change egg state
            state = State.FactoryBought;

            //bool sent = payable(seller).send(price);
            bool sent = payable(seller).send(msg.value);
            require(sent, "Failed to send Ether");
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

    function toDistributor(uint idEgg, address deliveryAddr) public isPacked(idEgg) onlyFarmer() {
        // Could be costly, maybe use has
        require(isDeliver(deliveryAddr), "The deliveryAddress should be an existing delivery address");

        EggProduct storage egg = eggProduct[idEgg];

        // Check if the owner is the farmer for this egg
        require(msg.sender == egg.farmerAddr, "The owner should be the farmer of this egg");

        // requirement: egg needs to be packed
        require(egg.eggState == State.Packed, "Egg has to be packed first");

        // add distributor address to egg details
        egg.deliveryAddr = deliveryAddr;

        // update egg status
        egg.eggState = State.Delivered;

        // add event to history
        eggHistory[idEgg].push("Taken by Distributor");

        // emit Delivered event
        emit Delivered(idEgg);
    }

    function deliverToMarket(uint idEgg, address marketAddr) public onlyDeliver isDelivered(idEgg){
        // Could be costly, maybe use has
        require(isMarket(marketAddr), "The marketAddress should be an existing market address");

        EggProduct storage egg = eggProduct[idEgg];

        // Check if the owner is the distributor for this egg
        require(msg.sender == egg.deliveryAddr, "The owner should be the distributor for this egg");
        
        // requirement: eggState has to be equal to Delivered State
        require(egg.eggState == State.Delivered, "Egg has to be delivered first");

        // update the eggMarket address and change the state to marketArrived
        egg.marketAddr = payable(marketAddr);
        egg.eggState = State.MarketArrived;
        
        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Delivered to Market");

        // Let's emit the event to save it on chain
        emit MarketArrived(idEgg);
    }

        function marketForSale
        (
        uint idEgg,
        address marketAddr,
        uint eggMarketPrice,
        uint totMarketEggs
        ) public onlyMarket
                 isMarketArrived(idEgg) {
        
        // Check if the owner is the same farmer in the written address
        require(msg.sender == marketAddr, "The owner address should be equal to the market address");
        // Could be costly, maybe use has
        require(isMarket(marketAddr), "The market Address should be an existing market address");

        EggProduct storage egg = eggProduct[idEgg];
        
        egg.marketAddr = payable(marketAddr);
        egg.eggState = State.MarketForSale;
        //egg.totalEggsInMarketPackage = totMarketEggs;
        // TODO queste vanno aggiornate in ipfs
        egg.totalEggsInPackage = totMarketEggs;
        egg.marketPrice = eggMarketPrice;

        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Market is selling eggs");

        emit MarketForSale(idEgg);
    }

    function deliverToFoodFactory(uint idEgg, address foodFactoryAddress) public 
        onlyDeliver 
        isDelivered(idEgg) 
        {
        // Could be costly, maybe use has
        require(isFoodFactory(foodFactoryAddress), "The food Factory Address should be an existing address");

        EggProduct storage egg = eggProduct[idEgg];

        // Check if the owner is the distributor for this egg
        require(msg.sender == egg.deliveryAddr, "The owner should be the distributor for this egg");
        
        // requirement: eggState has to be equal to Delivered State
        require(egg.eggState == State.Delivered, "Egg has to be delivered first");

        // update the eggMarket address and change the state to FoodFactoryArrived
        egg.foodFactoryAddr = payable(foodFactoryAddress);
        egg.eggState = State.FoodFactoryArrived;
        
        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Delivered to Food Factory");

        // Let's emit the event to save it on chain
        emit FoodFactoryArrived(idEgg);
    }

    function buyFoodFactory(uint idEgg, uint price) public payable 
        onlyFoodFactory 
        isFoodFactoryArrived(idEgg) 
        enoughFunds(idEgg, price) 
        checkAmountPaid(idEgg, price)  
        {

        EggProduct storage egg = eggProduct[idEgg];

        
        // update the foodFactory address and change the state to FactoryBought
        egg.foodFactoryAddr = payable(msg.sender);
        
        egg.ownerID = payable(msg.sender);
        egg.eggState = State.FactoryBought;
        bool sent = egg.farmerAddr.send(price);
        require(sent, "Failed to send Ether");

        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Bought by a Food Factory");

        // Let's emit the event to save it on chain
        emit FactoryBought(idEgg);
    }

   function buyConsumer(uint idEgg, uint price) public payable 
        onlyConsumer 
        isMarketForSale(idEgg) 
        enoughFunds(idEgg, price) 
        checkAmountPaid(idEgg, price)  
        {

        EggProduct storage egg = eggProduct[idEgg];
        
        // update the foodFactory address and change the state to FactoryBought
        egg.consumerAddr = payable(msg.sender);
        
        egg.ownerID = payable(msg.sender);
        egg.eggState = State.ConsumerBought;
        bool sent = egg.marketAddr.send(price);
        require(sent, "Failed to send Ether");

        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Bought by a Food Factory");

        // Let's emit the event to save it on chain
        emit ConsumerBought(idEgg);
    }


    function fetchData(uint idEgg) public view returns 
        (
         uint _id,
         address ownerID, 
         address farmerAddr,
         string  memory note,
         uint    price,
         uint    marketPrice,
         uint    totalEggsInPackage,
         uint    totalEggsInMarketPackage,
         State   eggstate,
         address deliveryAddr,
         address marketAddr,
         address foodFactoryAddr,
         address consumerAddr
        ){

        EggProduct memory egg = eggProduct[idEgg];

        _id = egg.id;
        ownerID = egg.ownerID;
        farmerAddr = egg.farmerAddr;
       // farm = ""; //egg.farm;
        note = egg.note;
        price = egg.price;
        marketPrice = egg.marketPrice;
        totalEggsInPackage = egg.totalEggsInPackage;
        totalEggsInMarketPackage = egg.totalEggsInMarketPackage;
        eggstate = egg.eggState;
        deliveryAddr = egg.deliveryAddr;
        marketAddr = egg.marketAddr;
        foodFactoryAddr = egg.foodFactoryAddr;
        consumerAddr = egg.consumerAddr;

       return 
            (
            _id,
            ownerID, 
            farmerAddr,
            note,
            price,
            marketPrice,
            totalEggsInPackage,
            totalEggsInMarketPackage,
            eggstate,
            deliveryAddr,
            marketAddr,
            foodFactoryAddr,
            consumerAddr
            );
        
        
    }
}