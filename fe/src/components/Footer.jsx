import React from 'react';
import { Link } from 'react-router-dom';

import brandLogo from '../assets/logo.jpg';
import visaLogo from '../assets/visa.jpg';
import momoLogo from '../assets/momo.jpg';
import zalopayLogo from '../assets/zalopay.jpg';
import vietqrLogo from '../assets/vietqr.jpg';
import onepayLogo from '../assets/onepay.jpg';

const Footer = () => {
    return (
        <footer className="relative overflow-hidden bg-[#1a2e45] px-[5vw] pt-[72px] text-white">
            <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />

            <div className="grid gap-12 pb-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

                {/* Brand */}
                <div>
                    <Link to="/" className="mb-5 flex items-center gap-2.5">
                        <img className="h-[38px] w-[38px] rounded-[10px] border border-sky-300/30 bg-white/5 object-cover shadow-lg" src={brandLogo} alt="FlyViet" loading="lazy" />
                        <span className="font-serif text-[21px] font-semibold tracking-[0.1em] text-white">
                            FLYVIET<span className="ml-0.5 inline-block h-1.5 w-1.5 align-super rounded-full bg-amber-300" />
                        </span>
                    </Link>
                    <p className="mb-7 max-w-[260px] text-[13px] leading-7 text-white/55">
                        Trải nghiệm đặt vé máy bay mượt mà, an toàn và luôn có giá tốt nhất.
                    </p>
                    <div className="flex gap-2.5">
                        <a href="#" className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/65 transition hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-sky-300/20 hover:text-sky-300">f</a>
                        <a href="#" className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/65 transition hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-sky-300/20 hover:text-sky-300">x</a>
                        <a href="#" className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/65 transition hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-sky-300/20 hover:text-sky-300">in</a>
                        <a href="#" className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/65 transition hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-sky-300/20 hover:text-sky-300">yt</a>
                    </div>
                </div>

                {/* Company */}
                <div>
                    <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Về chúng tôi</p>
                    <ul className="flex list-none flex-col gap-3 p-0">
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Giới thiệu FlyViet</a></li>
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Tin tức & Sự kiện</a></li>
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Tuyển dụng</a></li>
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Hỗ trợ</p>
                    <ul className="flex list-none flex-col gap-3 p-0">
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Câu hỏi thường gặp</a></li>
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Chính sách bảo mật</a></li>
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Điều khoản sử dụng</a></li>
                        <li><a className="text-[13.5px] text-white/70 transition hover:text-white" href="#">Hướng dẫn đặt vé</a></li>
                    </ul>
                </div>

                {/* Payment */}
                <div>
                    <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Thanh toán an toàn</p>
                    <div className="mb-7 flex flex-wrap gap-2">
                        <span className="inline-flex h-8.5 items-center justify-center" title="VietQR">
                            <img className="h-[18px] max-w-[92px] object-contain opacity-95" src={vietqrLogo} alt="VietQR" loading="lazy" />
                        </span>
                        <span className="inline-flex h-8.5 items-center justify-center" title="VISA">
                            <img className="h-[18px] max-w-[92px] object-contain opacity-95" src={visaLogo} alt="VISA" loading="lazy" />
                        </span>
                        <span className="inline-flex h-8.5 items-center justify-center" title="MoMo">
                            <img className="h-[18px] max-w-[92px] object-contain opacity-95" src={momoLogo} alt="MoMo" loading="lazy" />
                        </span>
                        <span className="inline-flex h-8.5 items-center justify-center" title="ZaloPay">
                            <img className="h-[18px] max-w-[92px] object-contain opacity-95" src={zalopayLogo} alt="ZaloPay" loading="lazy" />
                        </span>
                        <span className="inline-flex h-8.5 items-center justify-center" title="OnePay">
                            <img className="h-[18px] max-w-[92px] object-contain opacity-95" src={onepayLogo} alt="OnePay" loading="lazy" />
                        </span>
                    </div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Chứng nhận</p>
                    <div className="inline-flex items-center gap-2">
                        <span className="text-base">🛡️</span>
                        <span className="text-[11px] font-semibold tracking-[0.1em] text-white/60">ĐÃ THÔNG BÁO BCT</span>
                    </div>
                </div>

            </div>

            {/* Bottom bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-5">
                <p className="text-xs text-white/45">© {new Date().getFullYear()} FlyViet. Tất cả các quyền được bảo lưu.</p>
                <div className="flex gap-6">
                    <a className="text-xs text-white/45 transition hover:text-white/80" href="#">Việt Nam (VNĐ)</a>
                    <a className="text-xs text-white/45 transition hover:text-white/80" href="#">English</a>
                    <a className="text-xs text-white/45 transition hover:text-white/80" href="#">Tiếng Việt</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;