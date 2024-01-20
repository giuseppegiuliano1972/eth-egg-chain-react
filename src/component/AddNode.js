import React, { useState } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Form, Input, Message, Select } from "semantic-ui-react";

// Hooks
import { useWeb3 } from '../hooks/useWeb3'

function AddNode() {
  // state variables
  const [address, setAddress] = useState(null)
  const [role, setRole] = useState('farmer')
  const [loading, setLoading] = useState(false)
  // personal error
  const [error, setError] = useState(null)
  const { gateway } = useWeb3()

  const nodeOptions = [
    {key: 1, value: 1, text:"farmer"},
    {key: 2, value: 2, text:"delivery"},
    {key: 3, value: 3, text:"food factory"},
    {key: 4, value: 4, text:"market"},
    {key: 5, value: 5, text:"consumer"}
  ]
  
  const onSubmit = async (event) => {    
    setError('')
    setLoading('')
    try {
      // Call Request Add from the gateway contract
      await gateway.methods['requestAdd'](address, role).send({
        from: address,
      });
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setAddress('')
    }
  };

  return (
    <div  className='main-container'>
    <h3>Add</h3>
    <Form
      onSubmit={onSubmit}
      error={!!error}
    >
      <Form.Field>
        <label>Address</label>
        <Input
          focus
          icon="address card"
          iconPosition="left"
          placeholder="Address..."
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
        />
        <Select
          placeholder='Select...' 
          name='selNode'
          options={nodeOptions}
          onChange={(event, data) =>
            setRole(data.value)
          }
          />
      </Form.Field>
      <Message
        error
        header="There are error/s with your submission"
        content={error}
      />
      <Button type="submit" loading={loading} color="blue">
        Add
      </Button>
    </Form>
  </div>
  )
}

export default AddNode