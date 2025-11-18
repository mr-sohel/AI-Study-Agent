import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import AppPage from './pages/AppPage';
import Features from './pages/Features';
import Docs from './pages/Docs';
import FAQ from './pages/FAQ';
import './App.css';

// Layout component with Header
const Layout = ({ children }) => {
  return (
    <div className="App">
      <Header />
      <main>{children}</main>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Landing />
      </Layout>
    ),
  },
  {
    path: '/app',
    element: (
      <Layout>
        <AppPage />
      </Layout>
    ),
  },
  {
    path: '/features',
    element: (
      <Layout>
        <Features />
      </Layout>
    ),
  },
  {
    path: '/docs',
    element: (
      <Layout>
        <Docs />
      </Layout>
    ),
  },
  {
    path: '/faq',
    element: (
      <Layout>
        <FAQ />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <Landing />
      </Layout>
    ),
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
