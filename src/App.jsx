import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleRoute from './components/layout/RoleRoute'
import { useAuth } from './context/AuthContext'
import { homePathForRole, ROLES } from './lib/profiles'
import JobDetailPage from './pages/JobDetailPage'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ProfilePage from './pages/ProfilePage'
import RecommendationsPage from './pages/RecommendationsPage'
import RecruiterApplicantsPage from './pages/RecruiterApplicantsPage'
import RecruiterJobFormPage from './pages/RecruiterJobFormPage'
import RecruiterJobsPage from './pages/RecruiterJobsPage'
import RegisterPage from './pages/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function HomeRedirect() {
  const { user, role, loading } = useAuth()

  if (loading || (user && !role)) {
    return (
      <div className="jb-page">
        <p className="jb-container py-10 text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={homePathForRole(role)} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role={ROLES.jobseeker} />}>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<RoleRoute role={ROLES.recruiter} />}>
          <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
          <Route path="/recruiter/jobs/new" element={<RecruiterJobFormPage />} />
          <Route
            path="/recruiter/jobs/:id/edit"
            element={<RecruiterJobFormPage />}
          />
          <Route
            path="/recruiter/jobs/:id/applicants"
            element={<RecruiterApplicantsPage />}
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
