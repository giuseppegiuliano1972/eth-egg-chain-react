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