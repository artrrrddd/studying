import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
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
import LessonExportPage from './components/LessonExportPage'
import ComparisonMode from './components/ComparisonMode'
import CannonGame from './components/CannonGame'
import PromoPage from './components/PromoPage'

function AppRoutes() {

  const location = useLocation();
  const isComparison = location.pathname.endsWith('comparison')
  const isLogged = useSelector(s => s.auth.isLogged)

  return (
    <>
      {/* { !isComparison && <Header /> } */}
      <Routes>
        {
          isLogged ?
          <Route path="*" element={<MainPage />} /> :
          <Route path="*" element={<PromoPage />} />
        }
        <Route path="create" element={<Create />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="cards" element={<Cards />} />
        <Route path="myAccount" element={<MyAccount />}/>
        <Route path="import" element={<Import />}/>
        <Route path="lessons" element={<Lessons/>}/>
        <Route path="lessons/:id" element={<Lesson/>}/>
        <Route path="lessons/:id/comparison" element={<ComparisonMode />}/>
        <Route path="lessons/:id/cannon" element={<CannonGame />}/>
      </Routes>
    </>
  )
}

function AppContent() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkThunk())
  }, [dispatch])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default AppContent
