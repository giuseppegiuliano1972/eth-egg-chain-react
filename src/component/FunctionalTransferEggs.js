import { React, useState, useCallback, useEffect } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message } from "semantic-ui-react";

// Kubo and Web3 support
import { useTransferEgg } from '../hooks/useTransferEgg'
import { useKubo } from '../hooks/useKubo'
import { useWeb3 } from '../hooks/useWeb3'

function FunctionalTransferEggs() {
    // state variables
    const [eggCID, setEggCID] = useState('')
    const [sender, setSender] = useState('')
    const [receiver, setReceiver] = useState('')
    const [senderRole, setSenderRole] = useState('')
    const [receiverRole, setReceiverRole] = useState('')

    // add additional transfer information
    const [notes, setNotes] = useState('')

    // personal error
    const [error, setError] = useState(null)

    // inherited variables
    const { kuboError, kuboStarting } = useKubo()
    const { web3, gateway, web3Error, web3Starting} = useWeb3()
    const {
        loading,
        transferCID,
        transferEgg,
    } = useTransferEgg()

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
      if(sender !== null && web3 !== null && web3.utils.isAddress(sender) && gateway != null) {
        for (const role of roles) {
          getRole(role, sender, setSenderRole)
        }
      }
      else setSenderRole("")
      if(receiver !== null && web3 !== null && web3.utils.isAddress(receiver) && gateway != null)
        for (const role of roles) {
          getRole(role, receiver, setReceiverRole)
        }
      else setReceiverRole("")
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sender, receiver])

    return (
        <div className="main-container">
            <h3>Transfer Eggs</h3>
            <Form
                onSubmit={() => {
                  setError(null); 
                  transferEgg({
                      sender: sender,
                      receiver: receiver,
                      notes: notes,
                      egglink: eggCID
                  }).catch((error) => setError(error));
                }}                                                // Creates object transfer before committing
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
                    <label>Sender Address | {senderRole}</label>
                    <Input
                        icon="address card"
                        iconPosition="left"
                        value={sender}
                        onChange={(event) => setSender(event.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Receiver Address | {receiverRole}</label>
                    <Input
                        icon="address card"
                        iconPosition="left"
                        value={receiver}
                        onChange={(event) => setReceiver(event.target.value)}
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
                    Transfer
                </Button>
                {(transferCID !== '' && error === null) ? <Message
                    positive
                    header="Egg was transfered!"
                    content={`Transfer CID: ${transferCID}`}
                /> : null}
            </Form>
        </div>
    )
}

export default FunctionalTransferEggs