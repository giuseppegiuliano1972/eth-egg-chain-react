import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Select} from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class BuyEggs extends Component {
  state = {
    id: "",
    buyer: "",
    seller: "",
    buyerAddr: "",
    sellerAddr: "",
    eggPrice: "",
    errMsg: "",
    loading: false
  };


 nodeBuyer = [
    {key: 1, value: 1, text:"Food Factory"},
    {key: 2, value: 2, text:"Consumer"}
  ]
  
  
  nodeSeller = [
    {key: 1, value: 1, text:"Farmer"},
    {key: 2, value: 2, text:"Market"}
  ]


  async onSubmit(event) {
    event.preventDefault();

    this.setState({ errMsg: "", loading: true });
    try {
      const price = web3.utils.toWei(this.state.eggPrice, "ether");

      const accounts = await web3.eth.getAccounts();

      console.log("Chi compra: ", this.state.buyer, "Address: " , this.state.buyerAddr);

      switch (this.state.buyer){
        case 1: //Food Factory
          await gateway.methods.buyFoodFactory(this.state.id, price).send({
                                                    from: accounts[0], value: price });
          break;
        case 2: //Consumer
          await gateway.methods.buyConsumer(this.state.id, price).send({
                                  from: accounts[0], value: price });
          break;
        default:
      }

    } catch (err) {
      this.setState({ errMsg: err.message });
    }
    this.setState({ loading: false, id: "" });
  };

  handleChange = (event, data) => {

    this.setState({ buyer: data.value, sellerAddr: '', buyerAddr: '' } ,function(){
      console.log(data)
    })
  }


render() {

  return (
    <div  className='main-container'>
    <Form
       onSubmit={(event) => this.onSubmit(event)}
       error={!!this.state.errMsg}
    >
      <Form.Field>
        <label>ID</label>
        <Input
          value={this.state.id}
          onChange={(event) => this.setState({ id: event.target.value })}
        />
      </Form.Field>
      <Form.Field>
        <label>Price</label>
        <Input
          label="ETH"
          labelPosition="right"
          value={this.state.eggPrice}
          onChange={(event) =>
            this.setState({ eggPrice: event.target.value })
          }
        />
      </Form.Field>
      <Form.Field>     
         <label>Select Seller:</label>
            <Select
              placeholder='Select...' 
              value={this.state.value}
              name='selSeller'
              options={this.nodeSeller}
              onChange={this.handleChange}
              />
            <label>Seller Address</label>
            <Input
              focus
              placeholder="Consumer Seller"
              value={this.state.sellerAddr}
              onChange={(event) =>
                this.setState({ sellerAddr: event.target.value })
              }
              />
      </Form.Field>
      <Form.Field>     
         <label>Select Consumer:</label>
            <Select
              placeholder='Select...' 
              value={this.state.buyer}
              name='selBuyer'
              options={this.nodeBuyer}
              onChange={(event) =>
                this.setState({ buyerAddr: event.target.value })
              }

              />
            <label>Consumer Address</label>
            <Input
              focus
              placeholder="Consumer Address"
              value={this.state.buyerAddr}
              onChange={(event) =>
                this.setState({ buyerAddr: event.target.value })
              }
              />
      </Form.Field>
  
      <Message
        error
        header="There are error/s with your submission"
        content={this.state.errMsg}
      />
      <Button color="teal" loading={this.state.loading}>
        Buy Eggs
      </Button>
    </Form>
    </div>
  );
  }
}

export default BuyEggs;