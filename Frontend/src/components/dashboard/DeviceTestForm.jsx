import React, { useState } from 'react';
import { Play, Zap } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const DeviceTestForm = () => {
  const [deviceName, setDeviceName] = useState('Test Device');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testDeviceAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing device API...');
      
      // Get token
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        setResult('❌ No authentication token found');
        return;
      }

      // Test API call directly
      const response = await fetch('http://localhost:8000/register/device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          device_name: deviceName,
          device_type: 'LED'
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success:', data);
        setResult(`✅ Device created successfully! ID: ${data.id}, Name: ${data.device_name}`);
      } else {
        const errorData = await response.text();
        console.error('❌ Error response:', errorData);
        setResult(`❌ Error ${response.status}: ${errorData}`);
      }
      
    } catch (error) {
      console.error('❌ Network error:', error);
      setResult(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing authentication...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('❌ No token found');
        return;
      }

      const response = await fetch('http://localhost:8000/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Auth test success:', userData);
        setResult(`✅ Authenticated as: ${userData.username} (${userData.email})`);
      } else {
        const errorData = await response.text();
        console.error('❌ Auth test failed:', errorData);
        setResult(`❌ Auth failed ${response.status}: ${errorData}`);
      }
      
    } catch (error) {
      console.error('❌ Auth test error:', error);
      setResult(`❌ Auth error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8 border-yellow-500/50 bg-yellow-500/10">
      <Card.Header>
        <Card.Title className="flex items-center gap-2 text-yellow-400">
          <Play size={20} />
          Device API Test Panel
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Test device name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button
                onClick={testAuth}
                loading={loading}
                disabled={loading}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Test Auth
              </Button>
              <Button
                onClick={testDeviceAPI}
                loading={loading}
                disabled={loading || !deviceName.trim()}
                variant="primary"
                size="sm"
                className="flex-1"
                icon={<Zap size={16} />}
              >
                Test Add Device
              </Button>
            </div>
          </div>
          
          {result && (
            <div className="p-3 bg-dark-bg-tertiary rounded-lg border border-dark-border">
              <p className="text-sm font-mono text-white whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DeviceTestForm;
