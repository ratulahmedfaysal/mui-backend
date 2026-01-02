import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;