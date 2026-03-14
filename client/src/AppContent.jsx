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
import Import from './components/Import'
import Lessons from './components/Lessons'
import Lesson from './components/Lesson'
import LiquidGlass from './components/LiquidGlass'

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
        <Route path="import" element={<Import />}/>
        <Route path="lessons" element={<Lessons/>}/>
        <Route path="lessons/:id" element={<Lesson/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppContent