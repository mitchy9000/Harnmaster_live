import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './components/common/PrivateRoute.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CharacterSheet from './pages/CharacterSheet.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/characters/new" element={<CharacterSheet />} />
            <Route path="/characters/:id" element={<CharacterSheet />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}