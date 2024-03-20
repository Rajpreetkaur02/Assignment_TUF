import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='Navbar-container'>
      <div className='logo'>
        <span><h1>takeUforward</h1></span>
      </div>
      <div className='Navbar-buttons'>
        <div className="Next-page-button">
          <Link to='/page2'><button className="nextpage">View Data</button></Link>
        </div>
      </div>
    </div>
  )
}

export default Navbar
