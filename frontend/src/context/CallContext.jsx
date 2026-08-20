import { useState } from 'react';
import { CallContext } from './CallContextDef';

export const CallProvider = ({ children }) => {
  const [currentCallId, setCurrentCallId] = useState(null);

  const [callHistory, setCallHistory] = useState(() => {
    // Load call history from localStorage
    const saved = localStorage.getItem('callHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Generate a new Call ID
  const generateCallId = () => {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 10000);
    const newCallId = `CR${date.getFullYear().toString().slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(timestamp % 10000).padStart(4, '0')}-${String(random).padStart(4, '0')}`;
    
    setCurrentCallId(newCallId);
    localStorage.setItem('currentCallId', newCallId);
    
    return newCallId;
  };

  // Save call to history
  const saveCallToHistory = (callData) => {
    const callWithId = {
      ...callData,
      callId: currentCallId,
      timestamp: new Date().toISOString(),
    };
    
    const updatedHistory = [callWithId, ...callHistory];
    setCallHistory(updatedHistory);
    localStorage.setItem('callHistory', JSON.stringify(updatedHistory));
  };

  // Clear current call ID
  const clearCurrentCallId = () => {
    setCurrentCallId(null);
    localStorage.removeItem('currentCallId');
  };

  const value = {
    currentCallId,
    callHistory,
    generateCallId,
    saveCallToHistory,
    clearCurrentCallId,
    setCurrentCallId,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};







