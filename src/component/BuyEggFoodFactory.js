import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message} from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class BuyEggFoodFactory extends Component {
  state = {
    id: "",
    sender: "",
    receiver: "",
    senderAddr: "",
    receiverAddr: "",
    eggPrice: "",
    errMsg: "",
    loading: false
  };


  async onSubmit(event) {
    event.preventDefault();

    this.setState({ errMsg: "", loading: true });
    try {
      const price = web3.utils.toWei(this.state.eggPrice, "ether");
      const accounts = await web3.eth.getAccounts();
      //

      console.log("Egg ID: ", this.state.id, " eggPrice: ", this.state.eggPrice, "to wei:", price, "accounts[0]: ", accounts[0]);

      await gateway.methods['buyEggsFoodFactory'](this.state.id, price).send({
        from: accounts[0], value: price });

    } catch (err) {
      this.setState({ errMsg: err.message });
    }
    this.setState({ loading: false, id: "" });
  };



render() {

  return (
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
      <Message
        error
        header="There are error/s with your submission"
        content={this.state.errMsg}
      />
      <Button color="teal" loading={this.state.loading}>
        Buy Eggs
      </Button>
    </Form>
  );
  }
}

export default BuyEggFoodFactory;