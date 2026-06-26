import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import LoginPage from './Pages/LoginPage'
import Dashboard from './Components/Dashboard'
import Orders from './Components/Orders';
import ProductList from './Components/ProductList'
import Productadding from './Components/Productadding'
import ProtectedRoute from './Components/ProtectedRoute'
import Analytics from './Pages/Analytics';
import Earnings from './Pages/Earnings';
import Coupons from './Pages/Coupons'
import AutoLogout from './services/AutoLogout'

const App = () => {
  return (
    <>
      <AutoLogout/>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
            <Route path='/' element={<LoginPage />} />
            <Route path='/dash' element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path='/dash/add-product' element={
              <ProtectedRoute>
                <Productadding />
              </ProtectedRoute>
            } />
            <Route path='/dash/orders' element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path='/dash/product-list' element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            <Route path='/dash/earnings' element={
              <ProtectedRoute>
                <Earnings />
              </ProtectedRoute>
            } />
            <Route path='/dash/analytics' element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path='/dash/coupons' element={
              <ProtectedRoute>
                <Coupons />
              </ProtectedRoute>
            } />
        </Routes>
    </>
  )
}

export default App