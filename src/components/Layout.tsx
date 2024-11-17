import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onClick }) => {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  );
}; 