import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Support = () => {
    const handleImageError = (e) => {
        e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109c055?auto=format&fit=crop&q=60&w=800";
    };

    const helpTopics = [
        {
            title: "Quy định Hành lý",
            image: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800",
            questions: [
                { q: "Hành lý xách tay tối đa bao nhiêu?", a: "Mỗi hành khách được mang tối đa 07kg hành lý xách tay với kích thước không quá 56x36x23cm. Ngoài ra bạn được mang thêm 01 túi xách nhỏ hoặc laptop." },
                { q: "Tôi có được mang nước uống không?", a: "Nước uống và chất lỏng chỉ được mang theo bình dưới 100ml. Tổng cộng không quá 1 lít và phải đặt trong túi zip nhựa trong suốt." }
            ]
        },
        {
            title: "Thay đổi & Hoàn vé",
            image: "https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=800",
            questions: [
                { q: "Tôi có thể đổi ngày bay không?", a: "Được, bạn có thể thay đổi ngày/giờ bay trước 04 giờ khởi hành qua website hoặc ứng dụng. Phí thay đổi sẽ áp dụng tùy theo hạng vé." },
                { q: "Làm sao để tôi được hoàn tiền vé?", a: "Bạn truy cập mục 'Tra cứu đơn hàng', chọn 'Yêu cầu hoàn trả'. Tiền sẽ được gửi về thẻ của bạn trong vòng 7-15 ngày làm việc." }
            ]
        },
        {
            title: "Thủ tục & Check-in",
            image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=800",
            questions: [
                { q: "Nên có mặt lúc nào ở sân bay?", a: "Bạn nên có mặt trước 02 giờ đối với bay nội địa và 03 giờ đối với bay quốc tế để đảm bảo hoàn tất các thủ tục an ninh." },
                { q: "Làm sao để check-in trực tuyến?", a: "Tính năng này mở trước 24h và đóng trước 01h giờ bay. Bạn chỉ cần nhập Mã đặt chỗ (PNR) để nhận thẻ lên máy bay điện tử." }
            ]
        },
        {
            title: "Dịch vụ Đặc biệt",
            image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&q=80&w=800",
            questions: [
                { q: "Hỗ trợ trẻ em đi một mình?", a: "FlyViet cung cấp dịch vụ hộ tống trẻ em từ 6-12 tuổi đi một mình. Bạn cần đăng ký dịch vụ này tại đại lý hoặc phòng vé ít nhất 24h trước giờ bay." },
                { q: "Ưu đãi khi bay nhiều là gì?", a: "Khi là hội viên FlyViet Rewards, bạn sẽ được tích dặm bay để đổi vé miễn phí, nâng hạng thương gia và ưu tiên tại quầy làm thủ tục." }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-['Nunito']">
            {/* Import font Nunito và setup transition cho Tailwind */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                `}
            </style>

            <Navbar transparent={false} />

            <main className="pt-24 pb-24">
                {/* Hero Section - Pure Tailwind */}
                <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden mb-24">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="https://inkythuatso.com/uploads/thumbnails/800/2023/02/hinh-anh-may-bay-tren-bau-troi-inkythuatso-1-07-11-33-06.jpg" 
                            className="w-full h-full object-cover"
                            alt="Airplane Home Background"
                        />
                        {/* Gradient tối nhẹ ở phía trên để chữ trắng nổi bật */}
                        <div className="absolute inset-0 bg-slate-900/40"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            FlyViet Help Desk
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-8 text-white leading-tight tracking-tight drop-shadow-lg">
                            Hỗ trợ hành khách <br />
                            <span className="text-amber-500">tận tâm 24/7</span>
                        </h1>
                        <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full mb-10 shadow-lg"></div>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                            Mọi thắc mắc của bạn về chuyến bay, hành lý hay thủ tục, <br className="hidden md:block" />
                            xin vui lòng tham khảo các mục giải đáp bên dưới.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6">
                    {/* FAQ Grid - Pure Tailwind */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {helpTopics.map((topic, index) => (
                            <div key={index} className="bg-white rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 group flex flex-col">
                                <div className="h-80 relative overflow-hidden rounded-t-[4rem]">
                                    <img 
                                        src={topic.image} 
                                        alt={topic.title} 
                                        onError={handleImageError}
                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
                                    <div className="absolute bottom-6 left-8">
                                        <h2 className="text-3xl font-black text-slate-900 drop-shadow-md">
                                            {topic.title}
                                        </h2>
                                    </div>
                                </div>
                                
                                <div className="p-12 flex-grow">
                                    <div className="space-y-12">
                                        {topic.questions.map((faq, fIdx) => (
                                            <div key={fIdx} className="group/item">
                                                <div className="flex items-start gap-6 cursor-pointer group-hover/item:translate-x-2 transition-transform duration-300">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:bg-amber-500 group-hover/item:border-amber-500 transition-all duration-500">
                                                        <span className="text-slate-400 font-black text-xs group-hover/item:text-white">?</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 group-hover/item:text-amber-600 transition-colors pt-1.5 leading-tight">
                                                        {faq.q}
                                                    </h3>
                                                </div>
                                                
                                                {/* Animation FAQ bằng Tailwind Grid Trick */}
                                                <div className="grid grid-rows-[0fr] group-hover/item:grid-rows-[1fr] transition-all duration-500 ease-in-out pl-18">
                                                    <div className="overflow-hidden">
                                                        <div className="mt-6 ml-18 bg-slate-50/50 p-8 rounded-[2.5rem] border-l-[8px] border-amber-500">
                                                            <p className="text-slate-600 font-normal leading-relaxed">
                                                                {faq.a}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Channels - Pure Tailwind */}
                    <div className="mt-40 p-16 md:p-24 bg-white border border-slate-100 rounded-[5rem] text-center relative overflow-hidden text-slate-900 shadow-2xl shadow-slate-200/50">
                        <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[120px]"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tight text-slate-900 leading-tight">Bạn cần liên hệ ngay?</h2>
                            <p className="text-slate-500 font-medium text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                                Đừng ngần ngại, đội ngũ chuyên viên của FlyViet <br className="hidden md:block" />
                                luôn túc trực 24/7 để đồng hành cùng hành trình của bạn.
                            </p>
                            
                            <div className="flex flex-col xl:flex-row items-center justify-center gap-10">
                                <div className="text-center xl:text-left p-8 bg-slate-50 rounded-[2.5rem] border border-white hover:border-amber-200 transition-all hover:shadow-xl duration-500 group">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-amber-500 transition-colors">TỔNG ĐÀI TOÀN QUỐC</p>
                                    <p className="text-3xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">1900 1234</p>
                                </div>
                                
                                <div className="h-20 w-[2px] bg-slate-100 hidden xl:block"></div>
                                
                                <div className="text-center xl:text-left p-8 bg-slate-50 rounded-[2.5rem] border border-white hover:border-amber-200 transition-all hover:shadow-xl duration-500 group">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-amber-500 transition-colors">TRUNG TÂM EMAIL</p>
                                    <p className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">support@flyviet.vn</p>
                                </div>
                                
                                <button className="bg-slate-900 text-white font-black px-10 py-5 rounded-[2rem] hover:bg-amber-500 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-900/20">
                                    Chat trực tuyến ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Support;
