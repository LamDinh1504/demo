import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authService } from '../../services/api';

const Promotions = () => {
    const [promoCards, setPromoCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                const data = await authService.getActivePromotions();
                // Map backend data to frontend structure
                const formattedPromos = data.map(promo => {
                    const expiryDate = new Date(promo.ngayKetThuc);
                    const formattedExpiry = expiryDate.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    return {
                        id: promo.maKhuyenMai,
                        title: promo.tenChuongTrinh,
                        description: promo.moTaTenChuongTrinh,
                        image: promo.urlImage || "https://images.unsplash.com/photo-1540339832862-474559151b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        tag: promo.phanTramGiam > 0 ? `GIẢM ${promo.phanTramGiam}%` : "ƯU ĐÃI",
                        expiry: `Hết hạn: ${formattedExpiry}`,
                        code: promo.code,
                        remaining: promo.soLuongConLai
                    };
                });
                setPromoCards(formattedPromos);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching promotions:", err);
                setError("Không thể tải thông tin ưu đãi. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Đã sao chép mã: ${text}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                `}
            </style>

            <Navbar transparent={false} />

            <main className="flex-grow pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 leading-tight">
                            Ưu đãi hấp dẫn tại <br />
                            <em className="font-semibold text-amber-500 not-italic">FlyViet Premium</em>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl font-medium">
                            Khám phá những chương trình khuyến mãi đặc biệt dành riêng cho hành khách của FlyViet.
                        </p>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold animate-pulse">Đang tải ưu đãi...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-12 text-center">
                            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-red-600 font-black text-xl mb-4">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3 rounded-2xl transition-all"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : promoCards.length === 0 ? (
                        <div className="bg-slate-100 rounded-[2rem] p-12 text-center">
                            <p className="text-slate-500 font-black text-xl">Hiện chưa có chương trình ưu đãi nào mới.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {promoCards.map((promo, index) => (
                                <div 
                                    key={promo.id} 
                                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 group"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <img 
                                            src={promo.image} 
                                            alt={promo.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                {promo.tag}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                                            <button className="bg-white text-slate-900 font-black px-8 py-3 rounded-2xl hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                                                {promo.title}
                                            </h3>
                                            <div className="bg-slate-50 border border-dashed border-slate-200 px-3 py-1 rounded-lg">
                                                <span className="text-xs font-bold text-slate-400">Code:</span>
                                                <span className="ml-2 text-sm font-black text-amber-500">{promo.code}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 font-medium mb-6 line-clamp-2">
                                            {promo.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-xs font-bold">{promo.expiry}</span>
                                                </div>
                                                {promo.remaining !== undefined && (
                                                    <span className="text-[10px] font-black text-amber-500 uppercase">Còn lại: {promo.remaining} suất</span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(promo.code)}
                                                className="text-amber-500 font-black text-sm hover:underline"
                                            >
                                                Sao chép mã
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Subscription Section */}
                    <div className="mt-28 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white rounded-[3.5rem] shadow-xl border border-slate-100"></div>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100/50 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/30 rounded-full -ml-32 -mb-32 blur-[100px]"></div>
                        
                        <div className="relative z-10 px-8 py-16 md:py-20 text-center text-slate-900">
                            <div className="inline-flex items-center gap-3 mb-6 bg-slate-50 backdrop-blur-md px-5 py-2 rounded-full border border-slate-200">
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
                                <span className="text-slate-500 font-black text-[11px] uppercase tracking-[0.2em]">FlyViet Newsletter</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
                                Đừng bỏ lỡ bất kỳ <br className="md:hidden" /> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">ưu đãi hấp dẫn nào!</span>
                            </h2>
                            
                            <p className="text-slate-600 max-w-2xl mx-auto mb-12 font-medium text-lg leading-relaxed px-4">
                                Đăng ký nhận bản tin để trở thành người đầu tiên biết về các chương trình vé giá rẻ, mã voucher độc quyền và cẩm nang du lịch mới nhất từ FlyViet.
                            </p>
                            
                            <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto px-4">
                                <div className="relative flex-grow group">
                                    <input 
                                        type="email" 
                                        placeholder="Địa chỉ email của bạn" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-slate-900 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-slate-900/5"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                        </svg>
                                    </div>
                                </div>
                                <button className="bg-slate-900 hover:bg-black text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2">
                                    <span>Đăng ký ngay</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                            
                            <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                Cam kết bảo mật thông tin 100%
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Promotions;
