import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboards from './components/AdminDashboards';
import UserDashboard from './components/UserDashboard';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute'; // Adjust the import path
import "./main.css"
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute element={<AdminDashboards />} allowedRoles={['admin']} />,
  },
  {
    path: '/user',
    element: <ProtectedRoute element={<UserDashboard />} allowedRoles={['user']} />,
  },
  {
    path: '/signup',
    element: <Signup />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboards />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </RouterProvider>
  </React.StrictMode>
);

reportWebVitals();
