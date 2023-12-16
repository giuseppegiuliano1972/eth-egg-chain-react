const ManageEgg = artifacts.require('ManageEgg');

contract('ManageEgg', (accounts) => {
  let manageEggInstance;

  beforeEach(async () => {
    manageEggInstance = await ManageEgg.new({ from: accounts[0] });
  });

  describe('Egg lifecycle', () => {
    it.only("test on fetchData()", async () => {
      // account 0 should pack egg product with id 1 with notes left empty and price equal to a number
      // for the purpose of this test: account 0 is the farmer and he packages his own eggs
      id = 1
      note = "";
      price = 25;
      tot_eggs = 20;
      
      await manageEggInstance.getAndPackEggs(id, accounts[0],  note, price, tot_eggs, { from: accounts[0] });

      let egg = await manageEggInstance.fetchData(1);

      console.log(egg.price.toNumber());
      console.log(egg.totalEggsInPackage.toNumber());

      //console.log(JSON.stringify(egg));

      
      
      
      assert.equal(egg._id.toNumber(), id, 'Egg ID should be recorded correctly');
      assert.equal(egg.ownerID, accounts[0], 'Owner should be recorded correctly');
      assert.equal(egg.farmerAddr, accounts[0], 'FarmerAddress should be recorded correctly');
      assert.equal(egg.note, note, 'Egg notes should be equal to note value');
      assert.equal(egg.price.toNumber(), price, 'Egg price should be recorded correctly');
      assert.equal(egg.totalEggsInPackage.toNumber(), tot_eggs, 'Total number of eggs should be recorded correctly');



  });
    it("should allow account 1 to be a farmer", async () => {
        await manageEggInstance.addFarmer(accounts[1], { from: accounts[0] });
    
        const isAccount1Farmer = await manageEggInstance.isFarmer(accounts[1]);
        assert.isTrue(isAccount1Farmer, "Account 1 dovrebbe essere un farmer");
    
        // Verifica per un altro account che non dovrebbe essere un farmer
        const isAccount2Farmer = await manageEggInstance.isFarmer(accounts[2]);
        assert.isFalse(isAccount2Farmer, "Account 2 non dovrebbe essere un farmer");
    });
    it('should pack eggs correctly', async () => {
        await manageEggInstance.addFarmer(accounts[2], { from: accounts[0] }); 
        
        await manageEggInstance.getAndPackEggs(1, accounts[2],  "Note A", web3.utils.toWei('0.01', 'ether'), 100, { from: accounts[2] });
        let egg = await manageEggInstance.fetchData(1);
        
        assert.equal(egg._id.toNumber(), 1, 'Egg ID should be recorded correctly');
        assert.equal(egg.ownerID, accounts[2], 'Owner should be recorded correctly');
       // assert.equal(egg.farm, "Farm A", 'Farm should be recorded correctly');
        assert.equal(egg.eggState, 0, 'Egg should be in "Packed" state');
        // Add more assertions as needed
    });
    it('test deliverToMarket', async () => {
        // add farmer for this test
        await manageEggInstance.addFarmer(accounts[2], { from: accounts[0] }); 
        // add deliver for this test
        await manageEggInstance.addDeliver(accounts[3], { from: accounts[0] });
        // add market for this test
        await manageEggInstance.addMarket(accounts[1], { from: accounts[0] }); 

        // package eggs first
        await manageEggInstance.getAndPackEggs(1, accounts[2],  "Note A", web3.utils.toWei('0.01', 'ether'), 56, { from: accounts[2] });
        
        await manageEggInstance.toDistributor(1, accounts[3], { from: accounts[2] });
        let egg = await manageEggInstance.fetchData(1);

        console.log(egg.eggState.toString()); // 1 = Delivered

        assert.equal(egg.eggState, 1, "Egg should be in Delivered State first");
        assert.equal(egg.deliveryAddr, accounts[3], "The delivery address should be a correct delivery address");

        await manageEggInstance.deliverToMarket(1, accounts[1], { from: accounts[3] });
        egg = await manageEggInstance.fetchData(1); // egg.state = 3

        console.log(egg.eggState.toString()); // 3 = Market

        assert.equal(egg.eggState, 3, "Egg state should be MarketArrived");
        assert.equal(egg.marketAddr, accounts[1], "Egg marketAddress should be a correct market address");

    });
    it('test Food Factory Buy Eggs', async () => {
      // add farmer for this test
      await manageEggInstance.addFarmer(accounts[1], { from: accounts[0] }); 
      // add deliver for this test
      await manageEggInstance.addDeliver(accounts[2], { from: accounts[0] });
      // add food factory for this test
      await manageEggInstance.addFoodFactory(accounts[3], { from: accounts[0] }); 

      // package eggs first
      await manageEggInstance.getAndPackEggs(1, accounts[1], "Note A", web3.utils.toWei('0.01', 'ether'), 56, { from: accounts[1] });
      
      await manageEggInstance.toDistributor(1, accounts[2], { from: accounts[1] });
      let egg = await manageEggInstance.fetchData(1);
      console.log(egg);

      console.log(egg.eggState.toString()); // 1 = Delivered

      assert.equal(egg.eggState, 1, "Egg should be in Delivered State first");
      assert.equal(egg.deliveryAddr, accounts[2], "The delivery address should be a correct delivery address");

      let balance = await web3.eth.getBalance(accounts[3]);
      console.log("Balance:" , balance);
      console.log(egg.farmerAddr.toString());

      console.log("Addr Food Factory: ", egg.foodFactoryAddr.toString());

      await manageEggInstance.deliverToFoodFactory(1, accounts[3], {from: accounts[2]});

      await manageEggInstance.buyFoodFactory(1, web3.utils.toWei('0.01', 'ether'), { from: accounts[3], value:  web3.utils.toWei('0.01', 'ether'), gas: 1000000});
      egg = await manageEggInstance.fetchData(1); // egg.state = 3

      console.log(egg.eggState.toString()); // 2 = 

      //assert.equal(egg.eggState, 2, "Egg state should be FoodFactoryBought");
      //console.log(egg.foodFactoryAddr.toString());
      //console.log(accounts[3].toString());
      assert.equal(egg.foodFactoryAddr, accounts[3], "Egg FoodFactory Address should be a correct FoodFactory address");

  });
  it('test Consumer Buy Eggs', async () => {
    // add farmer for this test
    await manageEggInstance.addFarmer(accounts[1], { from: accounts[0] }); 
    // add deliver for this test
    await manageEggInstance.addDeliver(accounts[2], { from: accounts[0] });
    // add market for this test
    await manageEggInstance.addMarket(accounts[3], { from: accounts[0] }); 
    // add market for this test
     await manageEggInstance.addConsumer(accounts[4], { from: accounts[0] }); 

    // package eggs first
    await manageEggInstance.getAndPackEggs(1, accounts[1],  "Note A", web3.utils.toWei('0.01', 'ether'), 56, { from: accounts[1] });
    
    await manageEggInstance.toDistributor(1, accounts[2], { from: accounts[1] });
    let egg = await manageEggInstance.fetchData(1);

    console.log(egg.eggState.toString()); // 1 = Delivered

    assert.equal(egg.eggState, 1, "Egg should be in Delivered State first");
    assert.equal(egg.deliveryAddr, accounts[2], "The delivery address should be a correct delivery address");

    await manageEggInstance.deliverToMarket(1, accounts[3] , { from: accounts[2] });
    egg = await manageEggInstance.fetchData(1);
    
    assert.equal(egg.eggState, 3, "Egg should be in Arrived in the market");

    await manageEggInstance.marketForSale(1, egg.marketAddr,  web3.utils.toWei('0.01', 'ether'), 56, { from: accounts[3] });
    egg = await manageEggInstance.fetchData(1);
    assert.equal(egg.eggState, 5, "Egg should be in market for sale");


    await manageEggInstance.buyConsumer(1, web3.utils.toWei('0.01', 'ether'), { from: accounts[4], value:  web3.utils.toWei('0.01', 'ether'), gas: 1000000});
    egg = await manageEggInstance.fetchData(1); 

    console.log(egg.eggState.toString()); 

    assert.equal(egg.eggState, 6, "Egg state should be bought from a consumer");
    assert.equal(egg.consumerAddr, accounts[4], "Egg consumer Address should be a correct consumer address");

  });
  // Add more describe blocks for different functionalities
  });

});