

import "./Farmer.sol";
import "./Deliver.sol";
import "./Consumer.sol";
import "./FoodFactory.sol";
import "./Market.sol";

contract ManageEgg is Farmer, Deliver, FoodFactory, Market, Consumer{
    address chickenOwner;

     uint id;
    
     enum State{
        Packed,
        Delivered,
        FactoryBought,
        MarketArrived,
        ConsumerBought
     }

    struct EggProduct  {
        uint id;
        address payable ownerID; 
        address farmerAddr;
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

    function getAndPackEggs
        (
        uint idEgg,
        address farmerEggAddr,
        string memory farmFrom,
        string memory strNote,
        uint eggPrice,
        uint totEggs
        ) public onlyFarmer {
        
        // Check if farmer is the owner
        require(msg.sender == farmerEggAddr);
        // Could be costly, maybe use has
        require(isFarmer(farmerEggAddr));

        eggProduct[idEgg] = EggProduct({
            id : idEgg,
            ownerID: payable(msg.sender),
            farmerAddr: farmerEggAddr,
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

    function toDistributor(uint idEgg, address deliveryAddr) public onlyFarmer() {
        EggProduct storage egg = eggProduct[idEgg];

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
        EggProduct storage egg = eggProduct[idEgg];
        
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