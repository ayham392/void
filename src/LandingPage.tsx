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
  
  // Interactive Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: lang === 'en' ? 'Hi there! I am the VOID AI Agent. How can I help you today?' : 'مرحباً! أنا وكيل الذكاء الاصطناعي VOID. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse = lang === 'en' ? `That's a great question about "${userMsg}". Our AI can automatically reply to your customers just like this!` : `هذا استفسار رائع عن "${userMsg}". يمكن للذكاء الاصطناعي لدينا الرد على عملائك تلقائيًا بهذا الشكل!`;
      if (userMsg.toLowerCase().includes('price') || userMsg.includes('سعر') || userMsg.includes('بكم')) {
         aiResponse = lang === 'en' ? 'Our pricing starts at just $29/mo for the Starter plan, giving you up to 1,000 auto-replies. Scroll down to see full pricing details!' : 'تبدأ أسعارنا من 29 دولار/الشهرياً لخطة البداية، وتمنحك حتى 1000 رد تلقائي. قم بالتمرير لأسفل لرؤية تفاصيل الأسعار كاملة!';
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const integrations = [
    { name: 'WhatsApp', icon: <MessageCircle className="w-8 h-8" /> },
    { name: 'Instagram', icon: <Instagram className="w-8 h-8" /> },
    { name: 'Messenger', icon: <Facebook className="w-8 h-8" /> },
    { name: 'Shopify', icon: <ShoppingCart className="w-8 h-8" /> },
    { name: 'WooCommerce', icon: <Store className="w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-[#000a0a] text-[#f8fafc] font-sans selection:bg-[#00ff99] selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-[#00ff9915] bg-[#000a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold tracking-widest text-[#f8fafc]">
                VOID<span className="text-[#00ff99]">.</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
              >
                {lang === 'en' ? 'عربي' : 'English'}
              </button>
              <button 
                onClick={onLoginClick}
                className="bg-[#00ff99] hover:bg-[#00cc7a] text-black text-sm font-semibold py-2 px-5 rounded-md transition-colors shadow-[0_0_15px_rgba(0,255,153,0.3)]"
              >
                {lang === 'en' ? 'Login' : 'تسجيل الدخول'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00ff99]/10 via-[#000a0a]/20 to-[#000a0a] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            {lang === 'en' ? 'Your AI Command Center' : 'مركز القيادة بالذكاء الاصطناعي'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10"
          >
            {lang === 'en' 
              ? 'Manage messages, track leads, and boost your sales with our state-of-the-art AI-powered platform.' 
              : 'قم بإدارة الرسائل وتتبع العملاء المحتملين وزيادة مبيعاتك من خلال منصتنا المتطورة بالذكاء الاصطناعي.'}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <button 
              onClick={onLoginClick}
              className="bg-[#00ff99] hover:bg-[#00cc7a] text-black text-base font-bold py-3 px-8 rounded-md transition-all shadow-[0_0_20px_rgba(0,255,153,0.4)] hover:shadow-[0_0_30px_rgba(0,255,153,0.6)] flex items-center gap-2"
            >
              {lang === 'en' ? 'Get Started' : 'ابدأ الآن'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <a href="#features" className="bg-[#111] hover:bg-[#222] border border-[#333] text-[#f8fafc] text-base font-bold py-3 px-8 rounded-md transition-colors flex items-center">
              {lang === 'en' ? 'Learn More' : 'اعرف المزيد'}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative z-10"
      >
         <div className="bg-[#050f0a] border border-[#00ff9930] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,255,153,0.1)]">
            <div className="bg-[#0a1410] border-b border-[#00ff9920] p-4 flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               <span className="ml-2 text-sm text-[#94a3b8] font-mono">{lang === 'en' ? 'Live AI Demo' : 'ديمو الذكاء الاصطناعي'}</span>
            </div>
            <div className={`p-6 h-[300px] overflow-y-auto flex flex-col gap-4 scroll-smooth ${lang === 'ar' ? 'items-end' : 'items-start'}`}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? (lang === 'en' ? 'justify-end' : 'justify-start') : (lang === 'en' ? 'justify-start' : 'justify-end')}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? `bg-[#00ff99] text-black ${lang === 'en' ? 'rounded-tr-sm' : 'rounded-tl-sm'}` : `bg-[#111] text-white border border-[#222] ${lang === 'en' ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={`flex w-full ${lang === 'en' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`bg-[#111] text-[#94a3b8] border border-[#222] p-3 rounded-2xl ${lang === 'en' ? 'rounded-tl-sm' : 'rounded-tr-sm'} flex gap-1 items-center`}>
                     <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#00ff99] rounded-full"></motion.div>
                     <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#00ff99] rounded-full"></motion.div>
                     <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#00ff99] rounded-full"></motion.div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-[#0a1410] border-t border-[#00ff9920]">
               <form onSubmit={handleChatSubmit} className="flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput} 
                   onChange={(e) => setChatInput(e.target.value)} 
                   placeholder={lang === 'en' ? "Ask about pricing or features..." : "اسأل عن الأسعار أو الميزات..."} 
                   className="flex-1 bg-[#111] border border-[#333] rounded-md px-4 py-2 text-white outline-none focus:border-[#00ff99] transition-colors"
                   dir={lang === 'ar' ? 'rtl' : 'ltr'}
                 />
                 <button type="submit" disabled={isTyping || !chatInput.trim()} className="bg-[#00ff99] hover:bg-[#00cc7a] text-black px-6 py-2 rounded-md font-semibold disabled:opacity-50 transition-colors">
                   {lang === 'en' ? 'Send' : 'إرسال'}
                 </button>
               </form>
            </div>
         </div>
      </motion.div>

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

      {/* Features Section */}
      <div id="features" className="py-24 bg-[#030d06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">{lang === 'en' ? 'What We Offer' : 'ماذا نقدم'}</h2>
            <div className="w-24 h-1 bg-[#00ff99] mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#0a1410] border border-[#00ff9915] p-8 rounded-xl hover:border-[#00ff9940] hover:shadow-[0_0_30px_rgba(0,255,153,0.1)] transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-[#00ff99]/10 rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-[#00ff99]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{lang === 'en' ? 'AI Auto-Replies' : 'ردود تلقائية متطورة'}</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                {lang === 'en' ? 'Instantly respond to customer inquiries across all your social channels with intelligent, context-aware AI messages.' : 'الرد الفوري على استفسارات العملاء عبر جميع قنواتك بذكاء وفي السياق المناسب.'}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a1410] border border-[#00ff9915] p-8 rounded-xl hover:border-[#00ff9940] hover:shadow-[0_0_30px_rgba(0,255,153,0.1)] transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-[#00ff99]/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#00ff99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{lang === 'en' ? 'Advanced Analytics' : 'تحليلات متقدمة'}</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                {lang === 'en' ? 'Track your sales, revenue, and message volume in real-time. Make data-driven decisions to grow your business.' : 'تتبع المبيعات والإيرادات وحجم الرسائل في الوقت الفعلي واتخذ قرارات بناءً على البيانات.'}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-[#0a1410] border border-[#00ff9915] p-8 rounded-xl hover:border-[#00ff9940] hover:shadow-[0_0_30px_rgba(0,255,153,0.1)] transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-[#00ff99]/10 rounded-lg flex items-center justify-center mb-6">
                <Store className="w-6 h-6 text-[#00ff99]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{lang === 'en' ? 'Product Management' : 'إدارة المنتجات'}</h3>
              <p className="text-[#94a3b8] leading-relaxed">
                {lang === 'en' ? 'Easily add, edit, and organize your products. Export data seamlessly to keep your inventory in sync.' : 'إضافة وتعديل وتنظيم منتجاتك بسهولة مع إمكانية تصدير البيانات لتحديث مخزونك.'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">{lang === 'en' ? 'Simple, Transparent Pricing' : 'أسعار بسيطة وشفافة'}</h2>
            <div className="w-24 h-1 bg-[#00ff99] mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Tier */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#050f0a] border border-[#1a1a1a] p-8 rounded-2xl flex flex-col hover:border-[#00ff9940] transition-colors"
            >
              <h3 className="text-2xl font-bold mb-2">{lang === 'en' ? 'Starter' : 'البداية'}</h3>
              <div className="text-[#94a3b8] mb-6">{lang === 'en' ? 'For individuals and small setups' : 'للأفراد والمشاريع الصغيرة'}</div>
              <div className="text-4xl font-extrabold mb-8">$29<span className="text-lg text-[#94a3b8] font-normal">/mo</span></div>
              
              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Up to 1,000 auto-replies' : 'حتى 1000 رد تلقائي'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Basic Analytics' : 'تحليلات أساسية'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? '50 Products limit' : 'كحد أقصى 50 منتج'}</span>
                </li>
              </ul>
              
              <button onClick={onLoginClick} className="w-full bg-[#111] hover:bg-[#222] border border-[#333] text-white font-semibold py-3 rounded-md transition-colors">
                {lang === 'en' ? 'Get Started' : 'ابدأ الآن'}
              </button>
            </motion.div>
            
            {/* Pro Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#000a0a] border-2 border-[#00ff99] p-8 rounded-2xl flex flex-col relative shadow-[0_0_30px_rgba(0,255,153,0.15)] transform md:-translate-y-4"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00ff99] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {lang === 'en' ? 'Most Popular' : 'الأكثر شيوعاً'}
              </div>
              <h3 className="text-2xl font-bold mb-2">{lang === 'en' ? 'Professional' : 'المحترفين'}</h3>
              <div className="text-[#94a3b8] mb-6">{lang === 'en' ? 'For growing businesses' : 'للشركات النامية'}</div>
              <div className="text-4xl font-extrabold mb-8">$79<span className="text-lg text-[#94a3b8] font-normal">/mo</span></div>
              
              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Unlimited auto-replies' : 'ردود تلقائية غير محدودة'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Advanced Analytics & Exports' : 'تحليلات متقدمة وتصدير البيانات'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Unlimited Products' : 'منتجات غير محدودة'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Priority Support' : 'دعم فني ذو أولوية'}</span>
                </li>
              </ul>
              
              <button onClick={onLoginClick} className="w-full bg-[#00ff99] hover:bg-[#00cc7a] text-black font-bold py-3 rounded-md transition-colors shadow-[0_0_15px_rgba(0,255,153,0.3)]">
                {lang === 'en' ? 'Get Professional' : 'احصل على الخطة'}
              </button>
            </motion.div>
            
            {/* Enterprise Tier */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#050f0a] border border-[#1a1a1a] p-8 rounded-2xl flex flex-col hover:border-[#00ff9940] transition-colors"
            >
              <h3 className="text-2xl font-bold mb-2">{lang === 'en' ? 'Enterprise' : 'الشركات'}</h3>
              <div className="text-[#94a3b8] mb-6">{lang === 'en' ? 'Custom solutions for large teams' : 'حلول مخصصة للفرق الكبيرة'}</div>
              <div className="text-4xl font-extrabold mb-8">{lang === 'en' ? 'Custom' : 'مخصص'}</div>
              
              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Custom AI Model Training' : 'تدريب نموذج ذكاء اصطناعي مخصص'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'API Access' : 'صلاحية وصول API'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00ff99] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{lang === 'en' ? 'Dedicated Account Manager' : 'مدير حساب مخصص'}</span>
                </li>
              </ul>
              
              <button onClick={onLoginClick} className="w-full bg-[#111] hover:bg-[#222] border border-[#333] text-white font-semibold py-3 rounded-md transition-colors">
                {lang === 'en' ? 'Contact Us' : 'اتصل بنا'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="py-20 relative overflow-hidden bg-[#00ff99] text-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#00cc7a_100%)] opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
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
            onClick={onLoginClick}
            className="bg-black text-[#00ff99] hover:bg-white hover:text-black font-bold text-lg py-4 px-10 rounded-full transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform hover:-translate-y-1"
          >
            {lang === 'en' ? 'Start Your Free Trial' : 'ابدأ تجربتك المجانية'}
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#000a0a] py-12 text-center text-[#94a3b8] text-sm relative z-20">
        <div className="mb-4">
          <div className="text-xl font-bold tracking-widest text-[#f8fafc] mb-2">
            VOID<span className="text-[#00ff99]">.</span>
          </div>
          <p>{lang === 'en' ? 'Empowering your command center.' : 'تمكين مركز القيادة الخاص بك.'}</p>
        </div>
        <div>
          &copy; {new Date().getFullYear()} VOID. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
      </footer>
    </div>
  );
}
