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
    this.setState({
      [data.name]: data.value
    });
   }

  async onSubmit(event) {
    event.preventDefault();
    let roleChoosen = this.state['selNode'];
    
    this.setState({ errMsg: "", loading: true });
    try {
      // Call Request Add from the gateway contract
      await gateway.methods['requestAdd'](this.state.address, roleChoosen).send({
        from: this.state.address,
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