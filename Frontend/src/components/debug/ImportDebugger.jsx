import React from 'react';

const ImportDebugger = () => {
  const testImports = () => {
    try {
      // Test useWebSocket import
      const { useWebSocket } = require('../../hooks/useWebSocket');
      console.log('✅ useWebSocket import successful:', typeof useWebSocket);
      
      // Test useAuth import
      const { useAuth } = require('../../hooks/useAuth');
      console.log('✅ useAuth import successful:', typeof useAuth);
      
      // Test useToast import
      const { useToast } = require('../../hooks/useToast');
      console.log('✅ useToast import successful:', typeof useToast);
      
      // Test deviceService import
      const { useDeviceService } = require('../../services/deviceService');
      console.log('✅ useDeviceService import successful:', typeof useDeviceService);
      
      return true;
    } catch (error) {
      console.error('❌ Import error:', error);
      return false;
    }
  };

  React.useEffect(() => {
    console.log('🔍 Testing imports...');
    const success = testImports();
    if (success) {
      console.log('🎉 All imports working correctly!');
    } else {
      console.log('💥 Some imports failed!');
    }
  }, []);

  return (
    <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
      <h3 className="text-yellow-400 font-semibold mb-2">Import Debugger</h3>
      <p className="text-yellow-300 text-sm">
        Check the browser console for import test results.
      </p>
      <button 
        onClick={testImports}
        className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-400"
      >
        Test Imports Again
      </button>
    </div>
  );
};

export default ImportDebugger;
