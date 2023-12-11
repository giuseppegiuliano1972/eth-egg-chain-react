import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import './Navbar.css';

const NavBar2 = () => {
  const [isOpen, setOpen] = useState(false);
  return ( 
  	<nav
      className="navbar is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container">
      <div className="navbar-brand">
          <a
            role="button"
            className={`navbar-burger burger ${isOpen && "is-active"}`}
            aria-label="menu"
            aria-expanded="false"
            onClick={() => setOpen(!isOpen)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className={`navbar-menu ${isOpen && "is-active"}`}>
          <div className="navbar-start">
            <NavLink className="navbar-item" activeClassName="is-active" to="/">
              Home
            </NavLink>

            <NavLink
              className='nav-links'
              activeClassName="is-active"
              to="/fetch"
            >
              Fetch data
            </NavLink>

            <NavLink
              className='nav-links'
              activeClassName="is-active"
              to="/addaddr"
            >
              Add Address
            </NavLink>
            <NavLink
              to='/pack'
              className='nav-links'
              activeClassName="is-active"
            >
              Pack eggs
            </NavLink>
            <NavLink
              to='/transfer'
              className='nav-links'
              activeClassName="is-active"
            >
              Transfer Eggs
            </NavLink>
                <Dropdown>
                <Dropdown.Toggle caret color="primary">
                    Buy
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item>
                        <NavLink to="/buyeggsff"
                        className='nav-item'
                        activeClassName="is-active">
                            Buy eggs Food Factory
                        </NavLink>
                    </Dropdown.Item>
                    
                    <Dropdown.Item>
                    <NavLink to="/buyeggsff"
                    className='nav-item'
                    activeClassName="is-active">
                        Buy eggs Consumer
                    </NavLink>
                    </Dropdown.Item>
                    
                </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <a className="button is-white">Log in</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
 };
 
 export default NavBar2;