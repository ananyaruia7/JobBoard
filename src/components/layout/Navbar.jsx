import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathForRole } from '../../lib/profiles'

function NavItem({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { profile, role, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="jb-container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <Link
          to={homePathForRole(role)}
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          JobBoard
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {role === 'jobseeker' ? (
            <nav className="flex flex-wrap items-center gap-1">
              <NavItem to="/jobs">Jobs</NavItem>
              <NavItem to="/recommendations">Recommendations</NavItem>
              <NavItem to="/applications">Applications</NavItem>
              <NavItem to="/profile">Profile</NavItem>
            </nav>
          ) : null}

          {role === 'recruiter' ? (
            <nav className="flex flex-wrap items-center gap-1">
              <NavItem to="/recruiter/jobs">My Jobs</NavItem>
            </nav>
          ) : null}

          {profile?.full_name ? (
            <span className="hidden text-sm text-slate-600 sm:inline">
              {profile.full_name}
            </span>
          ) : null}

          <button type="button" onClick={signOut} className="jb-btn-secondary py-1.5">
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
