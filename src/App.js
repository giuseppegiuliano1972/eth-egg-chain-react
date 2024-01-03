import React, { Component } from 'react'
import Navbar from './component/navbar/Navbar';
import Account from './component/Account';
import Web3 from 'web3'
import AddNode from './component/AddNode'
import './App.css'
import FunctionalFetchData from './component/FunctionalFetchData'
import FunctionalFarmerPackEggs from './component/FunctionalFarmerPackEggs';
import MarketPackEggs from './component/MarketPackEggs';
import FunctionalTransferEggs from './component/FunctionalTransferEggs';
import BuyEggs from './component/BuyEggs';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
  }

  constructor(props) {
    super(props)
    this.state = { account: ''}
  }

  render() {
    return (

      <>

        <Account />
        <Router>
        <Navbar />
        <Routes>
          <Route path='/fetch' element={<FunctionalFetchData />} />
          <Route path='/addaddr' element={<AddNode />} />
          <Route path='/farmerpack' element={<FunctionalFarmerPackEggs />} />
          <Route path='/marketpack' element={<MarketPackEggs />} />
          <Route path='/transfer' element={<FunctionalTransferEggs />} />
          <Route path='/buyeggsff' element={<BuyEggs />} />
        </Routes>
        </Router>
    </>
    );
  }
}

export default App;