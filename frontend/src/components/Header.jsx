import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/docs', label: 'Docs' },
    { path: '/faq', label: 'FAQ' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <span className="logo-icon">🎓</span>
          <span className="logo-text">AI Study Agent</span>
        </Link>
        
        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/app"
            className="nav-link nav-cta"
            onClick={closeMobileMenu}
          >
            Get Started
          </Link>
        </nav>

        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
