
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetail from './components/CarDetail'; // aus deinem bestehenden Code './components/CarDetail'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'autos', element: <CarsPage /> },       // /autos?category=SUV&...
      { path: 'autos/:id', element: <CarDetail /> },  // Detailseite
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
