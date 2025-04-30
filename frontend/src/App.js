import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/home/landing';
import Login from './pages/home/login';
import Signup from './pages/home/signup';
import ScrollToTop from './components/ui-essentials/ScrollToTop';
import Dashboard from './pages/dashboard';
import MyCalendar from './pages/MyCalendar.js'
import { DarkModeProvider } from './contexts/DarkModeContext';
import Project from './pages/project.js'
import UserProfile from './pages/UserSettings.js';
import Inbox from './pages/Inbox.js';
import MyTasks from './pages/mytask.js';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/calendar' element={<MyCalendar />} />
          <Route path='/project/:id' element={<Project />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/tasks" element={<MyTasks />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;