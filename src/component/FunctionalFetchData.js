import { React, Fragment, useState } from 'react'
import "semantic-ui-css/semantic.min.css";
import { 
    Button,
    Form,
    Input,
    Card,
    CardHeader,
    CardContent,
    Feed,
    FeedContent,
    FeedEvent,
    FeedUser,
    FeedSummary,
    Divider,
    Message } from "semantic-ui-react";

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
            {(committedEgg['address']!==undefined) && 
            <Card fluid>
                <Card.Content
                    header={`Product nr. ${cidString}`}
                    textAlign="center"
                />
                {Object.keys(committedEgg).map((key) => {
                    return <Card.Content content={`${key}: ${committedEgg[key]}`}/>
                })}
            </Card>
            }
            

            <Card centered fluid loading={loadingHistory}>
                <CardContent>
                    <CardHeader> Your Eggs</CardHeader>
                </CardContent>
                <CardContent>
                    <Feed>
                        {
                            historyEgg.map((cid)=>{
                                return (
                                <Fragment key={`${cid}`}>
                                <FeedEvent>
                                    <FeedContent>
                                        <FeedSummary>
                                            Product ID: <FeedUser>{cid}</FeedUser>
                                        </FeedSummary>
                                    </FeedContent>
                                    <Button onClick={ () => setCidString(cid) } floated='right' color='blue'>
                                        Copy
                                    </Button>
                                </FeedEvent>
                                <Divider/>
                                </Fragment>
                                )
                            })
                        }
                    </Feed>
                </CardContent>
            </Card>
        </div>
    )
}

export default FunctionalFetchData