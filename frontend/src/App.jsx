import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import IntroScreen    from './components/IntroScreen.jsx'
import Navbar         from './components/Navbar.jsx'
import Footer         from './components/Footer.jsx'
import HomePage       from './pages/HomePage.jsx'
import SearchPage     from './pages/SearchPage.jsx'
import BookDetailPage from './pages/BookDetailPage.jsx'
import LoginPage      from './pages/LoginPage.jsx'
import RegisterPage   from './pages/RegisterPage.jsx'
import ProfilePage    from './pages/ProfilePage.jsx'
import LibraryPage    from './pages/LibraryPage.jsx'
import AdminPage      from './pages/AdminPage.jsx'
import AboutPage      from './pages/AboutPage.jsx'
import ContactPage    from './pages/ContactPage.jsx'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/"      replace />
  return children
}

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      {!introDone && <IntroScreen onDone={() => setIntroDone(true)} />}

      <div style={{ visibility: introDone ? 'visible' : 'hidden' }} className="flex flex-col min-h-screen bg-mesh-gradient">
        <Navbar />
        <main className="flex-grow pt-32">
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/search"   element={<SearchPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/library"  element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/admin"    element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}
