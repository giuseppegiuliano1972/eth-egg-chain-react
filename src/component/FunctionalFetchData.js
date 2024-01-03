import { React, useState } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Button, Card, Form, Input, Message } from "semantic-ui-react";

// Kubo support
import { useKubo } from '../hooks/useKubo'
import { useCommitEgg } from '../hooks/useCommitEgg'
import { useHistoryEgg} from '../hooks/useHistoryEgg'

function FunctionalFetchData() {
    // state variables
    const { kuboError, kuboStarting } = useKubo()
    const {
        loading,
        cidString,
        setCidString,
        fetchCommittedEgg,
        committedEgg,
    } = useCommitEgg()
    const {
        loadingHistory,
        historyEgg,
    } = useHistoryEgg()
    
    // personal error
    const [error, setError] = useState(null)

    return (
        <div className="main-container">
            <h3>Fetch Egg Data from Chain</h3>
            <Form
                onSubmit={() => {
                    setError(null);
                    fetchCommittedEgg().catch((error) => setError(error))
                }}                         // Creates object egg before committing
                error={kuboError||error}               // Uses error as kubos error
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
                    content={`${error}`} // Might want to change
                />
                <Button color="teal" loading={kuboStarting||loading}>
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

            <h3>Your Eggs:</h3>
            {
                historyEgg.map((cid)=>{
                    return <Card style={{ width: '128rem' }} loading={loadingHistory} key={`${cid}`}>
                        <Card.Content
                        header={`Product CID: ${cid}`}
                        />
                    </Card>
                })
            }
        </div>
    )
}

export default FunctionalFetchData