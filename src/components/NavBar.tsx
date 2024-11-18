import React from 'react';
import { Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  to: string;
}

const NavBar = () => {
  const navItems: NavItem[] = [
    { id: '01', label: 'About', to: '/about' },
    { id: '02', label: 'Projects', to: '/projects' },
    { id: '03', label: 'Blog', to: '/blog' },
    { id: '04', label: 'Contact', to: '/contact' },
  ];

  return (
    <nav className="bg-slate-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 bg-teal-500 transform rotate-45"></div>
            <NavLink to={'/'}>
              <Home className="relative z-10 h-full w-full text-slate-900 p-1.5" />
            </NavLink>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300 transition-colors'
              }
            >
              {item.label}
            </NavLink>
          ))}

          <button className="px-4 py-2 text-sm border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-slate-900 transition-colors duration-200 rounded">
            Resume
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
