import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Productlist from './Components/Productlist'
import VendorList from './Components/VendorList'
import Admindashboard from './Components/Admindashboard'
import OrderList from './pages/OrderList';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Admindashboard/>}/>
        <Route path='/products' element={<Productlist/>}/>
        <Route path='/vendors' element={<VendorList/>}/>
        <Route path='/orders' element={<OrderList/>}/>
      </Routes>
    </div>
  )
}

export default App