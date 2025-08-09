import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, Users, Bell, LogOut, User, Sun, Moon, Mic, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import DeviceList from '../components/dashboard/DeviceList';
import SimpleDeviceList from '../components/dashboard/SimpleDeviceList';
import UserProfile from '../components/dashboard/UserProfile';
import VoiceAssistant from '../components/voice/VoiceAssistant';
import Chatbot from '../components/chat/Chatbot';
import BackendStatus from '../components/common/BackendStatus';
import { useToast } from '../hooks/useToast';
import DeviceDebug from '../components/debug/DeviceDebug';

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('devices');
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });
  const [showDebug, setShowDebug] = useState(false);
  const { user, logout } = useAuth();
  const { backendAvailable, connectionStatus } = useWebSocket();
  const { success } = useToast();
  const navigate = useNavigate();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'devices':
        return <SimpleDeviceList />;
      case 'voice':
        return <VoiceAssistant />;
      case 'chat':
        return <Chatbot />;
      case 'profile':
        return <UserProfile />;
      default:
        return <SimpleDeviceList />;
    }
  };

  return (
    <div className={`dashboard-bg min-h-screen ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } md:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-glass border-r border-primary-200/20 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full p-8 space-y-8 animate-fade-in">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg animate-glow">
                <Home size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">IoT Control</h2>
                <p className="text-xs text-muted">Voice Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-glass hover:bg-primary-500/20 transition-all duration-200 hover-scale"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-4 animate-slide-up-delay">
            <button
              onClick={() => {
                setActiveTab('devices');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover-scale ${
                activeTab === 'devices'
                  ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                  : 'bg-glass hover:bg-primary-500/10 text-white'
              }`}
            >
              <Home size={20} />
              <span className="font-medium">Devices</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('voice');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover-scale ${
                activeTab === 'voice'
                  ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                  : 'bg-glass hover:bg-primary-500/10 text-white'
              }`}
            >
              <Mic size={20} />
              <span className="font-medium">Voice Assistant</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('chat');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover-scale ${
                activeTab === 'chat'
                  ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                  : 'bg-glass hover:bg-primary-500/10 text-white'
              }`}
            >
              <MessageCircle size={20} />
              <span className="font-medium">Chatbot</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover-scale ${
                activeTab === 'profile'
                  ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                  : 'bg-glass hover:bg-primary-500/10 text-white'
              }`}
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </button>

            <button 
              onClick={() => {
                navigate('/settings');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-4 p-4 rounded-xl bg-glass hover:bg-primary-500/10 text-white transition-all duration-200 hover-scale"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>

            <button className="w-full flex items-center space-x-4 p-4 rounded-xl bg-glass hover:bg-primary-500/10 text-white transition-all duration-200 hover-scale">
              <Users size={20} />
              <span className="font-medium">Users</span>
            </button>

            <button className="w-full flex items-center space-x-4 p-4 rounded-xl bg-glass hover:bg-primary-500/10 text-white transition-all duration-200 hover-scale">
              <Bell size={20} />
              <span className="font-medium">Notifications</span>
            </button>

            <button
              onClick={() => {
                setShowDebug(!showDebug);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover-scale ${
                showDebug
                  ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                  : 'bg-glass hover:bg-primary-500/10 text-white'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Debug</span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="space-y-4 animate-slide-up-delay-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-glass hover:bg-primary-500/10 text-white transition-all duration-200 hover-scale"
            >
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                <span className="font-medium">Theme</span>
              </div>
              <div className={`w-8 h-4 rounded-full transition-all duration-200 ${
                theme === 'dark' ? 'bg-primary-500' : 'bg-gray-600'
              }`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 p-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all duration-200 hover-scale"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-topbar">
          <div className="flex items-center justify-between p-6 space-x-6 animate-fade-in">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 rounded-xl bg-glass hover:bg-primary-500/20 transition-all duration-200 hover-scale animate-slide-up"
              >
                <Menu size={24} className="text-white" />
              </button>
              
              <div className="space-y-2 animate-slide-up-delay">
                <h1 className="text-2xl font-bold text-white">{getGreeting()}, {user?.username || 'User'}!</h1>
                <p className="text-muted text-lg">Welcome back to your IoT dashboard</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4 animate-slide-up-delay-2">
              {/* Notifications */}
              <button className="p-3 rounded-xl bg-glass hover:bg-primary-500/20 transition-all duration-200 hover-scale relative">
                <Bell size={24} className="text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* User Avatar */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass hover:bg-primary-500/20 transition-all duration-200 hover-scale cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg animate-glow">
                  <User size={20} className="text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted">Online</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <div className="container mx-auto px-6 py-8 animate-fade-in-delay">
            {/* Backend Status */}
            <BackendStatus 
              backendAvailable={backendAvailable}
              textConnected={connectionStatus.textConnected}
              audioConnected={connectionStatus.audioConnected}
            />
            
            {/* Main Content */}
            {renderContent()}
            
            {/* Debug Section */}
            {showDebug && (
              <div className="mt-8 animate-fade-in">
                <DeviceDebug />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;