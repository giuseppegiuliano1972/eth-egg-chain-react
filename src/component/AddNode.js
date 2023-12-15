import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Select } from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class AddNode extends Component {
  state = {
    address: "",
    errMsg: "",
    loading: false,
  };

   nodeOptions = [
    {key: 1, value: 1, text:"farmer"},
    {key: 2, value: 2, text:"delivery"},
    {key: 3, value: 3, text:"food factory"},
    {key: 4, value: 4, text:"market"},
    {key: 5, value: 5, text:"consumer"}
   ]

   handleChange = (event, data) => {
    console.log(data.value);
    this.setState({
      [data.name]: data.value
    });
   }

  async onSubmit(event) {
    event.preventDefault();
    let roleChoosen;
    let nodeEvent;
    roleChoosen = this.state['selNode'];
    console.log(roleChoosen);
    switch (roleChoosen){
      case 1:
        nodeEvent = "addFarmer";
        console.log('Type:  ', roleChoosen, ' process: "Add Farmer"');
        break;
      
      case 2:
          nodeEvent = "addDeliver";
          console.log('Type:  ', roleChoosen, ' process: "Add addDistibutor"');
          break;

      case 3:
            nodeEvent = "addFoodFactory";
            console.log('Type:  ', roleChoosen, ' process: "Add addFoodFact"');
            break;

      case 4:
           nodeEvent = "addMarket";
           console.log('Type:  ', roleChoosen, ' process: "Add addMarket"');
           break;

      case 5:
            nodeEvent = "addConsumer";
            console.log('Type:  ', roleChoosen, ' process: "Add addConsumer"');
            break;
      default:
            this.setState({ errMsg: "Role not permitted" });
            console.log('Type:  ', roleChoosen, ' Error Role not permitted');
            break;
    }

    this.setState({ errMsg: "", loading: true });
    try {
      const accounts = await web3.eth.getAccounts();

      console.log(this.state.address);
      //nodeEvent corrisponde alla funzione del contratto. Viene recuperata 
      //da Gateway.json che deriva dagli altri contratti. Derivando 
      //gli altri contratti importa all'interno del proprio JSON tutte le funzioni
      //dichiarate nei vari contratti
      await gateway.methods[nodeEvent](this.state.address).send({
        from: accounts[0],
      });
    } catch (err) {
      this.setState({ errMsg: err.message });
    }
    this.setState({ loading: false, address: "" });
  };



render() {
  return (

    <div  className='main-container'>
        <h3>Add</h3>
        <Form
          onSubmit={(event) => this.onSubmit(event)}
          error={!!this.state.errMsg}
        >
          <Form.Field>
            <label>Address</label>
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
            <Select
              placeholder='Select...' 
              name='selNode'
              options={this.nodeOptions}
              onChange={this.handleChange} 
              />
          </Form.Field>
          <Message
            error
            header="There are error/s with your submission"
            content={this.state.errMsg}
          />
          <Button type="submit" loading={this.state.loading} color="blue">
            Add
          </Button>
        </Form>
      </div>
   
   );
  }
}

export default AddNode;