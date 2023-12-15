import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import Dropdown from './Dropdown';

function Navbar() {
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const onMouseEnter = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(true);
    }
  };

  const onMouseLeave = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(false);
    }
  };

  return (
    <>
      <nav className='navbar'>
        <div className='menu-icon' onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li
            className='nav-item'
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Link
              to='/fetch'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              Fetch data <i className='fas fa-caret-down' />
            </Link>
           
          </li>
          <li className='nav-item'>
            <Link
              to='/addaddr'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              Link address
            </Link>
            {dropdown && <Dropdown />}
          </li>
          <li className='nav-item'>
            <Link
              to='/pack'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              Pack eggs
            </Link>
          </li>
          <li className='nav-item'>
            <Link
              to='/transfer'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              Transfer Eggs
            </Link>
          </li>
          <li className='nav-item'>
            <Link
              to='/buyeggsff'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              Buy Eggs
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;