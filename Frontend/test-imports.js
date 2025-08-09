// Test file to verify imports are working correctly
import { useWebSocket } from './src/hooks/useWebSocket.jsx';
import { useAuth } from './src/hooks/useAuth.jsx';
import { useToast } from './src/hooks/useToast.jsx';

console.log('✅ All imports successful!');
console.log('useWebSocket:', typeof useWebSocket);
console.log('useAuth:', typeof useAuth);
console.log('useToast:', typeof useToast);
