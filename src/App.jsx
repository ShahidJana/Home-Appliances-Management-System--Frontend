import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import InventoryList from './pages/InventoryList';
import VendorList from './pages/VendorList';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Plans from './pages/Plans';
import MainLayout from './layouts/MainLayout';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <MainLayout><Dashboard /></MainLayout> : <Navigate to="/login" />}
                />
                <Route
                    path="/customers"
                    element={isAuthenticated ? <MainLayout><CustomerList /></MainLayout> : <Navigate to="/login" />}
                />
                <Route
                    path="/inventory"
                    element={isAuthenticated ? <MainLayout><InventoryList /></MainLayout> : <Navigate to="/login" />}
                />
                <Route
                    path="/vendors"
                    element={isAuthenticated ? <MainLayout><VendorList /></MainLayout> : <Navigate to="/login" />}
                />
                <Route
                    path="/attendance"
                    element={isAuthenticated ? <MainLayout><Attendance /></MainLayout> : <Navigate to="/login" />}
                />
                <Route
                    path="/reports"
                    element={isAuthenticated ? <MainLayout><Reports /></MainLayout> : <Navigate to="/login" />}
                />
                <Route
                    path="/plans"
                    element={isAuthenticated ? <MainLayout><Plans /></MainLayout> : <Navigate to="/login" />}
                />

                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;
