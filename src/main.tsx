// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetail from './components/CarDetail';
import AdminView from './admin';
import { AuthProvider } from './contexts/AuthContext';
import { fetchLocations } from './api/client'; // <- Import für Test

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// TEST: Prüfen, ob Frontend das Backend erreichen kann
fetchLocations()
  .then(locations => {
    console.log('Locations fetched successfully:', locations);
  })
  .catch(err => {
    console.error('Error fetching locations:', err);
  });

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'autos', element: <CarsPage /> },
      { path: 'autos/:id', element: <CarDetail /> },
      { path: 'admin', element: <AdminView /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
