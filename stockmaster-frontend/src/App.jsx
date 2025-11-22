import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import LandingPage from './pages/landing/LandingPage';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ReceiptsList from './pages/documents/ReceiptsList';
import ReceiptForm from './pages/documents/ReceiptForm';
import DeliveriesList from './pages/documents/DeliveriesList';
import DeliveryForm from './pages/documents/DeliveryForm';
import TransfersList from './pages/documents/TransfersList';
import TransferForm from './pages/documents/TransferForm';
import AdjustmentsList from './pages/documents/AdjustmentsList';
import AdjustmentForm from './pages/documents/AdjustmentForm';
import WarehouseList from './pages/warehouses/WarehouseList';
import WarehouseDetail from './pages/warehouses/WarehouseDetail';
import Ledger from './pages/ledger/Ledger';
import Settings from './pages/settings/Settings';
import Profile from './pages/profile/Profile';
import AIAssistant from './pages/ai/AIAssistant';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductForm />} />
              <Route path="/receipts" element={<ReceiptsList />} />
              <Route path="/receipts/new" element={<ReceiptForm />} />
              <Route path="/receipts/:id" element={<div>Receipt Detail</div>} />
              <Route path="/deliveries" element={<DeliveriesList />} />
              <Route path="/deliveries/new" element={<DeliveryForm />} />
              <Route path="/deliveries/:id" element={<div>Delivery Detail</div>} />
              <Route path="/transfers" element={<TransfersList />} />
              <Route path="/transfers/new" element={<TransferForm />} />
              <Route path="/transfers/:id" element={<div>Transfer Detail</div>} />
              <Route path="/adjustments" element={<AdjustmentsList />} />
              <Route path="/adjustments/new" element={<AdjustmentForm />} />
              <Route path="/adjustments/:id" element={<div>Adjustment Detail</div>} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/warehouses" element={<WarehouseList />} />
              <Route path="/warehouses/:id" element={<WarehouseDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
