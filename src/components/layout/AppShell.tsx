import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#05050a] text-white">
      {/* Sidebar e Header REMOVIDOS para diagnóstico de performance */}
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};
export default AppShell;
