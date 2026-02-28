import {
  ActivitySquare,
  Building2,
  CircleDollarSign,
  FlaskConical,
  LayoutDashboard,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Departments', to: '/departments', icon: Building2 },
  { label: 'Simulation Center', to: '/simulation', icon: FlaskConical },
  { label: 'Financial Insights', to: '/financial', icon: CircleDollarSign },
  { label: 'System Diagnostics', to: '/diagnostics', icon: ActivitySquare },
]

function Sidebar() {
  return (
    <aside className="border-b border-gray-200 bg-white md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-gray-200 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Hospital Intelligence</p>
        <h1 className="metric-title mt-1 text-xl font-bold text-black">MedOrion</h1>
      </div>

      <nav className="thin-scrollbar overflow-x-auto px-2 py-2 md:overflow-visible md:px-3 md:py-4">
        <ul className="flex gap-2 md:flex-col md:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to} className="min-w-[170px] md:min-w-0">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'border-gray-300 bg-gray-100 text-black'
                        : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-black'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute left-0 top-2 h-8 w-0.5 rounded-r-full transition ${
                          isActive ? 'bg-black' : 'bg-transparent'
                        }`}
                      />
                      <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
