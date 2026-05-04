import React from 'react';

// Bank & Payment Logos
import vcbLogo from '../assets/vietcombank.jpg';
import tcbLogo from '../assets/techcombank.jpg';
import bidvLogo from '../assets/bidv.jpg';
import vtiLogo from '../assets/viettinbank.jpg';
import tpbLogo from '../assets/tpbank.jpg';
import mbLogo from '../assets/mb.jpg';
import acbLogo from '../assets/acb.jpg';
import sacomLogo from '../assets/sacombank.jpg';
import vibLogo from '../assets/vib.jpg';
import hdbLogo from '../assets/hdbank.jpg';
import ocbLogo from '../assets/ocb.jpg';
import kLogo from '../assets/kbank.jpg';
import seaLogo from '../assets/seabank.jpg';
import vpLogo from '../assets/vpbank.jpg';
import visaLogo from '../assets/visa.jpg';
import momoLogo from '../assets/momo.jpg';
import zaloLogo from '../assets/zalopay.jpg';
import qrLogo from '../assets/vietqr.jpg';
import onepayLogo from '../assets/onepay.jpg';

export default function PartnerBanks() {
    const logos = [
        vcbLogo, tcbLogo, bidvLogo, vtiLogo, tpbLogo, mbLogo, acbLogo, sacomLogo, vibLogo, 
        hdbLogo, ocbLogo, kLogo, seaLogo, vpLogo, visaLogo, momoLogo, zaloLogo, qrLogo, onepayLogo
    ];

    return (
        <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Đối tác thanh toán & Ngân hàng liên kết</p>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {logos.map((src, i) => (
                    <img 
                        key={i} 
                        src={src} 
                        className="w-full aspect-square rounded-lg border border-slate-100 object-contain bg-white p-1 hover:border-sky-200 transition-colors shadow-sm" 
                        alt="bank-logo" 
                    />
                ))}
            </div>
        </div>
    );
}
