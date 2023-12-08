import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Card , Select} from "semantic-ui-react";

import web3 from "../gate/web3";
import gateway from "../gate/gateway";

class TransferEggs extends Component {
  state = {
    id: "",
    sender: "",
    receiver: "",
    senderAddr: "",
    receiverAddr: "",
    errMsg: "",
    loading: false
  };

  nodeSender = [
    {key: 1, value: 1, text:"farmer"},
    {key: 2, value: 2, text:"delivery"}
  ]
  
  nodeFarmer = [
    {key: 1, value: 1, text:"delivery"},
  ]

  nodeDeliver = [
    {key: 2, value: 2, text:"food factory"},
    {key: 3, value: 3, text:"market"}
  ]

  async transferEgg(event) {
    event.preventDefault();

    this.setState({ errMsg: "", loading: true });
    try {
      const accounts = await web3.eth.getAccounts();

      //nodeEvent corrisponde alla funzione del contratto. Viene recuperata 
      //da Gateway.json che deriva dagli altri contratti. Derivando 
      //gli altri contratti importa all'interno del proprio JSON tutte le funzioni
      //dichiarate nei vari contratti
      
      var tocall = '';
      
      switch (this.state.sender){
        case "farmer":
          tocall = 'toDistributor';
          break;
        case "delivery":
          tocall = 'deliverToMarket';
          break;
        default:
      }

      await gateway.methods[tocall](this.state.id, this.state.receiverAddr).send({
        from: accounts[0],
      });

      console.log("Egg Transfered from: ", senderAddr, " to: ", receiverAddr);

    } catch (err) {
      this.setState({ errMsg: err.message });
    }
    this.setState({ loading: false, id: "" });
  };

renderDetails(){
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
    <Card.Content description={`State: ${this.state.details.eggState}`} />     
  </Card>
}

renderReceiver(){
  switch(this.state.sender) {
    case "farmer":
      return (
        <Select
              placeholder='Select...' 
              name='selReceiver'
              options={this.nodeFarmer}
              onChange={(event) =>
                this.setState({ receiverAddr: event.target.value })
              }
              />
      );
    case "delivery":
      return (
        <Select
              placeholder='Select...' 
              name='selReceiver'
              options={this.nodeDeliver}
              onChange={(event) =>
                this.setState({ receiverAddr: event.target.value })
              }
              />
      );
    default:
      return (
        <Select
              placeholder='Select...' 
              name='selReceiver'
              options={this.nodeFarmer}
              onChange={(event) =>
                this.setState({ receiverAddr: event.target.value })
              }
              />
      );
  }
}

render() {

  return (
    <div>
        <h3>Transfer Eggs</h3>
        <Form
          onSubmit={(event) => this.transferEgg(event)}
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
            <label>Select Sender:</label>
            <Select
              placeholder='Select...' 
              name='selSender'
              options={this.nodeSender}
              onChange={(event) => 
                this.setState({ sender: event.target.textContent })
              } 
              />
            <label>Sender Address</label>
            <Input
              focus
              placeholder="Sender Address"
              value={this.state.senderAddr}
              onChange={(event) =>
                this.setState({ senderAddr: event.target.value })
              }
            />
            <label>Select Receiver</label>
            {
            this.renderReceiver()
            }
            <label>Receiver Address</label>
            <Input
              focus
              placeholder="Sender Address"
              value={this.state.receiverAddr}
              onChange={(event) =>
                this.setState({ receiverAddr: event.target.value })
              }
            />
          </Form.Field>
          <Message
            error
            header="There are error/s with your submission"
            content={this.state.errMsg}
          />
          <Button type="submit" loading={this.state.loading} color="blue">
            Transfer Egg
          </Button>
        </Form>
      </div>
   
   );
  }
}

export default TransferEggs;