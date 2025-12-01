import { useState, useEffect } from 'react';
import DataroomLayout from '../DataroomLayout';

export default function DataroomLayoutExample() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  return (
    <DataroomLayout 
      isDarkMode={isDark}
      onToggleDarkMode={() => setIsDark(!isDark)}
    />
  );
}
