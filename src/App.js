import React, { Component } from 'react'
import Navbar from './component/navbar/Navbar';
import Web3 from 'web3'
import AddNode from './component/AddNode'
import './App.css'
import FetchData from './component/FetchData'
import PackEggs from './component/PackEggs';
import TransferEggs from './component/TransferEggs';
import BuyEggs from './component/BuyEggs';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar2 from './component/navbar/NavBar2';

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
    this.state = { account: '' }
  }

  render() {
    return (

      <Router>
      <Navbar />
      <Routes>
        
        <Route path='/fetch' element={<FetchData />} />
        <Route path='/addaddr' element={<AddNode />} />
        <Route path='/pack' element={<PackEggs />} />
        <Route path='/transfer' element={<TransferEggs />} />
        <Route path='/buyeggsff' element={<BuyEggs />} />
      </Routes>
    </Router>
    );
  }
}

export default App;