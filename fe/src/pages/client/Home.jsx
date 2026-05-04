import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

import acbLogo from '../../assets/acb.jpg';
import bidvLogo from '../../assets/bidv.jpg';
import hdbankLogo from '../../assets/hdbank.jpg';
import kbankLogo from '../../assets/kbank.jpg';
import mbLogo from '../../assets/mb.jpg';
import momoLogo from '../../assets/momo.jpg';
import ocbLogo from '../../assets/ocb.jpg';
import onepayLogo from '../../assets/onepay.jpg';
import sacombankLogo from '../../assets/sacombank.jpg';
import seabankLogo from '../../assets/seabank.jpg';
import techcombankLogo from '../../assets/techcombank.jpg';
import tpbankLogo from '../../assets/tpbank.jpg';
import vibLogo from '../../assets/vib.jpg';
import vietcombankLogo from '../../assets/vietcombank.jpg';
import vietqrLogo from '../../assets/vietqr.jpg';
import viettinbankLogo from '../../assets/viettinbank.jpg';
import visaLogo from '../../assets/visa.jpg';
import vpbankLogo from '../../assets/vpbank.jpg';
import zalopayLogo from '../../assets/zalopay.jpg';

// --- Các Icon SVG dùng trong thanh tìm kiếm ---
const PlaneTakeoffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12l5-5 1.5-.5a2 2 0 0 1 2.81.7l4 5.6c.55.77.46 1.81-.28 2.45L12 21Z" /></svg>
);
const PlaneLandingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M2 15h20" /><path d="M10 15V8.5a2.5 2.5 0 0 1 5 0V15" /><path d="M14 15l4-5 3.3.66a2 2 0 0 1 1.56 2.3l-.56 2.04" /></svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const AirlineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" /><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4 2-2.4 2.4-4-4 2.4-2.4 2 .4Z" /></svg>
);

const Home = () => {
    const [origin, setOrigin] = useState('SGN');
    const [destination, setDestination] = useState('HAN');
    const [departureDate, setDepartureDate] = useState('');
    const [pax, setPax] = useState({ adult: 1, child: 0, infant: 0 });
    const [paxOpen, setPaxOpen] = useState(false);
    const [airlineOpen, setAirlineOpen] = useState(false);
    const [airlineFilter, setAirlineFilter] = useState(null);
    const [allAirlines, setAllAirlines] = useState([]);
    const paxRef = useRef(null);
    const airlineRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [activeServiceTab, setActiveServiceTab] = useState('Trước khi đặt vé');
    const navigate = useNavigate();
    const totalPassengers = pax.adult + pax.child + pax.infant;

    const [airports, setAirports] = useState([]);
    const [originOpen, setOriginOpen] = useState(false);
    const [destOpen, setDestOpen] = useState(false);
    const [searchOriginText, setSearchOriginText] = useState('');
    const [searchDestText, setSearchDestText] = useState('');
    const originRef = useRef(null);
    const destRef = useRef(null);

    const paxLabel = (() => {
        const parts = [];
        if (pax.adult) parts.push(`${pax.adult} Người lớn`);
        if (pax.child) parts.push(`${pax.child} Trẻ em`);
        if (pax.infant) parts.push(`${pax.infant} Em bé`);
        return parts.join(', ') || '1 Người lớn';
    })();

    const selectedOrigin = airports.find(a => a.maIATA === origin) || null;
    const selectedDest = airports.find(a => a.maIATA === destination) || null;

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

    const [promos, setPromos] = useState([]);
    const [promoLoading, setPromoLoading] = useState(true);

    useEffect(() => {
        authService.getCurrentUser();

        const fetchAirports = async () => {
            try {
                const response = await api.get('/api/airports');
                setAirports(response.data);
            } catch (error) {
                console.error("Failed to fetch airports", error);
            }
        };

        const fetchPromos = async () => {
            try {
                setPromoLoading(true);
                const data = await authService.getActivePromotions();
                setPromos(data.slice(0, 3)); // Lấy 3 ưu đãi đầu tiên để hiển thị ở Home
                setPromoLoading(false);
            } catch (error) {
                console.error("Failed to fetch promotions", error);
                setPromoLoading(false);
            }
        };

        const fetchAirlines = async () => {
            try {
                const data = await authService.getAllFlights();
                const airlineMap = new Map();
                (data || []).forEach(f => {
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
            } catch (error) {
                console.error("Failed to fetch airlines", error);
            }
        };

        fetchAirports();
        fetchPromos();
        fetchAirlines();
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
    }, [paxOpen, originOpen, destOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);

        const originCity = selectedOrigin ? selectedOrigin.thanhPho : origin;
        const destCity = selectedDest ? selectedDest.thanhPho : destination;

        navigate('/flight', {
            state: {
                origin: originCity.trim(),
                destination: destCity.trim(),
                date: departureDate,
                pax,
                airlineId: airlineFilter,
            },
        });
        setLoading(false);
    };

    const destinations = [
        { name: 'Đà Nẵng', tag: 'Thành phố biển', price: '790.000 VNĐ', img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80' },
        { name: 'Phú Quốc', tag: 'Đảo ngọc', price: '1.100.000 VNĐ', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Hà Nội', tag: 'Thủ đô', price: '850.000 VNĐ', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80' },
    ];

    const serviceTabs = ['Trước khi đặt vé', 'Khi đặt vé', 'Sau khi đặt vé', 'Lên kế hoạch chuyến đi'];

    const serviceData = {
        'Trước khi đặt vé': [
            {
                title: 'Smart Combo',
                desc: 'Với vé Smart Combo của FlyViet, bạn có thể đặt vé máy bay hạng sang với giá rẻ hơn tới 40%. Tận hưởng chuyến bay với giá cả phải chăng hơn. Trải nghiệm các chuyến bay với Air France, Cathay Pacific, Etihad, KLM, Lufthansa và Singapore Airlines với giá cả phải chăng hơn. Thật dễ dàng: tìm các chuyến bay được đánh dấu Smart Combo, sau đó chọn chuyến bay phù hợp với nhu cầu của bạn.'
            },
            {
                title: 'Vé máy bay đa thành phố',
                desc: 'Khám phá nhiều thành phố hơn bằng cách đặt vé máy bay trên FlyViet. Bạn có thể đi du lịch đến nhiều điểm đến khác nhau—bay tới đa 5 tuyến đường khác nhau, đặt chân đến 10 thành phố—tất cả trong một lần đặt. Bắt đầu hành trình của bạn bằng cách mở menu Vé máy bay, chọn tùy chọn Đa thành phố, điền các tuyến bay của bạn, sau đó chọn các chuyến bay bạn muốn.'
            },
            {
                title: 'Vé linh hoạt cao',
                desc: 'Kế hoạch du lịch của bạn liên tục thay đổi? Với Vé linh hoạt cao trên FlyViet, bạn có thể thay đổi lịch trình chuyến bay nội địa của mình mà không bị phạt và được hoàn tiền với phí thấp. Mở menu Vé máy bay, điền thông tin chi tiết chuyến bay của bạn, nhấp vào \'Các tùy chọn khác\' ở dưới cùng và chọn \'Linh hoạt cao\' trong các tùy chọn Linh hoạt vé trước khi bạn bắt đầu tìm kiếm chuyến bay của mình.'
            }
        ],
        'Khi đặt vé': [
            {
                title: 'Thanh toán an toàn',
                desc: 'Đảm bảo mọi giao dịch của bạn đều được mã hóa an toàn với các chuẩn quốc tế. FlyViet hỗ trợ đa dạng phương thức thanh toán linh hoạt giúp quá trình đặt vé của bạn nhanh chóng.'
            },
            {
                title: 'Tích điểm thành viên',
                desc: 'Đăng nhập khi đặt vé để tích lũy điểm thưởng. Điểm thưởng có thể được sử dụng để đổi các chuyến bay miễn phí hoặc nhận ưu đãi độc quyền từ mạng lưới đối tác của FlyViet.'
            }
        ],
        'Sau khi đặt vé': [
            {
                title: 'Quản lý đặt chỗ',
                desc: 'Dễ dàng thay đổi thông tin, mua thêm hành lý hoặc nâng hạng ghế sau khi đã hoàn tất đặt vé. Tất cả thao tác chỉ cần thực hiện trực tuyến trên website của FlyViet.'
            },
            {
                title: 'Làm thủ tục trực tuyến',
                desc: 'Tiết kiệm thời gian chờ đợi tại sân bay bằng cách check-in online trước 24 giờ so với giờ bay. Chọn sẵn ghế ngồi ưa thích và nhận thẻ lên tàu bay điện tử sớm nhất.'
            }
        ],
        'Lên kế hoạch chuyến đi': [
            {
                title: 'Cẩm nang du lịch',
                desc: 'Khám phá các mẹo du lịch, gợi ý điểm đến và lịch trình hoàn hảo cho chuyến đi của bạn cùng FlyViet. Các kinh nghiệm được chia sẻ từ những travel blogger hàng đầu.'
            },
            {
                title: 'Combo du lịch',
                desc: 'Tối ưu chi phí bằng cách đặt trọn gói Vé máy bay & Khách sạn. Mức giá ưu đãi đặc biệt khi sử dụng các gói du lịch được thiết kế riêng cho bạn.'
            }
        ]
    };

    const paymentPartners = [
        { name: 'VietQR', src: vietqrLogo },
        { name: 'VISA', src: visaLogo },
        { name: 'MoMo', src: momoLogo },
        { name: 'ZaloPay', src: zalopayLogo },
        { name: 'OnePay', src: onepayLogo },
        { name: 'Vietcombank', src: vietcombankLogo },
        { name: 'BIDV', src: bidvLogo },
        { name: 'VietinBank', src: viettinbankLogo },
        { name: 'Techcombank', src: techcombankLogo },
        { name: 'MB', src: mbLogo },
        { name: 'ACB', src: acbLogo },
        { name: 'TPBank', src: tpbankLogo },
        { name: 'VPBank', src: vpbankLogo },
        { name: 'HDBank', src: hdbankLogo },
        { name: 'OCB', src: ocbLogo },
        { name: 'Sacombank', src: sacombankLogo },
        { name: 'SeABank', src: seabankLogo },
        { name: 'VIB', src: vibLogo },
        { name: 'KBank', src: kbankLogo },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {/* Nhúng font Nunito từ Google Fonts giống font Vietjet */}
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

            <Navbar transparent={true} />

            <section className="relative flex min-h-[420px] items-center overflow-hidden sm:min-h-[520px]">
                <img
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    src="https://inkythuatso.com/uploads/thumbnails/800/2023/02/hinh-anh-may-bay-tren-bau-troi-inkythuatso-1-07-11-33-06.jpg"
                    alt="Hình ảnh máy bay trên bầu trời xanh"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/10" />
                <div className="relative z-10 px-[8vw] py-12 w-full max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-[0.15em] text-yellow-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.707 11.293a1 1 0 01-1.414 0L6.586 10.586A1 1 0 017.5 8h5a1 1 0 01.707 1.707l-2.5 2.586z"></path></svg>
                        HÀNH TRÌNH KHÔNG GIỚI HẠN
                    </div>
                    <h1 className="mb-4 text-5xl font-black leading-tight text-white sm:text-7xl">
                        Vươn tầm thế giới,<br />
                        <em className="font-semibold text-[#f5b82e] not-italic">trải nghiệm tinh hoa</em>
                    </h1>
                    <p className="max-w-md text-sm font-medium leading-6 text-white/80">
                        Khám phá những hành trình tuyệt vời cùng sự phục vụ tận tâm trong từng khoảnh khắc.
                    </p>
                </div>
            </section>

            {/* DESIGN MỚI CHO THANH TÌM KIẾM */}
            <div className="relative z-20 -mt-12 px-[5vw]">
                <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-[1200px] items-center justify-between rounded-2xl bg-white p-2 shadow-2xl">

                    {/* Origin */}
                    <div className="relative flex-1 border-r border-slate-200 px-4 py-2 hover:bg-slate-50 rounded-l-xl transition group cursor-pointer" ref={originRef} onClick={() => { setOriginOpen(!originOpen); setDestOpen(false); setPaxOpen(false); setSearchOriginText(''); }}>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">Khởi hành</label>
                        <div className="mt-1 flex items-center justify-between">
                            <div className="flex-1 truncate pr-2">
                                <p className="text-xl font-bold text-slate-900 leading-none">{origin}</p>
                                <p className="text-xs text-slate-500 truncate mt-1">{selectedOrigin ? selectedOrigin.thanhPho : 'Chọn điểm khởi hành'}</p>
                            </div>
                            <PlaneTakeoffIcon className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        {originOpen && (
                            <div className="absolute left-0 top-[calc(100%+12px)] z-50 max-h-[400px] w-full min-w-[340px] overflow-hidden rounded-2xl border border-white bg-white/80 backdrop-blur-xl shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                <div className="p-3 border-b border-slate-100">
                                    <input
                                        type="text" autoFocus placeholder="Tìm thành phố hoặc sân bay..."
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        value={searchOriginText} onChange={(e) => setSearchOriginText(e.target.value)}
                                    />
                                </div>
                                <div className="overflow-y-auto max-h-[300px] p-1 scrollbar-hide">
                                    {filteredOriginAirports.map((airport) => (
                                        <button key={airport.maSanBay} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-blue-50 group/item transition-colors" 
                                            onClick={() => { setOrigin(airport.maIATA); setOriginOpen(false); setSearchOriginText(''); }}>
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
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Destination */}
                    <div className="relative flex-1 border-r border-slate-200 px-4 py-2 hover:bg-slate-50 transition group cursor-pointer" ref={destRef} onClick={() => { setDestOpen(!destOpen); setOriginOpen(false); setPaxOpen(false); setSearchDestText(''); }}>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">Điểm đến</label>
                        <div className="mt-1 flex items-center justify-between">
                            <div className="flex-1 truncate pr-2">
                                <p className="text-xl font-bold text-slate-900 leading-none">{destination}</p>
                                <p className="text-xs text-slate-500 truncate mt-1">{selectedDest ? selectedDest.thanhPho : 'Chọn điểm đến'}</p>
                            </div>
                            <PlaneLandingIcon className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        {destOpen && (
                            <div className="absolute left-0 top-[calc(100%+12px)] z-50 max-h-[400px] w-full min-w-[340px] overflow-hidden rounded-2xl border border-white bg-white/80 backdrop-blur-xl shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                <div className="p-3 border-b border-slate-100">
                                    <input
                                        type="text" autoFocus placeholder="Tìm thành phố hoặc sân bay..."
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                        value={searchDestText} onChange={(e) => setSearchDestText(e.target.value)}
                                    />
                                </div>
                                <div className="overflow-y-auto max-h-[300px] p-1 scrollbar-hide">
                                    {filteredDestAirports.map((airport) => (
                                        <button key={airport.maSanBay} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-emerald-50 group/item transition-colors" 
                                            onClick={() => { setDestination(airport.maIATA); setDestOpen(false); setSearchDestText(''); }}>
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
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <div className="flex-1 border-r border-slate-200 px-4 py-2 hover:bg-slate-50 transition group cursor-pointer relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">Ngày đi</label>
                        <div className="mt-1 flex items-center justify-between">
                            <input 
                                className="w-full bg-transparent text-xl font-bold outline-none text-slate-900 cursor-pointer" 
                                type="date" 
                                value={departureDate} 
                                onChange={(e) => setDepartureDate(e.target.value)} 
                            />
                            <CalendarIcon className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </div>

                    {/* Passengers */}
                    <div className="relative flex-1 px-4 py-2 hover:bg-slate-50 transition group cursor-pointer" ref={paxRef} onClick={() => { setPaxOpen((v) => !v); setOriginOpen(false); setDestOpen(false); }}>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">Hành khách</label>
                        <div className="mt-1 flex items-center justify-between">
                            <div className="flex-1 truncate pr-2">
                                <p className="text-xl font-bold text-slate-900 leading-none">{totalPassengers} Khách</p>
                                <p className="text-xs text-slate-500 truncate mt-1">{paxLabel}</p>
                            </div>
                            <UserIcon className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>

                        {paxOpen && (
                            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-full min-w-[320px] rounded-2xl border border-white bg-white/80 backdrop-blur-xl p-6 shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-4">
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
                                                    <button type="button" disabled={!canDec} onClick={() => { setPax((prev) => { const next = { ...prev, [row.key]: prev[row.key] - 1 }; if (next.adult < 1) next.adult = 1; if (next.infant > next.adult) next.infant = next.adult; return next; }); }} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all">-</button>
                                                    <span className="w-4 text-center text-sm font-bold text-slate-900">{value}</span>
                                                    <button type="button" disabled={!canInc} onClick={() => setPax((prev) => ({ ...prev, [row.key]: prev[row.key] + 1 }))} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all">+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button type="button" className="mt-5 w-full py-3 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg" onClick={() => setPaxOpen(false)}>Hoàn tất</button>
                            </div>
                        )}
                    </div>

                    {/* Airline Selection */}
                    <div className="relative flex-1 px-4 py-2 hover:bg-slate-50 transition group cursor-pointer" ref={airlineRef} onClick={() => { setAirlineOpen(!airlineOpen); setOriginOpen(false); setDestOpen(false); setPaxOpen(false); }}>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-500 transition-colors">Hãng hàng không</label>
                        <div className="mt-1 flex items-center justify-between">
                            <div className="flex-1 truncate pr-2">
                                <p className="text-xl font-bold text-slate-900 leading-none">{allAirlines.find(a => a.id === airlineFilter)?.name || 'Tất cả hãng'}</p>
                                <p className="text-xs text-slate-500 truncate mt-1">Chọn hãng bay yêu thích</p>
                            </div>
                            <AirlineIcon className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                        </div>

                        {airlineOpen && (
                            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-full min-w-[280px] rounded-2xl border border-white bg-white/80 backdrop-blur-xl p-2 shadow-xl animate-fade-in scrollbar-hide max-h-[300px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-bold transition-colors ${!airlineFilter ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => { setAirlineFilter(null); setAirlineOpen(false); }}>
                                    <span className="text-sm">Tất cả hãng bay</span>
                                    {!airlineFilter && <span className="text-rose-500 text-lg">✓</span>}
                                </button>
                                <div className="my-1 border-t border-slate-100"></div>
                                {allAirlines.map((al) => (
                                    <button key={al.id} type="button" className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-bold transition-colors mt-1 ${airlineFilter === al.id ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => { setAirlineFilter(al.id); setAirlineOpen(false); }}>
                                        <span className="text-sm">{al.name}</span>
                                        {airlineFilter === al.id && <span className="text-rose-500 text-lg">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pl-3 pr-2">
                        <button type="submit" className="flex h-12 items-center gap-2 rounded-xl bg-[#c08d23] px-6 text-sm font-bold text-white hover:bg-[#a97a1d] transition" disabled={loading}>
                            {loading ? 'Đang tải...' : 'Tìm chuyến bay'}
                            <PlaneTakeoffIcon />
                        </button>
                    </div>
                </form>
            </div>

            {/* DESIGN MỚI CHO ĐIỂM ĐẾN NỔI BẬT THÁNG NÀY */}
            <section className="px-[8vw] pb-12 pt-24 max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Phần tiêu đề nằm bên trái */}
                    <div className="lg:w-1/4 flex-shrink-0 pt-4">
                        <span className="mb-4 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600">Khám phá</span>
                        <h2 className="text-4xl font-black text-slate-900 sm:text-5xl leading-tight">Điểm đến nổi bật<br />tháng này</h2>
                    </div>

                    {/* Phần danh sách cards dàn ngang bên phải */}
                    <div className="flex-1 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                        {destinations.map((dest) => (
                            <div key={dest.name} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition hover:-translate-y-1 hover:shadow-lg flex flex-col">
                                <div className="h-40 overflow-hidden shrink-0">
                                    <img src={dest.img} alt={dest.name} loading="lazy" className="h-full w-full object-cover" />
                                </div>
                                <div className="p-4 flex flex-col flex-1 justify-between bg-white">
                                    <h3 className="text-xl font-bold text-slate-900">{dest.name}</h3>
                                    <p className="mt-2 text-sm text-slate-500">Giá vé từ <span className="font-bold text-slate-900">{dest.price}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PHẦN ƯU ĐÃI ĐẶC BIỆT MỚI THÊM - ĐÃ ĐỔI SANG TONE TRẮNG */}
            <section className="px-[8vw] py-20 bg-white relative">
                <div className="max-w-[1240px] mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <span className="mb-4 inline-block text-amber-600 font-black text-xs uppercase tracking-[0.2em]">FlyViet Promotions</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Ưu đãi đặc biệt <br />dành cho bạn</h2>
                        </div>
                        <button
                            onClick={() => navigate('/promotions')}
                            className="text-amber-600 font-bold hover:text-amber-700 transition-colors flex items-center gap-2 group"
                        >
                            Xem tất cả ưu đãi
                            <svg className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {promoLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-slate-50 h-80 rounded-[2rem] animate-pulse border border-slate-100"></div>
                            ))
                        ) : promos.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-slate-400 font-bold text-lg">Hiện chưa có ưu đãi đặc biệt nào mới.</p>
                            </div>
                        ) : (
                            promos.map((promo, idx) => (
                                <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 group flex flex-col h-full">
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <img
                                            src={promo.urlImage || "https://images.unsplash.com/photo-1540339832862-474559151b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                            alt={promo.tenChuongTrinh}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                {promo.phanTramGiam > 0 ? `GIẢM ${promo.phanTramGiam}%` : "ƯU ĐÃI"}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <button
                                                onClick={() => navigate('/promotions')}
                                                className="bg-white text-slate-900 font-black px-6 py-3 rounded-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-amber-500 hover:text-white"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors uppercase line-clamp-1">
                                            {promo.tenChuongTrinh}
                                        </h3>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã Code</span>
                                                <span className="text-sm font-bold text-amber-500">{promo.code}</span>
                                            </div>
                                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-dashed border-slate-200">
                                                <span className="text-[10px] font-bold text-slate-400 block leading-none mb-1">CÒN LẠI</span>
                                                <span className="text-sm font-bold text-slate-700">{promo.soLuongConLai} suất</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-white px-[8vw] py-16">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className="mb-6 text-2xl font-black text-slate-900">Dịch vụ chuyến bay tại FlyViet</h2>
                    <div className="mb-6 flex overflow-x-auto border-b border-slate-200">
                        {serviceTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveServiceTab(tab)}
                                className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 text-sm font-bold ${activeServiceTab === tab ? 'border-[#c08d23] text-slate-900' : 'border-transparent text-slate-500'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {serviceData[activeServiceTab].map((item, index) => (
                            <div key={index} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
                                <h3 className="mb-3 text-lg font-black text-slate-800">{item.title}</h3>
                                <p className="flex-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-[8vw] pb-24 pt-14">
                <div className="mx-auto mb-6 flex max-w-[1200px] flex-wrap items-end justify-between gap-3">
                    <h2 className="text-4xl font-black text-slate-900">Đối tác thanh toán</h2>
                    <p className="max-w-[520px] text-sm font-medium text-slate-500">
                        Hỗ trợ đa dạng phương thức thanh toán: thẻ quốc tế, ví điện tử và chuyển khoản nhanh qua VietQR.
                    </p>
                </div>
                <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {paymentPartners.map((p) => (
                        <div key={p.name} className="flex h-[76px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:-translate-y-0.5 hover:shadow">
                            <img src={p.src} alt={p.name} loading="lazy" className="max-h-10 w-full object-contain" />
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;