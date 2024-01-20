import { React, useState } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message } from "semantic-ui-react";

// Kubo and Web3 support
import { useCommitEgg } from '../hooks/useCommitEgg'
import { useKubo } from '../hooks/useKubo'
import { useWeb3 } from '../hooks/useWeb3'

function FunctionalFarmerPackEggs() {
    // state variables
    const [address, setAddress] = useState('')
    const [price, setPrice] = useState(0)
    const [quantity, setQuantity] = useState(0)
    const [notes, setNotes] = useState('')
    
    // personal error
    const [error, setError] = useState(null)

    // inherited variables
    const { kuboError, kuboStarting } = useKubo()
    const { web3Error, web3Starting} = useWeb3()
    const {
        loading,
        cidString,
        commitEgg,
    } = useCommitEgg()

    return (
        <div className="main-container">
            <h3>Pack Eggs</h3>
            <Form
                onSubmit={() => {
                    setError(null);
                    commitEgg({
                        address: address,
                        price: price,
                        quantity: quantity,
                        notes: notes
                    }).catch((error) => setError(error))
                }}                                                // Creates object egg before committing
                error={kuboError||web3Error||error}               // Set error
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
                        type="number" // this will allow only numbers to be input
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
                    <label>How many eggs are in the package?</label>
                    <Input
                        type="number" // this will allow only numbers to be input
                        value={quantity}
                        onChange={(event) => { // check if it is an integer
                            const value = event.target.value;
                            if (!isNaN(value) && Number.isInteger(parseFloat(value)) && value.match(/^\d*(\.\d+)?$/)) {
                                setQuantity(value);
                            } else {
                                setError(new Error('Invalid quantity input. Please enter a valid integer.'));
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
                    Pack
                </Button>
                {(cidString !== '' && error === null) ? <Message
                    positive
                    header="You got a new egg!"
                    content={`CID: ${cidString}`}
                /> : null}
            </Form>
        </div>
    )
}

export default FunctionalFarmerPackEggs