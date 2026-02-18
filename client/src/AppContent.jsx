import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainPage from './components/MainPage'
import Create from './components/Create'
import AuthPage from './components/AuthPage'
import SignUp from './components/SignUp'
import { checkThunk } from './redux/thunks/authThunks'
import MyAccount from './components/MyAccount'
import Header from './components/Header'
import Cards from './components/Cards'

function AppContent() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkThunk())
  }, [dispatch])

  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="*" element={<MainPage />} />
        <Route path="create" element={<Create />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="cards" element={<Cards />} />
        <Route path="myAccount" element={<MyAccount />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppContent