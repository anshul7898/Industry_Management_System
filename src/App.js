import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ProtectedRoute from './Components/ProtectedRoute';

import Home from './Components/Home';
import Login from './Components/Login';
import Product from './Components/Product';
import Accounts from './Components/Accounts';
import Order from './Components/Order';
import MachineMaintenance from './Components/MachineMaintenance';
import Inventory from './Components/Inventory';
import Delivery from './Components/Delivery';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/Home"
          element={
            <ProtectedRoute allowedRoles={['super_user']}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Product"
          element={
            <ProtectedRoute allowedRoles={['super_user', 'product_admin']}>
              <Product />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Accounts"
          element={
            <ProtectedRoute allowedRoles={['super_user', 'accounts_admin']}>
              <Accounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Order"
          element={
            <ProtectedRoute allowedRoles={['super_user', 'order_admin']}>
              <Order />
            </ProtectedRoute>
          }
        />

        <Route
          path="/MachineMaintenance"
          element={
            <ProtectedRoute
              allowedRoles={['super_user', 'machine_maintenance_admin']}
            >
              <MachineMaintenance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Inventory"
          element={
            <ProtectedRoute allowedRoles={['super_user', 'inventory_admin']}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Delivery"
          element={
            <ProtectedRoute allowedRoles={['super_user', 'delivery_admin']}>
              <Delivery />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
