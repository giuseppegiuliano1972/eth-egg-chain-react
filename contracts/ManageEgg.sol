

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
        address payable foddFactoryAddr;
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


    function getAndPackEggs(uint idEgg, address farmerEggAddr, string memory farmFrom, uint totEggs) public onlyFarmer{
        eggProduct[idEgg] = EggProduct({
            id : idEgg,
            ownerID: payable(msg.sender),
            farmerAddr: farmerEggAddr,
            farm: farmFrom,
            note: "",
            price: 0,
            totalEggsInPackage: totEggs,
            eggState: State.Packed,
            deliveryAddr: address(0),
            marketAddr: address(0),
            foddFactoryAddr: payable(address(0)),
            consumerAddr: payable(address(0))
        });

        id  = id + 1;
        emit Packed(idEgg);
    }

}