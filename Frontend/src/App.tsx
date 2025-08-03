
import './App.css'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import Login from './pages/Login.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import SessionDetailsPage from './pages/SessionDetailsPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import Layout from './components/Layout'
import SessionsPage from './pages/SessionsPage.tsx'
import CreateSession from './pages/CreateSession.tsx'
import ResponsePage from './pages/ResponsePage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import QRcode from './pages/QRcode.tsx'
import AnalyticsPage from './pages/AnalyticsPage.tsx'
import ViewContacted from './pages/ViewContacted.tsx'

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/feedback/:sessionId" element={<ResponsePage />} />
      <Route path="/contact/:sessionId" element={<ContactPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/sessions" element={<SessionsPage />} />
        <Route path="/admin/sessions/create" element={<CreateSession />} />
        <Route path="/admin/sessions/:sessionId" element={<SessionDetailsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/qrcode/:sessionId" element={<QRcode />} />
        <Route path="/admin/analytics/:sessionId" element={<AnalyticsPage />} />
        <Route path="/admin/contacted" element={<ViewContacted />} />
      </Route>
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default App;

