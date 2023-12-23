import { React } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Button, Card, Form, Input, Message } from "semantic-ui-react";

// Helia support
import { useCommitEgg } from '../hooks/useCommitEgg'
import { useHelia } from '../hooks/useHelia'

function FunctionalFetchData() {
    // state variables
    const { error, starting } = useHelia()
    const {
        cidString,
        setCidString,
        fetchCommittedEgg,
        committedEgg,
    } = useCommitEgg()

    return (
        <div className="main-container">
            <h3>Fetch Egg Data from Chain 1902</h3>
            <Form
                onSubmit={() => fetchCommittedEgg()}                         // Creates object egg before committing
                error={error}               // Uses error as helias error
            >
                <Form.Field>
                    <label>ID</label>
                    <Input
                        value={cidString}   // Initial value
                        onChange={(event) => setCidString(event.target.value)} // Value update
                    />
                </Form.Field>
                <Message
                    error
                    header="There are error/s with your submission"
                    content={"Helia encountered an unknown error"} // Might want to change
                />
                <Button color="teal" loading={starting}>
                    Fetch
                </Button>
            </Form>
            <Card>
                <Card.Content
                    header={`Product nr. ${cidString}`}
                    textAlign="center"
                />
                <Card.Content description={`Farmer Address: ${committedEgg.address}`} />
                <Card.Content description={`Price: ${committedEgg.price}`} />
                <Card.Content description={`Eggs in Package: ${committedEgg.quantity}`} />
                <Card.Content description={`Notes: ${committedEgg.notes}`} />
            </Card>
        </div>
    )
}

export default FunctionalFetchData