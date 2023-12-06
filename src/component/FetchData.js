import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Select } from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class FetchData extends Component {
  state = {
    id: "",
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
   

    this.setState({ errMsg: "", loading: true });
    try {
      const accounts = await web3.eth.getAccounts();

      console.log(this.state.address);
      //nodeEvent corrisponde alla funzione del contratto. Viene recuperata 
      //da Gateway.json che deriva dagli altri contratti. Derivando 
      //gli altri contratti importa all'interno del proprio JSON tutte le funzioni
      //dichiarate nei vari contratti
      await gateway.methods['fetchData'](this.state.id).call({
        from: accounts[0],
      });
    } catch (err) {
      this.setState({ errMsg: err.message });
    }
    this.setState({ loading: false, id: "" });
  };



render() {
  return (

    <div>
        <h3>Add</h3>
        <Form
          onSubmit={(event) => this.onSubmit(event)}
          error={!!this.state.errMsg}
        >
          <Form.Field>
            <label>Address</label>
            <Input
              focus
              icon="ID product"
              iconPosition="left"
              placeholder="ID product..."
              value={this.state.id}
              onChange={(event) =>
                this.setState({ id: event.target.value })
              }
            />
          </Form.Field>
          <Message
            error
            header="There are error/s with your submission"
            content={this.state.errMsg}
          />
          <Button type="submit" loading={this.state.loading} color="blue">
            Fetch data
          </Button>
        </Form>
      </div>
   
   );
  }
}

export default FetchData;