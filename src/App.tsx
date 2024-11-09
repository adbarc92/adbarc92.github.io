import "./App.css";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SocialLinks from "./components/SocialLinks";
import { Moon } from "lucide-react";
import React from "react";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-8">
      <nav className="flex justify-between items-center mb-24">
        <Link to="/" className="flex items-center gap-4">
          <div className="text-2xl">✱</div>
          <div className="w-12 h-12 border border-gray-400 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "text-white"
                : "text-gray-400 hover:text-gray-300 transition-colors"
            }
          >
            About
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive
                ? "text-white"
                : "text-gray-400 hover:text-gray-300 transition-colors"
            }
          >
            Projects
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-white"
                : "text-gray-400 hover:text-gray-300 transition-colors"
            }
          >
            Contact
          </NavLink>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Moon size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto">{children}</main>

      <SocialLinks />
    </div>
  );
};

export default App;
