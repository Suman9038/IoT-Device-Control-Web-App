import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDeviceService } from '../../services/deviceService';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Card from '../common/Card';

const DeviceDebug = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  const { user, isAuthenticated } = useAuth();
  const { registerDevice } = useDeviceService();
  const { error: showError, success: showSuccess } = useToast();

  const testAuth = () => {
    const token = localStorage.getItem('token');
    setDebugInfo(prev => ({
      ...prev,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      isAuthenticated,
      user: user ? { id: user.id, name: user.name, email: user.email } : null
    }));
    console.log('🔍 Auth Debug:', { hasToken: !!token, isAuthenticated, user });
  };

  const testModalOpen = () => {
    console.log('🔍 Testing modal open...');
    // This will help us test if the modal component is working
    setDebugInfo(prev => ({
      ...prev,
      modalTest: { success: true, message: 'Modal test triggered' }
    }));
  };

  const testDeviceRegistration = async () => {
    setLoading(true);
    try {
      const testDevice = {
        device_name: 'Test LED ' + Date.now(),
        device_type: 'LED'
      };
      
      console.log('🔍 Testing device registration...', testDevice);
      const result = await registerDevice(testDevice);
      console.log('✅ Success:', result);
      
      showSuccess('Device registration test successful!');
      setDebugInfo(prev => ({
        ...prev,
        lastTest: { success: true, device: result }
      }));
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      showError(`Registration failed: ${error.message}`);
      setDebugInfo(prev => ({
        ...prev,
        lastTest: { success: false, error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
      <h3 className="text-xl font-bold text-white mb-4">🔧 Device Registration Debug</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Has Token:</span>
            <span className={debugInfo.hasToken ? 'text-green-400' : 'text-red-400'}>
              {debugInfo.hasToken ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Authenticated:</span>
            <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
              {isAuthenticated ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">User ID:</span>
            <span className="text-white">{user?.id || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">User Email:</span>
            <span className="text-white">{user?.email || 'None'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={testAuth} className="flex-1">
            🔍 Test Auth
          </Button>
          <Button 
            variant="primary" 
            onClick={testDeviceRegistration} 
            loading={loading}
            disabled={!isAuthenticated}
            className="flex-1"
          >
            🧪 Test Registration
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={testModalOpen} className="flex-1">
            🔧 Test Modal
          </Button>
        </div>

        {debugInfo.lastTest && (
          <div className={`p-4 rounded-lg ${
            debugInfo.lastTest.success 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <h4 className="font-semibold mb-2">
              {debugInfo.lastTest.success ? '✅ Success' : '❌ Error'}
            </h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo.lastTest, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DeviceDebug;
