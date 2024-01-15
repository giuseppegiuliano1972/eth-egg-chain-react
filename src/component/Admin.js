import { React, Fragment, useState } from 'react'
import "semantic-ui-css/semantic.min.css";
import { 
    Button,
    Card,
    CardHeader,
    CardContent,
    Feed,
    FeedContent,
    FeedEvent,
    FeedUser,
    FeedExtra,
    FeedSummary,
    Divider,
    Message } from "semantic-ui-react";

// Hooks
import { useAdmin } from '../hooks/useAdmin'

function Admin() {
    // state variables
    const { requests, approveRequest, loading, error } = useAdmin()

    // role "enum"
    const roles = [
        'none',
        'Farmer',
        'Deliverer',
        'Food Factory',
        'Market',
        'Consumer']

    return (
        <div className="main-container">
            {(error!==null) && (
                <Message negative>
                    {error.toString()}
                </Message>
            )}
            <Card centered fluid loading={loading}>
                <CardContent>
                    <CardHeader> Recent Join Requests</CardHeader>
                </CardContent>
                <CardContent>
                    <Feed>
                        {
                            requests.map((request)=>{
                                return (
                                <Fragment key={`${request[0]}`}>
                                <FeedEvent>
                                    <FeedContent>
                                        <FeedSummary>
                                            Request From <FeedUser>{request[0]}</FeedUser>
                                        </FeedSummary>
                                        <FeedExtra text>
                                            Role <FeedUser>{roles[request[1]]}</FeedUser>
                                        </FeedExtra>
                                    </FeedContent>
                                    <Button onClick={() => approveRequest(request[0], request[1])} floated='right' color='blue'>
                                        Approve request
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

export default Admin