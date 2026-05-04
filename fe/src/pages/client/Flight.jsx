import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api, { authService } from '../../services/api';
import FlightList from '../../components/FlightList';

const normalize = (s) => (s || '').toString().trim();

const Flight = () => {
    const location = useLocation();
    const routeState = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [flights, setFlights] = useState([]);
    const [airports, setAirports] = useState([]);

    const [origin, setOrigin] = useState(routeState.origin || '');
    const [destination, setDestination] = useState(routeState.destination || '');
    const [date, setDate] = useState(routeState.date || '');
    const [pax, setPax] = useState(routeState.pax || { adult: 1, child: 0, infant: 0 });

    const [originOpen, setOriginOpen] = useState(false);
    const [destOpen, setDestOpen] = useState(false);
    const [paxOpen, setPaxOpen] = useState(false);
    const [airlineOpen, setAirlineOpen] = useState(false);

    const [searchOriginText, setSearchOriginText] = useState('');
    const [searchDestText, setSearchDestText] = useState('');
    const [allAirlines, setAllAirlines] = useState([]); // Store all unique airlines separately

    const [airlineFilter, setAirlineFilter] = useState(routeState.airlineId || null);

    const originRef = useRef(null);
    const destRef = useRef(null);
    const paxRef = useRef(null);
    const airlineRef = useRef(null);

    const [searching, setSearching] = useState(false);
    const totalPassengers = pax.adult + pax.child + pax.infant;

    // --- Các Icon SVG dùng trong thanh tìm kiếm ---
    const PlaneTakeoffIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12l5-5 1.5-.5a2 2 0 0 1 2.81.7l4 5.6c.55.77.46 1.81-.28 2.45L12 21Z" /></svg>
    );
    const PlaneLandingIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M2 15h20" /><path d="M10 15V8.5a2.5 2.5 0 0 1 5 0V15" /><path d="M14 15l4-5 3.3.66a2 2 0 0 1 1.56 2.3l-.56 2.04" /></svg>
    );
    const CalendarIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    );
    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    );
    const AirlineIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" /><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4 2-2.4 2.4-4-4 2.4-2.4 2 .4Z" /></svg>
    );

    useEffect(() => {
        const fetchAirports = async () => {
            try {
                const response = await api.get('/api/airports');
                setAirports(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sân bay", error);
            }
        };
        fetchAirports();
    }, []);

    useEffect(() => {
        const onDown = (e) => {
            if (paxOpen && paxRef.current && !paxRef.current.contains(e.target)) setPaxOpen(false);
            if (originOpen && originRef.current && !originRef.current.contains(e.target)) setOriginOpen(false);
            if (destOpen && destRef.current && !destRef.current.contains(e.target)) setDestOpen(false);
            if (airlineOpen && airlineRef.current && !airlineRef.current.contains(e.target)) setAirlineOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [paxOpen, originOpen, destOpen, airlineOpen]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError('');
            try {
                let data;
                if (routeState.origin && routeState.destination && routeState.date) {
                    data = await authService.searchFlights(routeState.origin, routeState.destination, routeState.date, routeState.airlineId);
                } else {
                    data = await authService.getAllFlights();
                }

                if (!cancelled) {
                    const flightList = Array.isArray(data) ? data : [];
                    setFlights(flightList);
                    
                    // If we don't have airlines yet, extract them from the first full load
                    if (allAirlines.length === 0 && flightList.length > 0) {
                        const airlineMap = new Map();
                        flightList.forEach(f => {
                            const hk = f.maHangHK;
                            if (hk && hk.maHangHK && hk.tenHang) {
                                airlineMap.set(hk.maHangHK, { id: hk.maHangHK, name: hk.tenHang });
                            } else if (f.mayBay?.hangBay) {
                                const hb = f.mayBay.hangBay;
                                const id = hb.maHangHK || hb.id;
                                const name = hb.tenHang || hb.tenHangBay;
                                if (id && name) airlineMap.set(id, { id, name });
                            }
                        });
                        setAllAirlines(Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    setError('Không thể tải danh sách chuyến bay từ hệ thống. Vui lòng thử lại.');
                    setFlights([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [routeState.origin, routeState.destination, routeState.date]);

    const filteredOriginAirports = airports.filter(a =>
        (a.thanhPho && a.thanhPho.toLowerCase().includes(searchOriginText.toLowerCase())) ||
        (a.maIATA && a.maIATA.toLowerCase().includes(searchOriginText.toLowerCase())) ||
        (a.tenSanBay && a.tenSanBay.toLowerCase().includes(searchOriginText.toLowerCase()))
    );

    const filteredDestAirports = airports.filter(a =>
        (a.thanhPho && a.thanhPho.toLowerCase().includes(searchDestText.toLowerCase())) ||
        (a.maIATA && a.maIATA.toLowerCase().includes(searchDestText.toLowerCase())) ||
        (a.tenSanBay && a.tenSanBay.toLowerCase().includes(searchDestText.toLowerCase()))
    );

    const availableAirlines = useMemo(() => {
        const airlineMap = new Map();
        (flights || []).forEach(f => {
            // Check both possible structures (maHangHK or mayBay.hangBay)
            const hk = f.maHangHK;
            if (hk && hk.maHangHK && hk.tenHang) {
                airlineMap.set(hk.maHangHK, { id: hk.maHangHK, name: hk.tenHang });
            } else if (f.mayBay?.hangBay) {
                const hb = f.mayBay.hangBay;
                const id = hb.maHangHK || hb.id;
                const name = hb.tenHang || hb.tenHangBay;
                if (id && name) airlineMap.set(id, { id, name });
            }
        });
        return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [flights]);

    const filteredClientSide = useMemo(() => {
        const o = normalize(origin).toLowerCase();
        const d = normalize(destination).toLowerCase();
        const day = normalize(date);

        return (flights || []).filter((f) => {
            const cityDi = normalize(f.maSanBayDi?.thanhPho).toLowerCase();
            const airportDi = normalize(f.maSanBayDi?.tenSanBay).toLowerCase();
            const cityDen = normalize(f.maSanBayDen?.thanhPho).toLowerCase();
            const airportDen = normalize(f.maSanBayDen?.tenSanBay).toLowerCase();
            const flightAirlineId = f.maHangHK?.maHangHK || f.mayBay?.hangBay?.maHangHK || f.mayBay?.hangBay?.id;

            const matchO = !o || cityDi.includes(o) || airportDi.includes(o);
            const matchD = !d || cityDen.includes(d) || airportDen.includes(d);
            const matchAirline = !airlineFilter || flightAirlineId === airlineFilter;

            if (!matchO || !matchD || !matchAirline) return false;

            if (!day) return true;
            const depart = f.ngayGioKhoiHanh ? new Date(f.ngayGioKhoiHanh) : null;
            if (!depart || Number.isNaN(depart.getTime())) return true;
            const yyyy = depart.getFullYear();
            const mm = String(depart.getMonth() + 1).padStart(2, '0');
            const dd = String(depart.getDate()).padStart(2, '0');
            const departDay = `${yyyy}-${mm}-${dd}`;

            return departDay === day;
        });
    }, [flights, origin, destination, date, airlineFilter]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        const o = normalize(origin);
        const d = normalize(destination);

        if (!o && !d && !date) return;

        setSearching(true);
        try {
            let data;
            if (o || d || date || airlineFilter) {
                data = await authService.searchFlights(o, d, date, airlineFilter);
            } else {
                data = await authService.getAllFlights();
            }
            setFlights(Array.isArray(data) ? data : []);
        } catch (e2) {
            setError('Tìm kiếm thất bại. Vui lòng thử lại.');
            setFlights([]);
        } finally {
            setSearching(false);
        }
    };

    const clearFilters = () => {
        setOrigin('');
        setDestination('');
        setDate('');
        setAirlineFilter(null);
        setPax({ adult: 1, child: 0, infant: 0 });
    };

    const list = filteredClientSide;

    const selectedOriginIATA = useMemo(() => {
        const apt = airports.find(a => a.thanhPho === origin);
        return apt ? apt.maIATA : (list[0]?.maSanBayDi?.maIATA || '---');
    }, [airports, origin, list]);

    const selectedDestIATA = useMemo(() => {
        const apt = airports.find(a => a.thanhPho === destination);
        return apt ? apt.maIATA : (list[0]?.maSanBayDen?.maIATA || '---');
    }, [airports, destination, list]);

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-slate-900 flex flex-col" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                    
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            <Navbar transparent={false} />

            <div className="mx-auto w-[min(1200px,96vw)] pt-[100px] flex-grow">
                {/* PHẦN TÌM KIẾM */}
                <div className="mb-10 relative z-30">
                    <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                        {/* Background Decor */}
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tìm Chuyến Bay</h1>
                                <p className="mt-1 text-sm font-bold text-slate-500">Khám phá thế giới cùng hàng ngàn lựa chọn bay tốt nhất.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-slate-200">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Đã tìm thấy</p>
                                    <p className="text-xl font-black text-slate-900">{list.length} <span className="text-xs font-bold text-slate-500">kết quả</span></p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="relative z-20">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 bg-slate-50/60 p-2.5 rounded-3xl border border-slate-100">

                                {/* ĐIỂM ĐI */}
                                <div className="relative group bg-white rounded-2xl p-2 border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all" ref={originRef}>
                                    <label className="px-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">Điểm đi</label>
                                    <button type="button" onClick={() => { setOriginOpen(!originOpen); setDestOpen(false); setPaxOpen(false); setAirlineOpen(false); setSearchOriginText(''); }} className="flex h-9 w-full items-center justify-between rounded-xl px-2 text-sm font-bold text-slate-800 transition-all outline-none">
                                        <span className="truncate">{origin || 'Chọn điểm đi'}</span>
                                        <div className="text-slate-400 group-hover:text-blue-500"><PlaneTakeoffIcon /></div>
                                    </button>
                                    {originOpen && (
                                        <div className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[360px] w-full min-w-[300px] overflow-hidden rounded-2xl border border-white bg-white/80 backdrop-blur-xl shadow-2xl animate-fade-in">
                                            <div className="p-3 border-b border-slate-100">
                                                <input type="text" autoFocus placeholder="Tìm thành phố..." className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" value={searchOriginText} onChange={(e) => setSearchOriginText(e.target.value)} />
                                            </div>
                                            <div className="overflow-y-auto max-h-[280px] p-1 scrollbar-hide">
                                                {filteredOriginAirports.length > 0 ? filteredOriginAirports.map((airport) => (
                                                    <button key={airport.maSanBay} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-blue-50 group/item transition-colors" onClick={() => { setOrigin(airport.thanhPho); setOriginOpen(false); setSearchOriginText(''); }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-blue-600 transition-all">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">{airport.thanhPho}</p>
                                                                <p className="text-[11px] text-slate-500 line-clamp-1">{airport.tenSanBay}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">{airport.maIATA}</span>
                                                    </button>
                                                )) : <div className="px-3 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ĐIỂM ĐẾN */}
                                <div className="relative group bg-white rounded-2xl p-2 border border-slate-100 hover:border-emerald-400 hover:shadow-md transition-all" ref={destRef}>
                                    <label className="px-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">Điểm đến</label>
                                    <button type="button" onClick={() => { setDestOpen(!destOpen); setOriginOpen(false); setPaxOpen(false); setAirlineOpen(false); setSearchDestText(''); }} className="flex h-9 w-full items-center justify-between rounded-xl px-2 text-sm font-bold text-slate-800 transition-all outline-none">
                                        <span className="truncate">{destination || 'Chọn điểm đến'}</span>
                                        <div className="text-slate-400 group-hover:text-emerald-500"><PlaneLandingIcon /></div>
                                    </button>
                                    {destOpen && (
                                        <div className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[360px] w-full min-w-[300px] overflow-hidden rounded-2xl border border-white bg-white/80 backdrop-blur-xl shadow-2xl animate-fade-in">
                                            <div className="p-3 border-b border-slate-100">
                                                <input type="text" autoFocus placeholder="Tìm thành phố..." className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all" value={searchDestText} onChange={(e) => setSearchDestText(e.target.value)} />
                                            </div>
                                            <div className="overflow-y-auto max-h-[280px] p-1 scrollbar-hide">
                                                {filteredDestAirports.length > 0 ? filteredDestAirports.map((airport) => (
                                                    <button key={airport.maSanBay} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-emerald-50 group/item transition-colors" onClick={() => { setDestination(airport.thanhPho); setDestOpen(false); setSearchDestText(''); }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-emerald-600 transition-all">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 group-hover/item:text-emerald-700">{airport.thanhPho}</p>
                                                                <p className="text-[11px] text-slate-500 line-clamp-1">{airport.tenSanBay}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all">{airport.maIATA}</span>
                                                    </button>
                                                )) : <div className="px-3 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* NGÀY BAY */}
                                <div className="group bg-white rounded-2xl p-2 border border-slate-100 hover:border-amber-400 hover:shadow-md transition-all">
                                    <label className="px-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">Ngày bay</label>
                                    <div className="relative">
                                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-full rounded-xl px-2 text-sm font-bold text-slate-800 outline-none cursor-pointer bg-transparent" />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-500 transition-colors">
                                            <CalendarIcon />
                                        </div>
                                    </div>
                                </div>

                                {/* HÀNH KHÁCH */}
                                <div className="relative group bg-white rounded-2xl p-2 border border-slate-100 hover:border-indigo-400 hover:shadow-md transition-all" ref={paxRef}>
                                    <label className="px-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">Hành khách</label>
                                    <button type="button" onClick={() => { setPaxOpen((v) => !v); setOriginOpen(false); setDestOpen(false); setAirlineOpen(false); }} className="flex h-9 w-full items-center justify-between rounded-xl px-2 text-sm font-bold text-slate-800 transition-all outline-none">
                                        <span>{totalPassengers} khách</span>
                                        <div className="text-slate-400 group-hover:text-indigo-500"><UserIcon /></div>
                                    </button>
                                    {paxOpen && (
                                        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[320px] rounded-2xl border border-white bg-white/80 backdrop-blur-xl p-5 shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                            <div className="space-y-3">
                                                {[
                                                    { key: 'adult', name: 'Người lớn', desc: '12 tuổi trở lên', min: 1 },
                                                    { key: 'child', name: 'Trẻ em', desc: '2-11 tuổi', min: 0 },
                                                    { key: 'infant', name: 'Em bé', desc: 'Dưới 2 tuổi', min: 0 },
                                                ].map((row) => {
                                                    const value = pax[row.key];
                                                    const canDec = value > row.min;
                                                    const canIncTotal = totalPassengers < 20;
                                                    const canIncInfant = row.key !== 'infant' || pax.infant < pax.adult;
                                                    const canInc = canIncTotal && canIncInfant;
                                                    return (
                                                        <div key={row.key} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{row.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{row.desc}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button type="button" disabled={!canDec} onClick={() => setPax((prev) => {
                                                                    const next = { ...prev, [row.key]: prev[row.key] - 1 };
                                                                    if (next.adult < 1) next.adult = 1;
                                                                    if (next.infant > next.adult) next.infant = next.adult;
                                                                    return next;
                                                                })} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all">-</button>
                                                                <span className="w-4 text-center text-sm font-bold text-slate-900">{value}</span>
                                                                <button type="button" disabled={!canInc} onClick={() => setPax((prev) => ({ ...prev, [row.key]: prev[row.key] + 1 }))} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all">+</button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button type="button" onClick={() => setPaxOpen(false)} className="mt-5 w-full py-3 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg">Hoàn tất</button>
                                        </div>
                                    )}
                                </div>

                                {/* HÃNG MÁY BAY */}
                                <div className="relative group bg-white rounded-2xl p-2 border border-slate-100 hover:border-rose-400 hover:shadow-md transition-all" ref={airlineRef}>
                                    <label className="px-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-500 transition-colors">Hãng máy bay</label>
                                    <button type="button" onClick={() => { setAirlineOpen(!airlineOpen); setOriginOpen(false); setDestOpen(false); setPaxOpen(false); }} className="flex h-9 w-full items-center justify-between rounded-xl px-2 text-sm font-bold text-slate-800 transition-all outline-none">
                                        <span className="truncate">{allAirlines.find(a => a.id === airlineFilter)?.name || 'Tất cả hãng'}</span>
                                        <div className="text-slate-400 group-hover:text-rose-500"><AirlineIcon /></div>
                                    </button>
                                    {airlineOpen && (
                                        <div className="absolute left-0 lg:right-0 lg:left-auto top-[calc(100%+8px)] z-50 max-h-[300px] w-full min-w-[240px] overflow-y-auto rounded-2xl border border-white bg-white/80 backdrop-blur-xl shadow-2xl animate-fade-in scrollbar-hide p-2">
                                            <button type="button" className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-bold transition-colors ${!airlineFilter ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => { setAirlineFilter(null); setAirlineOpen(false); }}>
                                                <span className="text-sm">Tất cả hãng bay</span>
                                                {!airlineFilter && <span className="text-rose-500 text-lg">✓</span>}
                                            </button>
                                            <div className="my-1 border-t border-slate-100"></div>
                                            {allAirlines.length > 0 ? allAirlines.map((al) => (
                                                <button key={al.id} type="button" className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-bold transition-colors mt-1 ${airlineFilter === al.id ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => { setAirlineFilter(al.id); setAirlineOpen(false); }}>
                                                    <span className="text-sm">{al.name}</span>
                                                    {airlineFilter === al.id && <span className="text-rose-500 text-lg">✓</span>}
                                                </button>
                                            )) : <div className="px-4 py-4 text-center text-xs font-bold text-slate-400">Không có dữ liệu</div>}
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 pt-6 gap-4">
                                <button type="button" onClick={clearFilters} disabled={loading || searching} className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors order-2 md:order-1">
                                    Làm mới bộ lọc
                                </button>
                                <button type="submit" disabled={loading || searching} className="inline-flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-[#c08d23] px-10 text-sm font-black text-white hover:bg-[#a97a1d] shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-70 order-1 md:order-2">
                                    {searching ? 'Đang tìm...' : 'Tìm Chuyến Bay'}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- COMPONENT DANH SÁCH CHUYẾN BAY --- */}
                <FlightList
                    list={list}
                    loading={loading}
                    error={error}
                    origin={origin}
                    destination={destination}
                    selectedOriginIATA={selectedOriginIATA}
                    selectedDestIATA={selectedDestIATA}
                    totalPassengers={totalPassengers}
                    pax={pax}
                />
            </div>
            <Footer />
        </div>
    );
};

export default Flight;