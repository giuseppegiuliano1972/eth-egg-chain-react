import { useCallback, useEffect, React } from 'react'
import "semantic-ui-css/semantic.min.css";
import { Dropdown } from "semantic-ui-react";

// Import web3 to get accounts
import { useWeb3 } from '../hooks/useWeb3'

function Account() {
  // state from web
  const { accounts, selected, setSelected, error, starting } = useWeb3();

  const options = useCallback(() => {
    var _options = [{value: "no accounts found"}]
    if(accounts !== null)
      _options = accounts.map((account) => { return {key: account, text: account, value: account}});
    return _options;
  }, [accounts])

  useEffect(() => {
    if(accounts !== null)
      setSelected(accounts[0])
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts])

  return (
    <div className="account-selector">
      <h3>Active Account: <Dropdown 
        inline
        options={options()}
        value={selected}
        loading={starting}
        error={error}
        onChange={(event) => {setSelected(event.target.textContent)}}
      /></h3>
    </div>
  )
}

export default Account