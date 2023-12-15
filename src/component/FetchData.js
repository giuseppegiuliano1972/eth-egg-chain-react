import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Card } from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class FetchData extends Component {
  state = {
    id: "",
    details: {},
    errMsg: "",
    loading: false,
  };

  async onSubmit(event) {
    event.preventDefault();

    this.setState({ errMsg: "", loading: true });
    try {
      const accounts = await web3.eth.getAccounts();

      //nodeEvent corrisponde alla funzione del contratto. Viene recuperata 
      //da Gateway.json che deriva dagli altri contratti. Derivando 
      //gli altri contratti importa all'interno del proprio JSON tutte le funzioni
      //dichiarate nei vari contratti
      const eggDetails = await gateway.methods['fetchData'](this.state.id).call({
        from: accounts[0],
      });

      console.log(eggDetails);
      this.setState({details: eggDetails });

      console.log(eggDetails.farmerAddr);

    } catch (err) {
      this.setState({ errMsg: err.message });
    }
    this.setState({ loading: false, id: "" });
  };



render() {
  return (
    <div className='main-container'>
        <h3>Fetch data</h3>
        <Form
          onSubmit={(event) => this.onSubmit(event)}
          error={!!this.state.errMsg}
        >
          <Form.Field>
            <label>Id nr.:</label>
            <Input
              focus
              icon="IDproduct"
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
        <Card>
          <Card.Content
            header={`Product nr. ${this.state.id}`}
            textAlign="center"
          />
          <Card.Content description={`Owner ID: ${this.state.details.ownerID}`} />
          <Card.Content description={`Farmer address: ${this.state.details.farmerAddr}`} />
          <Card.Content description={`Notes: ${this.state.details.note}`} />
          <Card.Content description={`Price: ${this.state.details.price}`} />
          <Card.Content description={`Total nr. of Eggs: ${this.state.details.totalEggsInPackage}`} />
          <Card.Content description={`Market address: ${this.state.details.marketAddr}`} />
          <Card.Content description={`Delivery address: ${this.state.details.deliveryAddr}`} />
          <Card.Content description={`Food Factory address: ${this.state.details.foodFactoryAddr}`} />
          <Card.Content description={`Consumer address: ${this.state.details.consumerAddr}`} />
          <Card.Content description={`State: ${this.state.details.eggState}`} />
        </Card>
      </div>
   
   );
  }
}

export default FetchData;