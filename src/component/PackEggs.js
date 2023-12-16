import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Select } from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class PackEggs extends Component {
  state = {
    id: "",
    address: "",
    seller: "",
    note: "",
    price: "",
    totalNumber: 0,
    errMsg: "",
    loading: false,
  };

  nodeSeller = [
    {key: 1, value: 1, text:"Farmer"},
    {key: 2, value: 2, text:"Market"}
  ]

  handleChange = (event, data) => {
    console.log(data.value);
    this.setState({
      seller: data.value
    });
   }

  async onSubmit(event) {
    event.preventDefault();
    this.setState({ loading: true, errMsg: "" });
    try {
      const { id, seller,  note, price, totalNumber } = this.state;

      console.log(note === "");

      const accounts = await web3.eth.getAccounts();

      const _price = web3.utils.toWei(this.state.price, "ether");
      
      switch (this.state.seller){
        case 1: //Farmer
          console.log(this.state.id, this.state.address, note, _price, this.state.totalNumber);
          await gateway.methods.getAndPackEggs(this.state.id, this.state.address, note, _price, this.state.totalNumber)
                                .send({from: accounts[0]});
          break;
        case 2: //Market
          await gateway.methods.marketForSale(this.state.id, this.state.address, _price, this.state.totalNumber)
                                        .send({from: accounts[0]});
          break;
        default:
      }
      //console.log(id,seller, note, _price , totalNumber);

    //  await gateway.methods
    //    .getAndPackEggs(id, farmer, farm,note, _price , totalNumber )
    //    .send({ from: accounts[0] });
    } catch (error) {
      this.setState({ errMsg: error.message });
    }

    this.setState({ loading: false });
  };



render() {
  return (

    <div  className='main-container'>
        <h3>Pack and sell</h3>
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
            <label>Address</label>
            <Select
              placeholder='Select...' 
              name='selNode'
              options={this.nodeSeller}
              onChange={this.handleChange} 
              />
            <Input
              focus
              icon="address card"
              iconPosition="left"
              placeholder="Address..."
              value={this.state.address}
              onChange={(event) =>
                this.setState({ address: event.target.value })
              }
            />

          </Form.Field>
        <Form.Field>
          <label>Price</label>
          <Input
            value={this.state.price}
            onChange={(event) =>
              this.setState({ price: event.target.value })
            }
          />
        </Form.Field>
        <Form.Field>
          <label>Total Number of Eggs</label>
          <Input
            value={this.state.totalNumber}
            onChange={(event) =>
              this.setState({ totalNumber: event.target.value })
            }
          />
        </Form.Field>
        <Form.Field>
          <label>Notes</label>
          <Input
            value={this.state.note}
            onChange={(event) =>
              this.setState({ note: event.target.value })
            }
          />
        </Form.Field>
        <Message
          error
          header="There are error/s with your submission"
          content={this.state.errMsg}
        />
        <Button color="teal" loading={this.state.loading}>
          Pack
        </Button>
      </Form>
      </div>
   
   );
  }
}

export default PackEggs;