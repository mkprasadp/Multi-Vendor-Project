import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Productlist from './Components/Productlist'
import VendorList from './Components/VendorList'
import Admindashboard from './Components/Admindashboard'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Admindashboard/>}/>
        <Route path='/products' element={<Productlist/>}/>
        <Route path='/vendors' element={<VendorList/>}/>
      </Routes>
    </div>
  )
}

export default App