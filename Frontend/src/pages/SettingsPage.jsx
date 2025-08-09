import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  Trash2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import UserProfile from '../components/dashboard/UserProfile';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Switch from '../components/common/Switch';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      deviceAlerts: true,
      systemUpdates: false
    },
    privacy: {
      dataCollection: false,
      analytics: true,
      locationTracking: false
    },
    system: {
      autoSync: true,
      darkMode: true,
      animations: true
    }
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Settings saved successfully');
    } catch (error) {
      showError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate data export
      const userData = {
        profile: user,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Data exported successfully');
    } catch (error) {
      showError('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    );
    
    if (confirmation !== 'DELETE') {
      return;
    }

    if (!window.confirm('Are you absolutely sure? This will permanently delete your account and all associated data.')) {
      return;
    }

    try {
      // Simulate API call to delete account
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Account deleted successfully');
      logout();
    } catch (error) {
      showError('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <Button
              variant="ghost"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              Back to Dashboard
            </Button>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              <p className="text-muted text-lg">Manage your account and preferences</p>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Settings size={20} />
                  Settings Menu
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <nav className="space-y-2">
                  <a href="#profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-bg-tertiary transition-colors text-white">
                    <User size={18} />
                    Profile Settings
                  </a>
                  <a href="#notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-bg-tertiary transition-colors text-muted">
                    <Bell size={18} />
                    Notifications
                  </a>
                  <a href="#privacy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-bg-tertiary transition-colors text-muted">
                    <Shield size={18} />
                    Privacy & Security
                  </a>
                  <a href="#data" className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-bg-tertiary transition-colors text-muted">
                    <Database size={18} />
                    Data Management
                  </a>
                </nav>
              </Card.Body>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <section id="profile" className="animate-slide-up">
              <UserProfile />
            </section>

            {/* Notification Settings */}
            <section id="notifications" className="animate-slide-up-delay">
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Bell size={20} />
                    Notification Preferences
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-sm text-muted">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(value) => handleSettingChange('notifications', 'email', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Push Notifications</h4>
                        <p className="text-sm text-muted">Receive browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(value) => handleSettingChange('notifications', 'push', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Device Alerts</h4>
                        <p className="text-sm text-muted">Get notified about device status changes</p>
                      </div>
                      <Switch
                        checked={settings.notifications.deviceAlerts}
                        onChange={(value) => handleSettingChange('notifications', 'deviceAlerts', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">System Updates</h4>
                        <p className="text-sm text-muted">Notifications about system updates</p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemUpdates}
                        onChange={(value) => handleSettingChange('notifications', 'systemUpdates', value)}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </section>

            {/* Privacy Settings */}
            <section id="privacy" className="animate-slide-up-delay-2">
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Shield size={20} />
                    Privacy & Security
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Data Collection</h4>
                        <p className="text-sm text-muted">Allow anonymous usage data collection</p>
                      </div>
                      <Switch
                        checked={settings.privacy.dataCollection}
                        onChange={(value) => handleSettingChange('privacy', 'dataCollection', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Analytics</h4>
                        <p className="text-sm text-muted">Help improve the service with analytics</p>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onChange={(value) => handleSettingChange('privacy', 'analytics', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Location Tracking</h4>
                        <p className="text-sm text-muted">Enable location-based features</p>
                      </div>
                      <Switch
                        checked={settings.privacy.locationTracking}
                        onChange={(value) => handleSettingChange('privacy', 'locationTracking', value)}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </section>

            {/* Data Management */}
            <section id="data" className="animate-slide-up-delay-3">
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Database size={20} />
                    Data Management
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="secondary"
                        icon={<Download size={16} />}
                        onClick={handleExportData}
                        className="flex-1"
                      >
                        Export Data
                      </Button>
                      
                      <Button
                        variant="ghost"
                        icon={<RefreshCw size={16} />}
                        onClick={() => showSuccess('Data synced successfully')}
                        className="flex-1"
                      >
                        Sync Data
                      </Button>
                    </div>

                    <div className="border-t border-dark-border pt-6">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={20} className="text-red-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                            <p className="text-sm text-muted mb-4">
                              This action cannot be undone. This will permanently delete your account and all of your data.
                            </p>
                            <Button
                              variant="error"
                              icon={<Trash2 size={16} />}
                              onClick={handleDeleteAccount}
                              size="sm"
                            >
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </section>

            {/* Save Settings */}
            <div className="flex justify-center animate-slide-up-delay-4">
              <Button
                variant="primary"
                icon={<Save size={16} />}
                onClick={handleSaveSettings}
                loading={loading}
                className="min-w-[200px]"
              >
                Save All Settings
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
