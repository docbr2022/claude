import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import Dashboard from '@/pages/Dashboard'
import CRMBoard from '@/pages/crm/CRMBoard'
import ImageGenerator from '@/pages/image-generator/ImageGenerator'
import LandingPageGenerator from '@/pages/landing-pages/LandingPageGenerator'
import WhatsappInbox from '@/pages/whatsapp/WhatsappInbox'
import BriefingReader from '@/pages/briefing/BriefingReader'
import CampaignCopyGenerator from '@/pages/campaigns/CampaignCopyGenerator'

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route path="/cadastro" element={<Signup />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/crm" element={<CRMBoard />} />
        <Route path="/imagens" element={<ImageGenerator />} />
        <Route path="/landing-pages" element={<LandingPageGenerator />} />
        <Route path="/whatsapp" element={<WhatsappInbox />} />
        <Route path="/briefing" element={<BriefingReader />} />
        <Route path="/campanhas" element={<CampaignCopyGenerator />} />
      </Route>
    </Routes>
  )
}
