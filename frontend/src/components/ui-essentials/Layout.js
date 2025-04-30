import React from 'react';
import Sidebar from '../sidebar';
import styles from '../../css/ui-essentials/layout.module.css';
import { DarkModeProvider, useDarkMode } from '../../contexts/DarkModeContext';
import { useEffect, useState } from 'react';

const LayoutContent = ({ children }) => {
  const { darkMode } = useDarkMode();
  const [sidebarExpanded, setSidebarExpanded] = useState(
    localStorage.getItem('sidebarExpanded') !== 'false'
  );

  useEffect(() => {
    // Listen for sidebar toggle events
    const handleSidebarToggle = (event) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener('sidebarToggled', handleSidebarToggle);

    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle);
    };
  }, []);

  return (
    <div className={`${styles.layoutContainer} ${darkMode ? styles.darkMode : ''}`}>
      <Sidebar expanded={sidebarExpanded} />
      <main className={`${styles.mainContent} ${sidebarExpanded ? styles.contentWithExpandedSidebar : styles.contentWithCollapsedSidebar}`}>
        {children}
      </main>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <LayoutContent>{children}</LayoutContent>
  );
};

export default Layout;