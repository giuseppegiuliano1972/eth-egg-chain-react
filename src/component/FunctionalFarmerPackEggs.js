import { React, useState } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message } from "semantic-ui-react";

// Helia and Web3 support
import { useCommitEgg } from '../hooks/useCommitEgg'
import { useHelia } from '../hooks/useHelia'
import { useWeb3 } from '../hooks/useWeb3'

function FunctionalFarmerPackEggs() {
    // state variables, maybe add variables for web3
    const [address, setAddress] = useState('')
    const [price, setPrice] = useState(0)
    const [quantity, setQuantity] = useState(0)
    const [notes, setNotes] = useState('')

    // inherited variables
    const { heliaError, heliaStarting } = useHelia()
    const { web3Error, web3Starting} = useWeb3()
    const {
        cidString,  // don't delete, in future will use to show id of the egg that was just added
        commitEgg,
    } = useCommitEgg()

    return (
        <div className="main-container">
            <h3>Pack Eggs 1757</h3>
            <Form
                onSubmit={() => commitEgg({
                    address: address,
                    price: price,
                    quantity: quantity,
                    notes: notes,
                    state: "packed"
                })}                         // Creates object egg before committing
                error={heliaError}               // Set error as helia's error
            >
                <Form.Field>
                    <label>Farmer Address</label>
                    <Input
                        icon="address card"
                        iconPosition="left"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Price</label>
                    <Input
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>How many eggs are in the package?</label>
                    <Input
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
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
                    content={"Helia encountered an unknown error"} // Might want to add handling for web3 errors
                />
                <Button color="teal" loading={heliaStarting}>
                    Pack
                </Button>
            </Form>
        </div>
    )
}

export default FunctionalFarmerPackEggs