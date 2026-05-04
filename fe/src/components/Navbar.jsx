// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { authService } from '../services/api';
// import logoImg from '../assets/logo.jpg';

// const Navbar = ({ transparent = false }) => {
//     const [user, setUser] = useState(null);
//     const [scrolled, setScrolled] = useState(false);
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//     const navigate = useNavigate();
//     const location = useLocation();

//     useEffect(() => {
//         const currentUser = authService.getCurrentUser();
//         setUser(currentUser);
//         const handleScroll = () => setScrolled(window.scrollY > 20);
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     const handleLogout = () => {
//         authService.logout();
//         setUser(null);
//         setMenuOpen(false);
//         setMobileMenuOpen(false);
//         navigate('/login');
//     };

//     const solid = !transparent || scrolled;
//     const profile = user?.user || user || {};
//     const isAdmin = (profile?.role || user?.role) === 'ADMIN';

//     // --- Dynamic Styles ---
//     const navBg = solid
//         ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-b border-white/20'
//         : 'bg-transparent';

//     const logoText = solid ? 'text-slate-900' : 'text-white';
//     const linkColor = solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white';
//     const activeLinkBg = solid ? 'bg-amber-500/10 text-amber-600' : 'bg-white/20 text-white';

//     const navLinks = [
//         { name: 'Trang chủ', path: '/' },
//         { name: 'Chuyến bay', path: '/flight' },
//         ...(user && !isAdmin ? [{ name: 'Chuyến bay của tôi', path: '/orders' }] : []),
//         ...(user && isAdmin ? [{ name: 'Quản lý FlightTicket', path: '/admin/dashboard' }] : []),
//         { name: 'Ưu đãi', path: '#' },
//         { name: 'Hỗ trợ', path: '/support' },
//     ];

//     return (
//         <nav className={`font-sans fixed inset-x-0 top-0 z-[100] h-20 transition-all duration-500 ease-in-out ${navBg} ${scrolled ? 'h-16' : 'h-20'}`}>
//             <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-12">

//                 {/* Logo */}
//                 <Link to="/" className="group relative flex items-center gap-3 outline-none">
//                     <div className="logo-animation relative h-10 w-10 overflow-hidden rounded-2xl bg-white shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
//                         <img src={logoImg} alt="FlyViet" className="h-full w-full object-cover" />
//                         <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
//                     </div>
//                     <div className="flex flex-col leading-none">
//                         <span className={`font-serif text-2xl font-black tracking-widest transition-colors duration-300 ${logoText}`}>
//                             FLYVIET
//                         </span>
//                         <span className="text-[10px] font-bold tracking-[0.3em] text-amber-500 opacity-80">PREMIUM AIRLINES</span>
//                     </div>
//                 </Link>

//                 {/* Desktop Nav */}
//                 <div className="hidden items-center gap-2 md:flex">
//                     {navLinks.map((link) => {
//                         const isActive = location.pathname === link.path;
//                         return (
//                             <Link
//                                 key={link.name}
//                                 to={link.path}
//                                 className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full ${isActive ? activeLinkBg : linkColor}`}
//                             >
//                                 {link.name}
//                                 {isActive && (
//                                     <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
//                                 )}
//                             </Link>
//                         );
//                     })}
//                 </div>

//                 {/* Right Actions */}
//                 <div className="flex items-center gap-4">
//                     {user ? (
//                         <div className="relative">
//                             <button
//                                 onClick={() => setMenuOpen(!menuOpen)}
//                                 className={`group flex items-center gap-2 rounded-2xl border p-1.5 transition-all duration-300 ${solid ? 'border-slate-200 bg-slate-50' : 'border-white/20 bg-white/10'} hover:border-amber-400`}
//                             >
//                                 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-black text-white shadow-lg transition-transform group-hover:scale-110">
//                                     {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
//                                 </div>
//                                 <span className={`hidden text-sm font-bold md:block ${logoText}`}>
//                                     {profile.name?.split(' ')[0] || 'Tài khoản'}
//                                 </span>
//                                 <svg className={`h-4 w-4 transition-transform duration-300 ${logoText} ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
//                                 </svg>
//                             </button>

//                             {/* User Dropdown */}
//                             {menuOpen && (
//                                 <>
//                                     <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
//                                     <div className="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-2 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 z-20">
//                                         <div className="px-4 py-3 border-b border-slate-50 mb-1">
//                                             <p className="text-xs font-medium text-slate-400">Đăng nhập với</p>
//                                             <p className="text-sm font-bold text-slate-900 truncate">{profile.email}</p>
//                                         </div>
//                                         <DropdownLink to="/profile" icon="user" label="Hồ sơ cá nhân" onClick={() => setMenuOpen(false)} />
//                                         {!isAdmin && <DropdownLink to="/orders" icon="ticket" label="Chuyến bay của tôi" onClick={() => setMenuOpen(false)} />}
//                                         <DropdownLink to="/notifications" icon="bell" label="Thông báo" onClick={() => setMenuOpen(false)} />
//                                         <div className="my-1 border-t border-slate-50" />
//                                         <button
//                                             onClick={handleLogout}
//                                             className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
//                                         >
//                                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                                             Đăng xuất
//                                         </button>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     ) : (
//                         <div className="flex items-center gap-2">
//                             <Link to="/login" className={`hidden px-5 py-2 text-sm font-bold transition-all md:block ${logoText} hover:opacity-70`}>
//                                 Đăng nhập
//                             </Link>
//                             <Link
//                                 to="/register"
//                                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
//                             >
//                                 Đăng ký
//                             </Link>
//                         </div>
//                     )}

//                     {/* Mobile Menu Toggle */}
//                     <button
//                         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                         className={`md:hidden p-2 rounded-xl transition-colors ${solid ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
//                     >
//                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             {mobileMenuOpen ? (
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                             ) : (
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
//                             )}
//                         </svg>
//                     </button>
//                 </div>
//             </div>

//             {/* Mobile Menu Overlay */}
//             {mobileMenuOpen && (
//                 <div className="fixed inset-0 z-[90] md:hidden">
//                     <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
//                     <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm border-l border-white/20 bg-white p-6 shadow-2xl transition-transform">
//                         <div className="flex flex-col gap-6 pt-12">
//                             {navLinks.map((link) => (
//                                 <Link
//                                     key={link.name}
//                                     to={link.path}
//                                     onClick={() => setMobileMenuOpen(false)}
//                                     className={`text-xl font-black ${location.pathname === link.path ? 'text-amber-500' : 'text-slate-900'}`}
//                                 >
//                                     {link.name}
//                                 </Link>
//                             ))}
//                             {!user && (
//                                 <div className="mt-4 flex flex-col gap-3 pt-6 border-t border-slate-100">
//                                     <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-600">Đăng nhập</Link>
//                                     <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-amber-500 py-4 text-center text-lg font-black text-white">Đăng ký ngay</Link>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </nav>
//     );
// };

// const DropdownLink = ({ to, icon, label, onClick }) => {
//     const icons = {
//         user: <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" />,
//         ticket: <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
//         bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//     };

//     return (
//         <Link
//             to={to}
//             onClick={onClick}
//             className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-600"
//         >
//             <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 {icons[icon]}
//             </svg>
//             {label}
//         </Link>
//     );
// };

// export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import logoImg from '../assets/logo.jpg';

const Navbar = ({ transparent = false }) => {
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const solid = !transparent || scrolled;
    const profile = user?.user || user || {};
    const findRoleAggressively = (obj) => {
        if (!obj) return "";
        // First check standard fields
        const standard = obj.role || obj.vaitro || obj.vaiTro || obj.VaiTro || "";
        if (standard) return standard;
        
        // If not found, scan all string properties for ADMIN or USER
        for (const key in obj) {
            const val = obj[key];
            if (typeof val === 'string') {
                const upper = val.toUpperCase();
                if (upper.includes('ADMIN') || upper.includes('USER')) return val;
            }
        }
        return "";
    };

    const rawRole = findRoleAggressively(profile) || findRoleAggressively(user) || "";
    const roleString = rawRole.toString().toUpperCase();
    const isAdmin = roleString.includes('ADMIN');
    const isEmployee = roleString.includes('USER') && !isAdmin;
    
    console.log("[NAVBAR DEBUG] Extracted Role:", roleString);
    
    // --- Dynamic Styles ---
    const navBg = solid
        ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-b border-white/20'
        : 'bg-transparent';

    const logoText = solid ? 'text-slate-900' : 'text-white';
    const linkColor = solid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white';
    const activeLinkBg = solid ? 'bg-amber-500/10 text-amber-600' : 'bg-white/20 text-white';

    const navLinks = [
        { name: 'Trang chủ', path: '/' },
        { name: 'Chuyến bay', path: '/flight' },
        ...(user && !isAdmin && !isEmployee ? [{ name: 'Chuyến bay của tôi', path: '/my-flights' }] : []),
        ...(user && isAdmin ? [{ name: 'Quản lý FlightTicket', path: '/admin/dashboard' }] : []),
        ...(user && isEmployee ? [{ name: 'Nhân viên FlightTicket', path: '/employee/dashboard' }] : []),
        { name: 'Ưu đãi', path: '/promotions' },
        { name: 'Hỗ trợ', path: '/support' },
    ];

    return (
        <>
            {/* Import Font Nunito giống với phong cách trên ảnh */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                `}
            </style>

            <nav
                style={{ fontFamily: "'Nunito', sans-serif" }}
                className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ease-in-out ${navBg} ${scrolled ? 'h-16' : 'h-20'}`}
            >
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-12">

                    {/* Logo */}
                    <Link to="/" className="group relative flex items-center gap-3 outline-none">
                        <div className="logo-animation relative h-10 w-10 overflow-hidden rounded-2xl bg-white shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                            <img src={logoImg} alt="FlyViet" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <div className="flex flex-col leading-none">
                            {/* Đã bỏ font-serif để logo dùng chung font Nunito bo tròn */}
                            <span className={`text-2xl font-black tracking-widest transition-colors duration-300 ${logoText}`}>
                                FLYVIET
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.3em] text-amber-500 opacity-80 mt-0.5">PREMIUM AIRLINES</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-2 md:flex">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full ${isActive ? activeLinkBg : linkColor}`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                to="/profile"
                                className={`group flex items-center gap-2 rounded-2xl border p-1.5 transition-all duration-300 ${solid ? 'border-slate-200 bg-slate-50' : 'border-white/20 bg-white/10'} hover:border-amber-400`}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-black text-white shadow-lg transition-transform group-hover:scale-110">
                                    {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className={`hidden text-sm font-bold md:block ${logoText}`}>
                                    {profile.name?.split(' ')[0] || 'Tài khoản'}
                                </span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className={`hidden px-5 py-2 text-sm font-bold transition-all md:block ${logoText} hover:opacity-70`}>
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-xl transition-colors ${solid ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-[90] md:hidden">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                        <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm border-l border-white/20 bg-white p-6 shadow-2xl transition-transform">
                            <div className="flex flex-col gap-6 pt-12">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-xl font-black ${location.pathname === link.path ? 'text-amber-500' : 'text-slate-900'}`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {!user && (
                                    <div className="mt-4 flex flex-col gap-3 pt-6 border-t border-slate-100">
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-600">Đăng nhập</Link>
                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-amber-500 py-4 text-center text-lg font-black text-white">Đăng ký ngay</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};



export default Navbar;