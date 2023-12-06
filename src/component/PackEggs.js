import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message } from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class PackEggs extends Component {
  state = {
    id: "",
    farmer: "",
    farm: "",
    note: "",
    price: "",
    totalNumber: 0,
    errMsg: "",
    loading: false,
  };


  async onSubmit(event) {
    event.preventDefault();
    this.setState({ loading: true, errMsg: "" });
    try {
      const { id, farmer, farm, note, price, totalNumber } = this.state;
      const accounts = await web3.eth.getAccounts();

      console.log(id);

      await gateway.methods
        .getAndPackEggs(id, farmer, farm,totalNumber )
        .send({ from: accounts[0] });
    } catch (error) {
      this.setState({ errMsg: error.message });
    }

    this.setState({ loading: false });
  };



render() {
  return (

    <div>
        <h3>Packaging</h3>
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
          <label>Farmer ID</label>
          <Input
            value={this.state.farmer}
            onChange={(event) =>
              this.setState({ farmer: event.target.value })
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