import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function navigationbar() {
  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">EggChain</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link className='nav-links' href="fetch">Fetch Data</Nav.Link>
            <Nav.Link className='nav-links' href="addaddr">Link Address</Nav.Link>
            <NavDropdown className='nav-item' title="Pack eggs" id="basic-nav-dropdown">
              <NavDropdown.Item className='nav-links' href="farmerpack">Farmer pack Eggs</NavDropdown.Item>
              <NavDropdown.Item className='nav-links' href="marketpack">Market pack Eggs</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link className='nav-links' href="transfer">Transfer eggs</Nav.Link>
            <Nav.Link className='nav-links' href="buyeggsff">Buy eggs</Nav.Link>
            <Nav.Link className='nav-links' href="admin">Administration</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default navigationbar;