import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { DashboardProvider } from './contexts/DashboardContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Configure from './pages/Configure';
import Orders from './pages/Orders';
import AIPanel from './components/AIPanel';
import OnboardingTour from './components/OnboardingTour';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    return (
        <ThemeProvider>
            <OrdersProvider>
                <DashboardProvider>
                    <BrowserRouter>
                        <div className="app-wrapper">
                            <div className="mesh-bg" />
                            <Navbar />
                            <Sidebar />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/configure" element={<Configure />} />
                                    <Route path="/orders" element={<Orders />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </main>
                            <AIPanel />
                            <OnboardingTour />
                            <ToastContainer theme="dark" position="bottom-right" />
                        </div>
                    </BrowserRouter>
                </DashboardProvider>
            </OrdersProvider>
        </ThemeProvider>
    );
}
