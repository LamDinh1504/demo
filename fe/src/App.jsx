import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Login from './pages/client/Login';
import Register from './pages/client/Register';
import ForgotPassword from './pages/client/ForgotPassword';
import VerifyEmail from './pages/client/VerifyEmail';
import AdminAuth from './pages/admin/AdminAuth';
import Home from './pages/client/Home';
import AdminOverview from './pages/admin/AdminOverview';
import AdminFlights from './pages/admin/AdminFlights';
import AdminRegulations from './pages/admin/AdminRegulations';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAirports from './pages/admin/AdminAirports';
import AdminTicketClasses from './pages/admin/AdminTicketClasses';
import Flight from './pages/client/Flight';
import FlightDetail from './pages/client/FlightDetail';
import Orders from './pages/client/Orders';
import MyFlights from './pages/client/MyFlights';
import Profile from './pages/client/Profile';
import Notifications from './pages/client/Notifications';
import Support from './pages/client/Support';
import Payment from './pages/client/Payment';
import Promotions from './pages/client/Promotions';
import EmployeeOverview from './pages/employee/EmployeeOverview';
import EmployeeBookings from './pages/employee/EmployeeBookings';
import EmployeeCheckin from './pages/employee/EmployeeCheckin';
import EmployeeFlights from './pages/employee/EmployeeFlights';
import VnPayReturn from './pages/client/VnPayReturn';


import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/" element={<Home />} />
        <Route path="/flight" element={<Flight />} />
        <Route path="/flight-detail" element={<FlightDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/my-flights" element={<MyFlights />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/vnpay-return" element={<VnPayReturn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/support" element={<Support />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/admin/dashboard" element={<AdminOverview />} />
        <Route path="/admin/flights" element={<AdminFlights />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/airports" element={<AdminAirports />} />
        <Route path="/admin/ticket-classes" element={<AdminTicketClasses />} />
        <Route path="/admin/regulations" element={<AdminRegulations />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
        <Route path="/employee/dashboard" element={<EmployeeOverview />} />
        <Route path="/employee/bookings" element={<EmployeeBookings />} />
        <Route path="/employee/checkin" element={<EmployeeCheckin />} />
        <Route path="/employee/flights" element={<EmployeeFlights />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
