// SPDX-License-Identifier: TFT-1.0.0

pragma solidity ^0.8.21;

import "./Farmer.sol";
import "./Deliver.sol";
import "./Consumer.sol";
import "./FoodFactory.sol";
import "./Market.sol";

contract ManageEgg is Farmer, Deliver, FoodFactory, Market, Consumer{
    address chickenOwner;

     uint id;
    
     enum State{
        Packed, //0
        Delivered, //1
        FactoryBought, //2
        MarketArrived, //3
        ConsumerBought //4
     }

    struct EggProduct  {
        uint id;
        address payable ownerID; 
        address payable farmerAddr;
        string farm;
        string note;
        uint price;
        uint totalEggsInPackage;
        State eggState;
        address deliveryAddr;
        address marketAddr;
        address payable foodFactoryAddr;
        address payable consumerAddr;
    }

    //  mapping egg product
    mapping(uint => EggProduct) eggProduct;
    // mapping for history eggs
    mapping(uint => string[]) eggHistory;

    event Packed(uint id);
    event Delivered(uint id);
    event FactoryBought(uint id);
    event MarketArrived(uint id);
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
            bool sent = eggProduct[_id].foodFactoryAddr.send(amountToReturn);
            require(sent, "checkAmountPaid Failed to send Ether");
        }
    }

    // Checks id  is packed
    modifier packed(uint _id){
        require(eggProduct[_id].eggState == State.Packed, 'Egg state is still not packed');
        _;
    }

    // Checks id  is delivered
    modifier isDelivered(uint _id){
        require(eggProduct[_id].eggState == State.Delivered, 'Egg state is still not delivered');
        _;
    }

    function getAndPackEggs
        (
        uint idEgg,
        address farmerEggAddr,
        string memory farmFrom,
        string memory strNote,
        uint eggPrice,
        uint totEggs
        ) public onlyFarmer {
        
        // Check if the owner is the same farmer in the written address
        require(msg.sender == farmerEggAddr, "The owner address should be equal to the farmer address");
        // Could be costly, maybe use has
        require(isFarmer(farmerEggAddr), "The farmerAddress should be an existing farmer address");

        eggProduct[idEgg] = EggProduct({
            id : idEgg,
            ownerID: payable(msg.sender),
            farmerAddr: payable(farmerEggAddr),
            farm: farmFrom,
            note: strNote,
            price: eggPrice,
            totalEggsInPackage: totEggs,
            eggState: State.Packed,
            deliveryAddr: address(0),
            marketAddr: address(0),
            foodFactoryAddr: payable(address(0)),
            consumerAddr: payable(address(0))
        });

        id  = id + 1;
        emit Packed(idEgg);
    }

    function toDistributor(uint idEgg, address deliveryAddr) public packed(idEgg) onlyFarmer() {
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

    function deliverToMarket(uint idEgg, address marketAddr) public onlyDeliver {
        // Could be costly, maybe use has
        require(isMarket(marketAddr), "The marketAddress should be an existing market address");

        EggProduct storage egg = eggProduct[idEgg];

        // Check if the owner is the distributor for this egg
        require(msg.sender == egg.deliveryAddr, "The owner should be the distributor for this egg");
        
        // requirement: eggState has to be equal to Delivered State
        require(egg.eggState == State.Delivered, "Egg has to be delivered first");

        // update the eggMarket address and change the state to marketArrived
        egg.marketAddr = marketAddr;
        egg.eggState = State.MarketArrived;
        
        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Delivered to Market");

        // Let's emit the event to save it on chain
        emit MarketArrived(idEgg);
    }

    function buyEggsFoodFactory(uint idEgg, uint price) public payable 
        onlyFoodFactory 
        isDelivered(idEgg) 
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
        //egg.farmerAddr.transfer(price);

        // Update eggHistory of the eggProduct
        eggHistory[idEgg].push("Bought by a Food Factory");

        // Let's emit the event to save it on chain
        emit FactoryBought(idEgg);
    }



    function fetchData(uint idEgg) public view returns 
        (
         uint _id,
         address ownerID, 
         address farmerAddr,
         string  memory farm,
         string  memory note,
         uint    price,
         uint    totalEggsInPackage,
         State   eggState,
         address deliveryAddr,
         address marketAddr,
         address foodFactoryAddr,
         address consumerAddr
        ){

        EggProduct memory egg = eggProduct[idEgg];

        _id = egg.id;
        ownerID = egg.ownerID;
        farmerAddr = egg.farmerAddr;
        farm = egg.farm;
        note = egg.note;
        price = egg.price;
        totalEggsInPackage = egg.totalEggsInPackage;
        eggState = egg.eggState;
        deliveryAddr = egg.deliveryAddr;
        marketAddr = egg.marketAddr;
        foodFactoryAddr = egg.foodFactoryAddr;
        consumerAddr = egg.consumerAddr;

        return 
            (
            _id,
            ownerID, 
            farmerAddr,
            farm,
            note,
            price,
            totalEggsInPackage,
            eggState,
            deliveryAddr,
            marketAddr,
            foodFactoryAddr,
            consumerAddr
            );
        
        
    }
}