import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Productlist from './Components/Productlist'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Productlist/>}/>
      </Routes>
    </div>
  )
}

export default App