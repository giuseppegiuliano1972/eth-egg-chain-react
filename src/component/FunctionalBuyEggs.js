import { React, useState, useCallback, useEffect } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message } from "semantic-ui-react";

// Kubo and Web3 support
import { useBuyEgg } from '../hooks/useBuyEgg'
import { useKubo } from '../hooks/useKubo'
import { useWeb3 } from '../hooks/useWeb3'

function FunctionalBuyEggs() {
    // state variables
    const [eggCID, setEggCID] = useState('')
    const [seller, setSeller] = useState('')
    const [buyer, setBuyer] = useState('')
    const [price, setPrice] = useState('')
    const [sellerRole, setSellerRole] = useState('')
    const [buyerRole, setBuyerRole] = useState('')

    // add additional buy information
    const [notes, setNotes] = useState('')

    // personal error
    const [error, setError] = useState(null)

    // inherited variables
    const { kuboError, kuboStarting } = useKubo()
    const { web3, gateway, web3Error, web3Starting} = useWeb3()
    const {
        loading,
        buyCID,
        buyEgg,
    } = useBuyEgg()

    // needed for searching role events
    const roles = ['ConsumerAdded', 'DeliverAdded', 'FarmerAdded', 'FoodFactoryAdded', 'MarketAdded']

    const getRole = useCallback(async(role, address, setter) => {
      await gateway.getPastEvents(role, {
        filter: {account: address},
        fromBlock: 0,
        toBlock: 'latest'
      }, function(error, events) {
        console.error(error);
        console.log(events);
      }).then(function(events){
        // eslint-disable-next-line no-unused-vars
        for (const event of events) {
          setter(role.replace("Added", ""))
        }
      })
      return "";
    }, [gateway])
    
    useEffect(() => {
      if(seller !== null && web3 !== null && web3.utils.isAddress(seller) && gateway != null) {
        for (const role of roles) {
          getRole(role, seller, setSellerRole)
        }
      }
      else setSellerRole("")
      if(buyer !== null && web3 !== null && web3.utils.isAddress(buyer) && gateway != null)
        for (const role of roles) {
          getRole(role, buyer, setBuyerRole)
        }
      else setBuyerRole("")
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seller, buyer])

    return (
        <div className="main-container">
            <h3>Buy Eggs</h3>
            <Form
                onSubmit={() => {
                  setError(null); 
                  //const priceWei = web3.utils.toWei(price, "ether");
                  //console.log("Price:", priceWei);
                  buyEgg({
                      seller: seller,
                      buyer: buyer,
                      price: price,
                      notes: notes,
                      eggcid: eggCID
                  }).catch((error) => setError(error));
                }}                                                // Creates object buy before committing
                error={kuboError||web3Error||error}               // Set error
            >
                <Form.Field>
                    <label>Egg CID</label>
                    <Input
                        value={eggCID}
                        onChange={(event) => setEggCID(event.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Seller Address | {sellerRole}</label>
                    <Input
                        icon="address card"
                        iconPosition="left"
                        value={seller}
                        onChange={(event) => setSeller(event.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Buyer Address | {buyerRole}</label>
                    <Input
                        icon="address card"
                        iconPosition="left"
                        value={buyer}
                        onChange={(event) => setBuyer(event.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Price</label>
                    <Input
                        type="number"
                        label="ETH"
                        labelPosition="right"
                        value={price}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (!isNaN(value) && value.match(/^\d*(\.\d+)?$/)) {
                              setPrice(value);
                          } else {
                              setError(new Error('Invalid price input. Please enter a valid number.'));
                          }
                      }}
                      />
                </Form.Field>
                <Form.Field>
                    <label>Write any additional notes here</label>
                    <Input
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </Form.Field>
                <Message
                    error
                    header="There are error/s with your submission"
                    content={`${error}`}
                />
                <Button color="teal" loading={kuboStarting||web3Starting||loading}>
                    Buy
                </Button>
                {(buyCID !== '' && error === null) ? <Message
                    positive
                    header="Egg bougth!"
                    content={`Buy CID: ${buyCID}`}
                /> : null}
            </Form>
        </div>
    )
}

export default FunctionalBuyEggs