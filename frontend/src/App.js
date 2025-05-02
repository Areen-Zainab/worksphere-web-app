import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/home/landing';
import Login from './pages/home/login';
import Signup from './pages/home/signup';
import Dashboard from './pages/dashboard';
import MyCalendar from './pages/MyCalendar';
import Project from './pages/project';
import UserProfile from './pages/UserSettings';
import Inbox from './pages/Inbox';
import MyTasks from './pages/mytask';
import AdminDashboard from './pages/AdminDashboard'; 

import ScrollToTop from './components/ui-essentials/ScrollToTop';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Project from './pages/project.js'
import UserProfile from './pages/UserSettings.js';
import Inbox from './pages/Inbox.js';
import MyTasks from './pages/mytask.js';
import CreateProject from './pages/createProject.js';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<MyCalendar />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/tasks" element={<MyTasks />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/createProject" element={<CreateProject />} />
          <Route path="/create/project" element={<CreateProject />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
