import React, { useState } from 'react';
import { translate } from './lib/i18n';
import { motion } from 'motion/react';
import { MessageCircle, Instagram, Facebook, Store, ShoppingCart, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  onLoginClick: () => void;
}

export default function LandingPage({ lang, setLang, onLoginClick }: LandingPageProps) {
  const t = (key: string) => translate(key, lang);
  
  // Active plan for neon hover effect
  const [activePlan, setActivePlan] = useState<string>('Pro');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState('');

  const integrations = [
    { name: 'WhatsApp', icon: <MessageCircle className="w-8 h-8" /> },
    { name: 'Instagram', icon: <Instagram className="w-8 h-8" /> },
    { name: 'Messenger', icon: <Facebook className="w-8 h-8" /> },
    { name: 'Shopify', icon: <ShoppingCart className="w-8 h-8" /> },
    { name: 'WooCommerce', icon: <Store className="w-8 h-8" /> },
  ];

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePayment = async (planName: string, amount: number) => {
    setSelectedPlanInfo(planName);
    setShowContactModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const pricingCardVariants: any = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#000a0a] text-[#f8fafc] font-sans selection:bg-[#00ff99] selection:text-black">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="text-lg md:text-xl font-bold tracking-widest text-[#f8fafc] cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <span className="text-[#00ff99]">V</span>OID SYSTEMS
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <a href="#pricing" className="text-[10px] md:text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors uppercase tracking-widest">
                {lang === 'en' ? 'Pricing' : 'الأسعار'}
              </a>
              <a href="#features" className="text-[10px] md:text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors uppercase tracking-widest">
                {lang === 'en' ? 'Features' : 'الميزات'}
              </a>
              <a href="#social" className="text-[10px] md:text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors uppercase tracking-widest">
                {lang === 'en' ? 'Social' : 'المنصات'}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-2 text-xs font-medium text-[#94a3b8] border border-[#333] hover:border-[#555] bg-[#000a0a]/50 transition-colors px-4 py-1.5 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {lang === 'en' ? 'عربي' : 'English'}
              </button>
              <button 
                onClick={onLoginClick}
                className="text-xs font-bold text-black bg-[#00ff99] hover:bg-[#00cc7a] transition-colors px-5 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,153,0.3)]"
              >
                {lang === 'en' ? 'Log in' : 'دخول'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-40 pb-24 border-b border-transparent">
        {/* Background Overlays */}
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#020b06]">
          <div className="absolute top-[20%] right-[10%] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00ff99]/5 to-transparent rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center mt-[-45px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff99]/20 bg-[#000a0a]/50 backdrop-blur-md text-[#00ff99] text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,153,0.1)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff99]"></span>
            </span>
            {lang === 'en' ? 'AI AUTOMATION FOR YOU' : 'أتمتة الذكاء الاصطناعي لك'}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            {lang === 'en' ? (
              <>Your DM's on<br/><span className="text-[#00ff99] font-serif font-medium tracking-tight">Autopilot</span></>
            ) : (
              <>رسائلك الخاصة على<br/><span className="text-[#00ff99] font-serif font-medium tracking-tight">الطيار الآلي</span></>
            )}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-relaxed"
          >
            {lang === 'en' 
              ? 'Void Systems transforms your business Instagram presence with intelligent agents that reply, sell, and support 24/7.' 
              : 'نظام ڤويد يحول تواجدك التجاري على إنستغرام مع وكلاء أذكياء يردون، يبيعون، ويدعمون على مدار الساعة.'}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <button 
              onClick={scrollToPricing}
              className="bg-white hover:bg-gray-200 text-black text-xs md:text-sm font-bold py-3 md:py-4 px-8 md:px-10 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {lang === 'en' ? 'Launch Agent' : 'إطلاق الوكيل'}
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 text-[#333]"
          >
            <svg className="w-8 h-8 animate-bounce mx-auto cursor-pointer hover:text-[#00ff99] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={scrollToPricing}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>



      {/* Integrations Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8 px-4"
      >
        <p className="text-sm font-semibold tracking-widest text-[#00ff99] uppercase mb-4">
          {lang === 'en' ? 'Integrates seamlessly with' : 'يتكامل بسلاسة مع'}
        </p>
      </motion.div>

      {/* Integrations Showcase */}
      <div className="w-full overflow-hidden bg-gradient-to-r from-transparent via-[#00ff99]/5 to-transparent py-10 border-y border-[#00ff9910] mb-24 relative flex items-center">
        <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#000a0a] to-transparent z-10"></div>
        <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#000a0a] to-transparent z-10"></div>
        <motion.div 
          animate={{ x: lang === 'en' ? ["0%", "-50%"] : ["-50%", "0%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex whitespace-nowrap items-center w-max"
        >
          {/* Double the list for infinite marquee effect */}
          {[...integrations, ...integrations].map((int, i) => (
             <div key={i} className="flex items-center gap-3 mx-10 text-[#94a3b8] hover:text-[#00ff99] transition-colors cursor-default">
               {int.icon}
               <span className="text-xl font-semibold">{int.name}</span>
             </div>
          ))}
        </motion.div>
      </div>

      {/* Feature Highlight: AI Auto-Replies & Dashboard */}
      <div className="py-24 bg-[#0a1410] border-t border-[#00ff9910] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff99]/10 border border-[#00ff99]/20 text-[#00ff99] text-xs font-bold mb-6">
                <MessageCircle className="w-4 h-4" />
                {lang === 'en' ? 'Core Feature' : 'ميزة أساسية'}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                {lang === 'en' ? (
                  <>Autopilot Your <span className="text-[#00ff99]">Customer Service.</span></>
                ) : (
                  <>خدمة عملاء على <span className="text-[#00ff99]">الطيار الآلي.</span></>
                )}
              </h2>
              <p className="text-lg md:text-xl text-[#94a3b8] mb-8 leading-relaxed">
                {lang === 'en' 
                  ? 'Void System seamlessly connects to your social platforms (Instagram, Facebook, etc.). Our advanced AI understands context, engages naturally, and funnels potential buyers directly to your dashboard.'
                  : 'نظام ڤويد يتصل بسلاسة مع منصات التواصل الاجتماعي الخاصة بك. يفهم الذكاء الاصطناعي المتقدم لدينا السياق، ويتفاعل بشكل طبيعي، ويوجه المشترين المحتملين مباشرة إلى لوحة التحكم الخاصة بك.'}
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  lang === 'en' ? 'Smart intent recognition and exact product matching' : 'التعرف الذكي على النوايا والمطابقة الدقيقة للمنتجات',
                  lang === 'en' ? 'Fully bilingual: Native Arabic and English support' : 'ثنائي اللغة بالكامل: دعم أصلي للغات العربية والإنجليزية',
                  lang === 'en' ? 'Centralized dashboard to view leads and close sales' : 'لوحة تحكم مركزية لعرض العملاء وإتمام المبيعات',
                ].map((item, id) => (
                  <li key={id} className="flex items-start gap-3 text-[#cbd5e1] font-medium">
                    <div className="w-6 h-6 rounded bg-[#00ff99]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#00ff99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Application Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateY: lang === 'ar' ? -10 : 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring" }}
              className="lg:w-1/2 relative perspective-1000"
            >
              {/* Glow Behind Mockup */}
              <div className="absolute inset-0 bg-[#00ff99] opacity-[0.05] blur-[80px] rounded-full scale-105" />

              {/* Dashboard Frame */}
              <div className="relative bg-[#050f0a] border border-[#00ff99]/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                
                {/* Header */}
                <div className="bg-[#000a0a] border-b border-[#00ff99]/20 p-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-mono text-[#00ff99] border border-[#00ff99]/20 bg-[#00ff99]/10 px-2 py-1 rounded">Void_Dashboard v2.0</div>
                </div>

                <div className="flex">
                  {/* Sidebar Mock */}
                  <div className="w-16 md:w-20 border-r border-[#00ff99]/10 bg-[#000a0a] p-3 flex flex-col items-center gap-6 pt-6 opacity-60">
                     <div className="w-8 h-8 rounded bg-[#222]"></div>
                     <div className="w-8 h-8 rounded bg-[#00ff99]/20 border border-[#00ff99]/50"></div>
                     <div className="w-8 h-8 rounded bg-[#222]"></div>
                     <div className="w-8 h-8 rounded bg-[#222]"></div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-4 md:p-6 bg-[linear-gradient(to_bottom,transparent_0%,#000a0a_100%)]">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <div className="text-lg font-bold text-white mb-1">Live Interactions</div>
                        <div className="text-xs text-[#94a3b8]">AI actively engaging 3 customers</div>
                      </div>
                      <div className="px-3 py-1 hidden sm:block bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        System Active
                      </div>
                    </div>

                    {/* Chat Bubble Mockups */}
                    <div className="space-y-4">
                      {/* Customer */}
                      <div className="flex gap-3 items-end w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex-shrink-0"></div>
                        <div className="bg-[#111] p-3 rounded-2xl rounded-bl-sm border border-[#222] text-sm text-[#cbd5e1]">
                          Do you have this jacket in large? And how long is delivery?
                        </div>
                      </div>
                      
                      {/* AI Reply */}
                      <div className="flex gap-3 items-end w-[85%] ml-auto flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-[#00ff99]/20 border border-[#00ff99]/50 flex items-center justify-center flex-shrink-0 text-[#00ff99]">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <div className="bg-[#00ff99]/10 p-3 rounded-2xl rounded-br-sm border border-[#00ff99]/30 text-sm text-[#e2e8f0]">
                          Yes, we have 4 large ones in stock! Delivery to your registered region takes 2-3 business days. Would you like me to send a checkout link?
                        </div>
                      </div>

                      {/* AI Thinking/Action overlay */}
                      <div className="mt-4 pt-4 border-t border-[#00ff99]/10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#000a0a] px-2 text-[10px] text-[#00ff99] border border-[#00ff99]/20 rounded tracking-widest uppercase">
                          AI Action Triggered
                        </div>
                        <div className="flex justify-between items-center bg-[#050f0a] border border-[#00ff99]/20 p-3 rounded-lg text-xs text-[#94a3b8]">
                           <span className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse"></div>
                             Lead qualified & saved to database
                           </span>
                           <span className="text-white bg-[#111] px-2 py-0.5 rounded border border-[#333]">View Lead</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <motion.div 
        id="features" 
        className="py-24 bg-[#030d06] mt-[-99px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{lang === 'en' ? 'What We Offer' : 'ماذا نقدم'}</h2>
            <div className="w-24 h-1 bg-[#00ff99] mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              className="bg-[#0a1410] border border-[#00ff9915] p-5 md:p-8 rounded-xl hover:border-[#00ff9940] hover:shadow-[0_0_30px_rgba(0,255,153,0.1)] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <motion.div 
                variants={{ hover: { scale: 1.15, rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.6 } } } as any}
                className="w-12 h-12 bg-[#00ff99]/10 rounded-lg flex items-center justify-center mb-6 origin-center"
              >
                <MessageCircle className="w-6 h-6 text-[#00ff99]" />
              </motion.div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{lang === 'en' ? 'AI Auto-Replies' : 'ردود تلقائية متطورة'}</h3>
              <p className="text-sm md:text-base text-[#94a3b8] leading-relaxed">
                {lang === 'en' ? 'Instantly respond to customer inquiries across all your social channels with intelligent, context-aware AI messages.' : 'الرد الفوري على استفسارات العملاء عبر جميع قنواتك بذكاء وفي السياق المناسب.'}
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              className="bg-[#0a1410] border border-[#00ff9915] p-5 md:p-8 rounded-xl hover:border-[#00ff9940] hover:shadow-[0_0_30px_rgba(0,255,153,0.1)] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <motion.div 
                variants={{ hover: { scale: 1.15, y: -5, transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" } } } as any}
                className="w-12 h-12 bg-[#00ff99]/10 rounded-lg flex items-center justify-center mb-6"
              >
                <svg className="w-6 h-6 text-[#00ff99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{lang === 'en' ? 'Advanced Analytics' : 'تحليلات متقدمة'}</h3>
              <p className="text-sm md:text-base text-[#94a3b8] leading-relaxed">
                {lang === 'en' ? 'Track your sales, revenue, and message volume in real-time. Make data-driven decisions to grow your business.' : 'تتبع المبيعات والإيرادات وحجم الرسائل في الوقت الفعلي واتخذ قرارات بناءً على البيانات.'}
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover="hover"
              className="bg-[#0a1410] border border-[#00ff9915] p-5 md:p-8 rounded-xl hover:border-[#00ff9940] hover:shadow-[0_0_30px_rgba(0,255,153,0.1)] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <motion.div 
                 variants={{ hover: { scale: 1.15, rotate: 180, transition: { duration: 0.5 } } } as any}
                 className="w-12 h-12 bg-[#00ff99]/10 rounded-lg flex items-center justify-center mb-6 origin-center"
              >
                <Store className="w-6 h-6 text-[#00ff99]" />
              </motion.div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{lang === 'en' ? 'Product Management' : 'إدارة المنتجات'}</h3>
              <p className="text-sm md:text-base text-[#94a3b8] leading-relaxed">
                {lang === 'en' ? 'Easily add, edit, and organize your products. Export data seamlessly to keep your inventory in sync.' : 'إضافة وتعديل وتنظيم منتجاتك بسهولة مع إمكانية تصدير البيانات لتحديث مخزونك.'}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div 
        id="pricing" 
        className="py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{lang === 'en' ? 'Simple, Transparent Pricing' : 'أسعار بسيطة وشفافة'}</h2>
            <div className="w-24 h-1 bg-[#00ff99] mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
            {/* Starter Tier */}
            <motion.div 
              variants={pricingCardVariants}
              onMouseEnter={() => setActivePlan('Starter')}
              className={`p-4 md:p-8 rounded-2xl flex flex-col transition-all duration-300 transform md:-translate-y-4 ${activePlan === 'Starter' ? 'bg-[#000a0a] border-2 border-[#00ff99] shadow-[0_0_30px_rgba(0,255,153,0.15)] relative scale-[1.02] md:scale-105 z-10' : 'bg-[#050f0a] border border-[#1a1a1a] hover:border-[#00ff9940]'}`}
            >
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{lang === 'en' ? 'Starter' : 'البداية'}</h3>
              <div className="text-xs md:text-base text-[#94a3b8] mb-3 md:mb-6 min-h-[36px] md:min-h-[48px]">{lang === 'en' ? 'For small pages needing basic FAQ and order taking.' : 'للصفحات الصغيرة التي تحتاج إلى ردود أساسية وأخذ طلبات.'}</div>
              <div className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 flex items-baseline">150,000 <span className="text-[10px] md:text-sm text-[#94a3b8] font-normal ml-2">IQD /mo</span></div>
              
              <ul className="flex-1 space-y-2 md:space-y-4 mb-4 md:mb-8 text-xs md:text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '2,000 Conversations / month' : '2,000 محادثة / الشهر'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '1 Channel Included (+50k for extras)' : 'قناة واحدة متضمنة (+50 ألف للإضافية)'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'All Standard Dashboard & Memory features' : 'كافة ميزات لوحة التحكم والذاكرة القياسية'}</span>
                </li>
              </ul>
              
              <button onClick={() => handlePayment('Starter', 150000)} className={`w-full text-xs md:text-base font-semibold py-2 md:py-3 rounded-md transition-colors disabled:opacity-50 ${activePlan === 'Starter' ? 'bg-[#00ff99] hover:bg-[#00cc7a] text-black shadow-[0_0_15px_rgba(0,255,153,0.3)]' : 'bg-[#111] hover:bg-[#222] border border-[#333] text-white'}`}>
                {lang === 'en' ? 'Get Starter' : 'ابدأ بخطة البداية'}
              </button>
            </motion.div>
            
            {/* Pro Tier */}
            <motion.div 
              variants={pricingCardVariants}
              onMouseEnter={() => setActivePlan('Pro')}
              className={`p-4 md:p-8 rounded-2xl flex flex-col transition-all duration-300 transform md:-translate-y-4 ${activePlan === 'Pro' ? 'bg-[#000a0a] border-2 border-[#00ff99] shadow-[0_0_30px_rgba(0,255,153,0.15)] relative scale-[1.02] md:scale-105 z-10' : 'bg-[#050f0a] border border-[#1a1a1a] hover:border-[#00ff9940]'}`}
            >
              {activePlan === 'Pro' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00ff99] text-black text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  {lang === 'en' ? 'Most Popular' : 'الأكثر شيوعاً'}
                </div>
              )}
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{lang === 'en' ? 'Pro' : 'المحترفين'}</h3>
              <div className="text-xs md:text-base text-[#94a3b8] mb-3 md:mb-6 min-h-[36px] md:min-h-[48px]">{lang === 'en' ? 'Growing stores needing steady stock management & leads.' : 'المتاجر النامية التي تحتاج لإدارة مخزون مستقرة ومبيعات.'}</div>
              <div className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 flex items-baseline">350,000 <span className="text-[10px] md:text-sm text-[#94a3b8] font-normal ml-2">IQD /mo</span></div>
              
              <ul className="flex-1 space-y-2 md:space-y-4 mb-4 md:mb-8 text-xs md:text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '6,000 Conversations / month' : '6,000 محادثة / الشهر'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '1 Channel Included (+50k for extras)' : 'قناة واحدة متضمنة (+50 ألف للإضافية)'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'All Standard Features' : 'جميع الميزات القياسية'}</span>
                </li>
              </ul>
              
              <button onClick={() => handlePayment('Pro', 350000)} className={`w-full text-xs md:text-base font-semibold py-2 md:py-3 rounded-md transition-colors disabled:opacity-50 ${activePlan === 'Pro' ? 'bg-[#00ff99] hover:bg-[#00cc7a] text-black shadow-[0_0_15px_rgba(0,255,153,0.3)]' : 'bg-[#111] hover:bg-[#222] border border-[#333] text-white'}`}>
                {lang === 'en' ? 'Get Pro' : 'احصل على الخطة'}
              </button>
            </motion.div>

            {/* Business Tier */}
            <motion.div 
              variants={pricingCardVariants}
              onMouseEnter={() => setActivePlan('Business')}
              className={`p-4 md:p-8 rounded-2xl flex flex-col transition-all duration-300 transform md:-translate-y-4 ${activePlan === 'Business' ? 'bg-[#000a0a] border-2 border-[#00ff99] shadow-[0_0_30px_rgba(0,255,153,0.15)] relative scale-[1.02] md:scale-105 z-10' : 'bg-[#050f0a] border border-[#1a1a1a] hover:border-[#00ff9940]'}`}
            >
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{lang === 'en' ? 'Business' : 'الأعمال'}</h3>
              <div className="text-xs md:text-base text-[#94a3b8] mb-3 md:mb-6 min-h-[36px] md:min-h-[48px]">{lang === 'en' ? 'High-volume businesses pulling serious daily traffic.' : 'الشركات ذات الحجم الكبير بحركة مرور يومية هائلة.'}</div>
              <div className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 flex items-baseline">600,000 <span className="text-[10px] md:text-sm text-[#94a3b8] font-normal ml-2">IQD /mo</span></div>
              
              <ul className="flex-1 space-y-2 md:space-y-4 mb-4 md:mb-8 text-xs md:text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '15,000 Conversations / month' : '15,000 محادثة / الشهر'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '1 Channel Included (+50k for extras)' : 'قناة واحدة متضمنة (+50 ألف للإضافية)'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Standard Features + Appointment Booking' : 'ميزات قياسية + حجز المواعيد'}</span>
                </li>
              </ul>
              
              <button onClick={() => handlePayment('Business', 600000)} className={`w-full text-xs md:text-base font-semibold py-2 md:py-3 rounded-md transition-colors disabled:opacity-50 ${activePlan === 'Business' ? 'bg-[#00ff99] hover:bg-[#00cc7a] text-black shadow-[0_0_15px_rgba(0,255,153,0.3)]' : 'bg-[#111] hover:bg-[#222] border border-[#333] text-white'}`}>
                {lang === 'en' ? 'Get Business' : 'احصل على الخطة'}
              </button>
            </motion.div>
            
            {/* Enterprise Tier */}
            <motion.div 
              variants={pricingCardVariants}
              onMouseEnter={() => setActivePlan('Enterprise')}
              className={`p-4 md:p-8 rounded-2xl flex flex-col transition-all duration-300 transform md:-translate-y-4 ${activePlan === 'Enterprise' ? 'bg-[#000a0a] border-2 border-[#00ff99] shadow-[0_0_30px_rgba(0,255,153,0.15)] relative scale-[1.02] md:scale-105 z-10' : 'bg-gradient-to-b from-[#00ff9915] to-[#050f0a] border border-[#00ff9930] hover:border-[#00ff9960] relative'}`}
            >
              <div className="absolute -top-3 -right-3">
                 <span className="flex h-5 w-5 md:h-6 md:w-6 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff99] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-5 w-5 md:h-6 md:w-6 bg-[#00ff99] items-center justify-center text-black text-[10px] md:text-xs font-bold md:pt-0.5">VIP</span>
                 </span>
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-[#00ff99]">{lang === 'en' ? 'Enterprise' : 'الشركات الكبرى'}</h3>
              <div className="text-xs md:text-base text-[#94a3b8] mb-3 md:mb-6 min-h-[36px] md:min-h-[48px]">{lang === 'en' ? 'The ultimate custom VIP solution.' : 'الحل المخصص والمهم جداً لشركتك.'}</div>
              <div className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 min-h-[28px] md:min-h-[36px] flex items-baseline">1,000,000+ <span className="text-[10px] md:text-sm text-[#94a3b8] font-normal ml-2">IQD /mo</span></div>
              
              <ul className="flex-1 space-y-2 md:space-y-4 mb-4 md:mb-8 text-xs md:text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '30,000+ Conversations / month' : '30,000+ محادثة / الشهر'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'ALL Channels Included (No extra fees)' : 'كافة القنوات المتضمنة (بدون رسوم)'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Custom AI Persona & Deep Training' : 'تدريب عميق لشخصية الذكاء الاصطناعي'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Dedicated Account Manager & Server Priority' : 'مدير حساب مخصص وأولوية في الخادم'}</span>
                </li>
              </ul>
              
              <button onClick={() => handlePayment('Enterprise', 1000000)} className={`w-full text-xs md:text-base font-semibold py-2 md:py-3 rounded-md transition-colors disabled:opacity-50 ${activePlan === 'Enterprise' ? 'bg-[#00ff99] hover:bg-[#00cc7a] text-black shadow-[0_0_15px_rgba(0,255,153,0.3)]' : 'bg-[#111] hover:bg-[#222] border border-[#00ff9980] text-white'}`}>
                {lang === 'en' ? 'Contact Us' : 'اتصل بنا'}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom CTA Banner */}
      <div className="py-20 relative overflow-hidden bg-[#00ff99] text-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#00cc7a_100%)] opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            {lang === 'en' ? 'Ready to revolutionize your business?' : 'هل أنت مستعد لإحداث ثورة في عملك؟'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl opacity-80 mb-10 max-w-2xl mx-auto"
          >
            {lang === 'en' ? 'Join thousands of businesses scaling their operations with AI automation.' : 'انضم لآلاف الشركات التي تقوم بتوسيع عملياتها عبر أتمتة الذكاء الاصطناعي.'}
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={scrollToPricing}
            className="bg-black text-[#00ff99] hover:bg-white hover:text-black font-bold text-base md:text-lg py-3 md:py-4 px-8 md:px-10 rounded-full transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform hover:-translate-y-1"
          >
            {lang === 'en' ? 'Start Your Free Trial' : 'ابدأ تجربتك المجانية'}
          </motion.button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#050f0a] border border-[#00ff9930] rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,255,153,0.15)] relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ff99]/20 blur-[50px] rounded-full pointer-events-none" />
            
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">
              {lang === 'en' ? 'Get Started' : 'البدء الآن'}
            </h3>
            <p className="text-sm md:text-base text-[#94a3b8] text-center mb-8">
              {lang === 'en' ? `Contact us for getting the ${selectedPlanInfo} system.` : `تواصل معنا للحصول على نظام ${selectedPlanInfo}.`}
            </p>
            
            <div className="flex flex-col gap-4">
              <a 
                href="https://wa.me/+9647754404099" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20b858] text-white text-sm md:text-base font-bold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#25D366]/30 transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                {lang === 'en' ? 'WhatsApp' : 'واتساب'}
              </a>
              <a 
                href="https://www.instagram.com/_voidsystem" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white text-sm md:text-base font-bold py-2 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#FD1D1D]/30 transform hover:-translate-y-1"
              >
                <Instagram className="w-6 h-6" />
                {lang === 'en' ? 'Instagram' : 'انستغرام'}
              </a>
              
              <button 
                onClick={() => setShowContactModal(false)}
                className="mt-4 w-full py-2 md:py-3 rounded-xl border border-[#333] hover:border-[#555] hover:bg-[#111] transition-colors text-[#94a3b8] text-sm md:text-base font-medium"
              >
                {lang === 'en' ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#000a0a] py-12 text-center text-[#94a3b8] text-sm relative z-20">
        <div className="mb-4">
          <div className="text-xl font-bold tracking-widest text-[#f8fafc] mb-2">
            VOID<span className="text-[#00ff99]">.</span>
          </div>
          <p>{lang === 'en' ? 'Empowering your command center.' : 'تمكين مركز القيادة الخاص بك.'}</p>
        </div>
        <div className="flex justify-center gap-6 mb-8">
          <a href="https://www.instagram.com/_voidsystem?igsh=dzV1dWZ2aWc0ZTVh" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] hover:text-[#00ff99] transition-colors">
            <Instagram className="w-6 h-6" />
          </a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} VOID. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
      </footer>
    </div>
  );
}
