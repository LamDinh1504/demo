import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

const EmployeeSidebar = ({ user, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/employee/dashboard', label: 'Tổng quan', icon: '📊' },
        { path: '/employee/bookings', label: 'Bán vé', icon: '🎫' },
        { path: '/employee/checkin', label: 'Check-in', icon: '📋' },
        { path: '/employee/flights', label: 'Lịch bay', icon: '✈️' },
    ];

    return (
        <div className="w-full md:w-[280px] flex-shrink-0">
            <div className="bg-white shadow-sm border border-gray-200 h-full flex flex-col">
                <div className="p-6 border-b border-gray-100 flex flex-col items-center gap-2">
                    <img src={logoImg} alt="Logo" className="h-16 w-16 rounded-xl object-cover shadow-md" />
                    <span className="font-black text-xl text-[#333]">Employee Panel</span>
                </div>

                <nav className="flex flex-col text-[15px] text-[#333] flex-grow">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-4 px-5 py-4 text-left transition-colors border-b border-gray-100 ${isActive ? 'text-black font-semibold bg-gray-50/50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${isActive ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-4 px-5 py-4 text-left transition-colors border-b border-gray-100 hover:bg-gray-50"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500 text-white text-sm">
                            🌐
                        </div>
                        Xem Trang Chủ
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 text-red-600 mt-auto"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
                            <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                        </div>
                        Đăng xuất
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm">
                            {user?.user?.name?.charAt(0) || 'E'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{user?.user?.name || 'Nhân viên'}</p>
                            <p className="text-xs text-gray-500 truncate uppercase font-bold tracking-wider">EMP-{user?.user?.id?.toString().padStart(4, '0') || '0142'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSidebar;
