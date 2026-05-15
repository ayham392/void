import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { translate } from './lib/i18n';
import LandingPage from './LandingPage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Markdown from 'react-markdown';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MessageSquare, PackageOpen, Inbox, Menu, X, Sun, Moon, Bold, Italic, List, Heading1, Heading2, Quote, Code } from 'lucide-react';
import { Toaster, toast } from 'sonner';

type Lang = 'en' | 'ar';
type Panel = 'home' | 'messages' | 'products' | 'calculator' | 'orders';

// --- Shared Hooks & Helpers ---
function useCountUp(target: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loadingApp, setLoadingApp] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setSession({ user: { id: 'demo-user', email: 'vip@void.system' } });
      setClient({
        id: 'mock-client',
        company_name: 'VIP Subscriber',
        subscription_tier: 'enterprise',
        subscription_status: 'active'
      });
      setLoadingApp(false);
      navigate('/dashboard', { replace: true });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchClient(session.user.id);
      else setLoadingApp(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchClient(session.user.id);
      else {
        setClient(null);
        setLoadingApp(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function fetchClient(userId: string) {
    // In a real DB, normally you match user.id, but since you had select().single(), I am keeping that behavior
    const { data, error } = await supabase.from('clients').select('*').single();
    if (error) {
      toast.error(error.message);
    } else if (data) {
      setClient(data);
    }
    setLoadingApp(false);
  }

  if (loadingApp) return <div className="min-h-screen flex items-center justify-center bg-[#000a0a] text-[#00ff99]">INITIALIZING VOID SYSTEMS...</div>;

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} setLang={setLang} onLoginClick={() => navigate('/login')} />} />
        <Route path="/login" element={
          (!session || !client) ? 
            <Login setSession={setSession} lang={lang} onBack={() => navigate('/')} /> : 
            <Navigate to="/dashboard" replace />
        } />
        <Route path="/dashboard" element={
          (session && client) ? 
            <Dashboard client={client} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onLogout={() => { supabase.auth.signOut(); navigate('/'); }} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme={theme} position="bottom-right" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// --- Login Page ---
function Login({ setSession, lang, onBack }: { setSession: any, lang: Lang, onBack: () => void }) {
  const t = (key: string) => translate(key, lang);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('void_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(lang === 'ar' ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }
    
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem('void_remembered_email', email);
    } else {
      localStorage.removeItem('void_remembered_email');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Successfully logged in');
    }
    setLoading(false);
  };

  return (
    <div id="login-page">
      <div className="login-brand-corner cursor-pointer flex items-center gap-2" onClick={onBack}>
        <svg className="w-5 h-5 text-[#00ff99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {lang === 'ar' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          )}
        </svg>
        <span className="text-sm font-semibold">{t('back') || (lang === 'en' ? 'Back to Site' : 'العودة للموقع')}</span>
      </div>
      
      <div className="login-content">
        <div className="login-headline">Your <span className="hl-green">Command</span> <span className="hl-neon">Center.</span></div>
        <div className="login-tagline">{t('tagline')}</div>
        
        <div className="login-card glass">
          <div className="login-card-header mb-8 text-center">
            <h2 className="text-xl font-bold mb-2">{t('signin')}</h2>
            <p className="text-[#94a3b8] text-xs">{t('signin_sub')}</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>{t('email_lbl')}</label>
              <input className="inp text-center" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>{t('pass_lbl')}</label>
              <input className="inp text-center" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            
            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-[color:var(--text)]">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-[#00ff99] focus:ring-[#00ff99] focus:ring-offset-gray-900" />
                <span>{t('remember')}</span>
              </label>
              <a href="#" className="text-[color:var(--neon)] hover:underline" onClick={(e) => { e.preventDefault(); alert(t('forgot_action')) }}>{t('forgot')}</a>
            </div>

            <button type="submit" className="btn btn-neon btn-block" disabled={loading}>
              <span>{loading ? '...' : t('signin_btn')}</span>
            </button>
          </form>
        </div>

        <div className="features-row">
          <Feature name={t('f1n')} desc={t('f1d')} />
          <Feature name={t('f2n')} desc={t('f2d')} />
          <Feature name={t('f3n')} desc={t('f3d')} />
          <Feature name={t('f4n')} desc={t('f4d')} soon={t('soon')} />
        </div>
      </div>
    </div>
  );
}

function Feature({ name, desc, soon }: any) {
  return (
    <div className="feat-item">
      <div className="feat-item-name">{name}</div>
      <div className="feat-item-desc">{desc}</div>
      {soon && <div className="feat-soon">{soon}</div>}
    </div>
  );
}

// --- Dashboard Layout ---
function formatCurrency(amount: number, currency: string) {
  const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0 }).formatToParts(amount);
  return parts.map(part => part.type === 'currency' ? `${part.value} ` : part.value).join('').replace(/ \s/g, ' ').trim();
}

function Dashboard({ client, lang, setLang, theme, setTheme, onLogout }: any) {
  const t = (key: string) => translate(key, lang);
  const [panel, setPanel] = useState<Panel>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ msgs: 0, leads: 0, sales: 0 });

  // Data Loading
  useEffect(() => {
    if (!client) return;

    const loadData = async () => {
      try {
        // Products
        const { data: prodData, error: prodErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (prodErr) toast.error(prodErr.message);
        setProducts(prodData || []);

        // Messages
        const { data: msgData, error: msgErr } = await supabase.from('interaction_log').select('*').eq('client_id', client.id).order('timestamp', { ascending: false }).limit(80);
        if (msgErr) toast.error(msgErr.message);
        setMessages(msgData || []);

        // Stats
        const [m, l, s] = await Promise.all([
          supabase.from('interaction_log').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
          supabase.from('leads').select('id', { count: 'exact', head: true }).eq('instagram_id', client.instagram_page_id),
          supabase.from('leads').select('id', { count: 'exact', head: true }).eq('instagram_id', client.instagram_page_id).eq('payment_status', 'paid')
        ]);
        
        if (m.error) toast.error(m.error.message);
        if (l.error) toast.error(l.error.message);
        if (s.error) toast.error(s.error.message);

        setStats({ msgs: m.count || 0, leads: l.count || 0, sales: s.count || 0 });
      } catch (err: any) {
        toast.error(err.message || 'Failed to load dashboard data');
      }
    };

    loadData();

    const rtSub = supabase.channel('vs-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interaction_log', filter: `client_id=eq.${client.id}` }, payload => {
        setMessages(prev => [payload.new, ...prev].slice(0, 80));
        setStats(s => ({ ...s, msgs: s.msgs + 1 }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `client_id=eq.${client.id}` }, async () => {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) toast.error(error.message);
        else setProducts(data || []);
      })
      .subscribe();

    return () => { supabase.removeChannel(rtSub); };
  }, [client]);

  return (
    <div id="app">
      <div id="topbar">
        <div className="topbar-brand">{t('brand')}</div>
        <div className="hidden md:flex items-center gap-1">
          <NavBtn active={panel === 'home'} onClick={() => setPanel('home')} text={t('nav_home')} />
          <NavBtn active={panel === 'messages'} onClick={() => setPanel('messages')} text={t('nav_msgs')} badge={messages.length} />
          <NavBtn active={panel === 'orders'} onClick={() => setPanel('orders')} text={t('nav_orders')} />
          <NavBtn active={panel === 'products'} onClick={() => setPanel('products')} text={t('nav_prods')} badge={products.length} />
          <NavBtn active={panel === 'calculator'} onClick={() => setPanel('calculator')} text={t('nav_calc')} />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="live-indicator"><div className="live-dot"></div><span>{t('live')}</span></div>
          <div className="client-chip hidden md:block">{client?.client_name || '—'}</div>
          <button className="p-2 text-[color:var(--text-dim)] hover:text-[color:var(--text)]" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><span>{lang === 'en' ? 'عربي' : 'English'}</span></button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>{t('signout')}</button>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="live-indicator"><div className="live-dot"></div><span>{t('live')}</span></div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[color:var(--text)]">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

       {isMobileMenuOpen && (
        <div className="md:hidden bg-[color:var(--topbar-bg)] border-b border-[color:var(--border)] p-4 flex flex-col gap-4 relative z-40 shadow-xl">
          <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-2">
             <span className="text-[color:var(--text-dim)] text-sm"> {client?.client_name || '—'} </span>
             <button className="p-2 text-[color:var(--text-dim)] hover:text-[color:var(--text)]" onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMobileMenuOpen(false); }}>
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>
          <button className="btn btn-ghost w-full justify-center whitespace-nowrap" onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setIsMobileMenuOpen(false); }}>
            {lang === 'en' ? 'عربي' : 'English'}
          </button>
          <button className="btn btn-ghost w-full justify-center text-red-400 hover:text-red-300" onClick={onLogout}>
            {t('signout')}
          </button>
        </div>
      )}
      
      {/* Mobile nav fallback */}
      <div className="flex md:hidden bg-[color:var(--topbar-bg)] border-b border-[color:var(--border)] p-2 overflow-x-auto gap-2">
         <NavBtn active={panel === 'home'} onClick={() => setPanel('home')} text={t('nav_home')} />
         <NavBtn active={panel === 'messages'} onClick={() => setPanel('messages')} text={t('nav_msgs')} />
         <NavBtn active={panel === 'orders'} onClick={() => setPanel('orders')} text={t('nav_orders')} />
         <NavBtn active={panel === 'products'} onClick={() => setPanel('products')} text={t('nav_prods')} />
         <NavBtn active={panel === 'calculator'} onClick={() => setPanel('calculator')} text={t('nav_calc')} />
      </div>

      <div className="flex-1">
        {panel === 'home' && <HomePanel t={t} stats={stats} products={products} messages={messages} setPanel={setPanel} lang={lang} client={client} />}
        {panel === 'messages' && <MessagesPanel t={t} messages={messages} lang={lang} />}
        {panel === 'orders' && <OrdersPanel t={t} client={client} lang={lang} />}
        {panel === 'products' && <ProductsPanel t={t} products={products} client={client} lang={lang} />}
        {panel === 'calculator' && <CalculatorPanel t={t} />}
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, text, badge }: any) {
  return (
    <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick}>
      {text} {badge !== undefined && <span className="badge">{badge}</span>}
    </button>
  );
}

// --- Home Panel ---
const weekDaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDaysAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

function HomePanel({ t, stats, products, messages, setPanel, lang, client }: any) {
  const activeProds = useMemo(() => products.filter((p: any) => p.is_active), [products]);
  const df = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-IQ' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const [msgsDuration, setMsgsDuration] = useState('7d');
  const [salesDuration, setSalesDuration] = useState('7d');
  const [revDuration, setRevDuration] = useState('7d');

  const [dbMessages, setDbMessages] = useState<any[]>([]);
  const [dbSales, setDbSales] = useState<any[]>([]);

  useEffect(() => {
    if (!client) return;
    const loadRealData = async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const [msgRes, salesRes] = await Promise.all([
        supabase.from('interaction_log')
          .select('timestamp')
          .eq('client_id', client.id)
          .gte('timestamp', oneYearAgo.toISOString()),
        supabase.from('leads')
          .select('created_at, amount')
          .eq('instagram_id', client.instagram_page_id)
          .eq('payment_status', 'paid')
          .gte('created_at', oneYearAgo.toISOString())
      ]);
      setDbMessages(msgRes.data || []);
      setDbSales(salesRes.data || []);
    };
    loadRealData();
  }, [client]);

  const avgPrice = useMemo(() => {
    if (activeProds.length > 0) {
      return activeProds.reduce((sum: number, p: any) => sum + Number(p.price || 0), 0) / activeProds.length;
    }
    return 25; 
  }, [activeProds]);

  const buildChartData = (
    data: any[], 
    dateField: string, 
    duration: string, 
    valueKey: string, 
    isRevenue: boolean = false
  ) => {
    let points: any[] = [];
    const now = new Date();
    
    const calculateBucket = (start: Date, end: Date) => {
       const res = data.filter(d => {
         const dTime = new Date(d[dateField]).getTime();
         return dTime >= start.getTime() && dTime < end.getTime();
       });
       if (isRevenue) {
         return res.reduce((sum, d) => sum + (Number(d.amount) || avgPrice), 0);
       }
       return res.length;
    };

    if (duration === '1h') {
        for(let i=11; i>=0; i--) {
            const end = new Date(now.getTime() - i * 5 * 60000);
            const start = new Date(now.getTime() - (i + 1) * 5 * 60000);
            const timeStr = start.toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            points.push({ name: timeStr, [valueKey]: calculateBucket(start, end) });
        }
    } else if (duration === '24h') {
        for(let i=11; i>=0; i--) {
            const end = new Date(now.getTime() - i * 2 * 3600000);
            const start = new Date(now.getTime() - (i + 1) * 2 * 3600000);
            const timeStr = start.toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', hour12: false }) + ':00';
            points.push({ name: timeStr, [valueKey]: calculateBucket(start, end) });
        }
    } else if (duration === '7d') {
        const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for(let i=6; i>=0; i--) {
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            points.push({ name: lang === 'ar' ? daysAr[start.getDay()] : daysEn[start.getDay()], [valueKey]: calculateBucket(start, end) });
        }
    } else if (duration === '1m') {
        for(let i=14; i>=0; i--) {
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i*2 + 1);
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i+1)*2 + 1);
            const dateStr = start.toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' });
            points.push({ name: dateStr, [valueKey]: calculateBucket(start, end) });
        }
    } else if (duration === '3m') {
        for(let i=11; i>=0; i--) {
            const end = new Date(now.getTime() - i * 7 * 86400000);
            const start = new Date(now.getTime() - (i + 1) * 7 * 86400000);
            const dateStr = start.toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' });
            points.push({ name: dateStr, [valueKey]: calculateBucket(start, end) });
        }
    } else if (duration === '1y') {
        for(let i=11; i>=0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const mStr = start.toLocaleString(lang === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short' });
            points.push({ name: mStr, [valueKey]: calculateBucket(start, end) });
        }
    }

    return points;
  };

  const msgsChartData = useMemo(() => buildChartData(dbMessages, 'timestamp', msgsDuration, 'messages'), [dbMessages, msgsDuration, lang]);
  const salesChartData = useMemo(() => buildChartData(dbSales, 'created_at', salesDuration, 'sales'), [dbSales, salesDuration, lang]);
  
  const { revChartData, totalRev, currency } = useMemo(() => {
    const curr = activeProds[0]?.currency || 'USD';
    const points = buildChartData(dbSales, 'created_at', revDuration, 'revenue', true);
    const total = points.reduce((sum, p) => sum + p.revenue, 0);
    return { revChartData: points, totalRev: total, currency: curr };
  }, [dbSales, revDuration, lang, avgPrice, activeProds]);

  return (
    <div className="panel active">
      <div className="analytics-top">
        <div className="page-title">{t('home_title')}</div>
        <div className="page-sub">{t('home_sub')}</div>
      </div>
      <div className="stats-grid">
        <StatCard label={t('stat1')} value={stats.msgs} sub={t('stat1_sub')} />
        <StatCard label={t('stat2')} value={stats.leads} sub={t('stat2_sub')} />
        <StatCard label={t('stat3')} value={stats.sales} sub={t('stat3_sub')} />
        <StatCard label={t('stat4')} value={activeProds.length} sub={t('stat4_sub')} />
      </div>

      <div className="mt-8 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
                <div className="section-head-title text-sm font-semibold text-[color:var(--text-dim)] uppercase tracking-wider">{t('rev_title')}</div>
                <div className="text-xs text-[color:var(--text-muted)] mt-1">{t('rev_sub')}</div>
            </div>
            <div className="flex bg-[color:var(--bg-card)] rounded-lg p-1 mt-3 md:mt-0 border border-[color:var(--border)] overflow-x-auto max-w-full hide-scrollbar">
               {['1h', '24h', '7d', '1m', '3m', '1y'].map(d => (
                 <button 
                    key={d}
                    onClick={() => setRevDuration(d)}
                    className={`px-3 py-1 text-xs whitespace-nowrap rounded-md transition-colors ${revDuration === d ? 'bg-[color:var(--neon)] text-black font-semibold' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'}`}
                 >
                    {t(`rev_${d}`)}
                 </button>
               ))}
            </div>
        </div>
        
        <div className="glass2 overflow-hidden p-5 flex flex-col h-[350px]">
          <div className="text-2xl font-bold mb-4">{formatCurrency(totalRev, currency)}</div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={40} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                  formatter={(value: any) => [formatCurrency(value, currency), lang === 'ar' ? 'الإيرادات' : 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--neon)" strokeWidth={3} dot={{ r: 4, fill: 'var(--neon)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 mt-5">
        <div className="glass2 overflow-hidden min-w-0 p-5 flex flex-col h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <div className="section-head-title text-sm font-semibold text-[color:var(--text-dim)] uppercase tracking-wider">{t('chart_msgs')}</div>
            <div className="flex bg-[color:var(--bg-card)] rounded-md p-1 border border-[color:var(--border)] overflow-x-auto hide-scrollbar">
               {['1h', '24h', '7d', '1m', '3m', '1y'].map(d => (
                 <button 
                    key={d}
                    onClick={() => setMsgsDuration(d)}
                    className={`px-2 py-1 text-[10px] whitespace-nowrap rounded transition-colors ${msgsDuration === d ? 'bg-[color:var(--neon)] text-black font-semibold' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'}`}
                 >
                    {t(`rev_${d}`)}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={msgsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="messages" fill="var(--neon)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass2 overflow-hidden min-w-0 p-5 flex flex-col h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <div className="section-head-title text-sm font-semibold text-[color:var(--text-dim)] uppercase tracking-wider">{t('chart_sales')}</div>
            <div className="flex bg-[color:var(--bg-card)] rounded-md p-1 border border-[color:var(--border)] overflow-x-auto hide-scrollbar">
               {['1h', '24h', '7d', '1m', '3m', '1y'].map(d => (
                 <button 
                    key={d}
                    onClick={() => setSalesDuration(d)}
                    className={`px-2 py-1 text-[10px] whitespace-nowrap rounded transition-colors ${salesDuration === d ? 'bg-[color:var(--neon)] text-black font-semibold' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'}`}
                 >
                    {t(`rev_${d}`)}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="sales" stroke="var(--light)" strokeWidth={3} dot={{ r: 4, fill: 'var(--light)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analytics-bottom">
        <div className="glass2 recent-msgs">
          <div className="section-head">
            <div className="section-head-title">{t('recent_msgs')}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPanel('messages')}>{t('view_all')}</button>
          </div>
          <div>
            {messages.length === 0 ? (
              <div className="empty-state flex flex-col items-center justify-center py-10 text-[color:var(--text-muted)] gap-3">
                <MessageSquare className="w-10 h-10 opacity-20" />
                <div className="text-sm">{t('msgs_empty')}</div>
              </div>
            ) : (
              messages.slice(0, 6).map((m: any) => (
                <div className="mini-msg" key={m.id}>
                  <div className="mini-msg-dot"></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mini-msg-sender">{m.sender_id || '—'}</div>
                    <div className="mini-msg-text">{m.user_message || '—'}</div>
                  </div>
                  <div className="mini-msg-time">{df.format(new Date(m.timestamp))}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="glass2 top-products">
          <div className="section-head">
            <div className="section-head-title">{t('top_prods')}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPanel('products')}>{t('manage')}</button>
          </div>
          <div>
            {activeProds.length === 0 ? (
              <div className="empty-state flex flex-col items-center justify-center py-10 text-[color:var(--text-muted)] gap-3">
                <PackageOpen className="w-10 h-10 opacity-20" />
                <div className="text-sm">{t('prods_empty')}</div>
              </div>
            ) : (
              activeProds.slice(0, 6).map((p: any, i: number) => (
                <div className="top-prod-item" key={p.id}>
                  <div className="top-prod-rank">{i + 1}</div>
                  <div className="top-prod-name">{p.name}</div>
                  <div className="top-prod-price">
                    {formatCurrency(Number(p.price), p.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, prefix = '' }: any) {
  const animatedValue = useCountUp(value);
  return (
    <div className="stat-card glass">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{prefix}{animatedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
      <div className="stat-change">{sub}</div>
    </div>
  );
}

// --- Messages Panel ---
function MessagesPanel({ t, messages, lang }: any) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? messages : messages.filter((m: any) => (m.action || 'reply') === filter);
  const df = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-IQ' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="panel active">
      <div className="messages-header">
        <div>
          <div className="page-title">{t('msgs_title')}</div>
          <div className="page-sub">{t('msgs_sub')}</div>
        </div>
        <div className="msg-filters">
          <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>{t('filter_all')}</button>
          <button className={`filter-pill ${filter === 'save_lead' ? 'active' : ''}`} onClick={() => setFilter('save_lead')}>{t('filter_leads')}</button>
          <button className={`filter-pill ${filter === 'reply' ? 'active' : ''}`} onClick={() => setFilter('reply')}>{t('filter_replies')}</button>
        </div>
      </div>
      <div className="msgs-list">
        {visible.length === 0 ? (
          <div className="empty-state flex flex-col items-center justify-center py-20 text-[color:var(--text-muted)] gap-4">
            <Inbox className="w-16 h-16 opacity-10" />
            <div className="text-lg">{t('msgs_empty')}</div>
          </div>
        ) : (
          visible.map((m: any) => {
            const action = m.action || 'reply';
            const ac = ['save_lead', 'reply'].includes(action) ? action : 'other';
            return (
              <div className="msg-card glass" key={m.id}>
                <div className="msg-top">
                  <span className="msg-sender-badge">{m.sender_id || '—'}</span>
                  <span className={`msg-action-badge ${ac}`}>{action}</span>
                  <span className="msg-time">{df.format(new Date(m.timestamp))}</span>
                </div>
                <div className="msg-body !flex !flex-col md:!grid md:grid-cols-2">
                  <div>
                    <div className="msg-col-label">{t('user_msg')}</div>
                    <div className="msg-col-text">{m.user_message || '—'}</div>
                  </div>
                  <div>
                    <div className="msg-col-label">{t('ai_reply')}</div>
                    <div className="msg-col-text">{m.reply_text || '—'}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function parseProductData(desc: string | null) {
  let cleanDesc = desc || '';
  let variants = [];
  let customAttr = [];
  
  if (cleanDesc) {
    const varMatch = cleanDesc.match(/<!-- variants: (.*?) -->/);
    if (varMatch) {
      try {
        variants = JSON.parse(varMatch[1]);
        cleanDesc = cleanDesc.replace(varMatch[0], '').trim();
      } catch(e) {}
    }
    
    const attrMatch = cleanDesc.match(/<!-- custom_attr: (.*?) -->/);
    if (attrMatch) {
      try {
        customAttr = JSON.parse(attrMatch[1]);
        cleanDesc = cleanDesc.replace(attrMatch[0], '').trim();
      } catch(e) {}
    }
  }
  
  return { desc: cleanDesc, variants, customAttr };
}

// --- Products Panel ---
function ProductsPanel({ t, products, client, lang }: any) {
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ name: '', price: '', currency: 'IQD', qty: '', desc: '', variants: [] as any[], customAttr: [] as any[]});
  const [errors, setErrors] = useState<{name?: string, price?: string, qty?: string, variants?: any[]}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceChange, setBulkPriceChange] = useState({ amount: '', type: 'fixed' as 'fixed' | 'increase' | 'decrease' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const descRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const newErrors: any = {};
    if (form.name !== '' && !form.name.trim()) newErrors.name = lang === 'ar' ? 'اسم المنتج مطلوب' : 'Product name is required';
    
    if (form.price !== '' && isNaN(Number(form.price))) {
      newErrors.price = lang === 'ar' ? 'يجب أن يكون السعر رقماً' : 'Price must be a number';
    } else if (form.price !== '' && Number(form.price) < 0) {
      newErrors.price = lang === 'ar' ? 'يجب أن يكون السعر موجباً' : 'Price must be positive';
    }

    if (form.qty !== '' && (isNaN(Number(form.qty)) || Number(form.qty) < 0 || !Number.isInteger(Number(form.qty)))) {
      newErrors.qty = lang === 'ar' ? 'يجب أن تكون الكمية رقماً صحيحاً صالحاً' : 'Quantity must be a valid integer';
    }

    const varErrs: any[] = [];
    let hasVarErr = false;
    form.variants.forEach((v) => {
      const verr: any = {};
      if (v.name !== '' && !v.name.trim()) verr.name = lang === 'ar' ? 'مطلوب' : 'Required';
      if (v.price !== '' && (isNaN(Number(v.price)) || Number(v.price) < 0)) verr.price = lang === 'ar' ? 'غير صالح' : 'Invalid';
      if (v.qty !== '' && (isNaN(Number(v.qty)) || Number(v.qty) < 0 || !Number.isInteger(Number(v.qty)))) verr.qty = lang === 'ar' ? 'غير صالح' : 'Invalid';
      varErrs.push(verr);
      if (Object.keys(verr).length > 0) hasVarErr = true;
    });
    if (hasVarErr) newErrors.variants = varErrs;

    setErrors(newErrors);
  }, [form, lang]);

  const applyFormatting = (prefix: string, suffix: string = '') => {
    if (!descRef.current) return;
    const start = descRef.current.selectionStart;
    const end = descRef.current.selectionEnd;
    const text = form.desc;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    setForm({ ...form, desc: newText });
    
    // setTimeout to allow React to update the value before selecting
    setTimeout(() => {
      if (descRef.current) {
        descRef.current.focus();
        descRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        toast.error(lang === 'ar' ? 'ملف CSV فارغ' : 'Empty CSV file');
        return;
      }

      const parseCSVLine = (line: string) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"' && line[i+1] === '"') {
            cur += '"';
            i++; 
          } else if (line[i] === '"') {
            inQuotes = !inQuotes;
          } else if (line[i] === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
          } else {
            cur += line[i];
          }
        }
        result.push(cur.trim());
        return result;
      };
      
      const rawHeaders = parseCSVLine(lines[0]);
      const headers = rawHeaders.map(h => h.trim().toLowerCase());
      
      const newProducts = lines.slice(1).map(line => {
        const row = parseCSVLine(line);
        let name = 'Untitled', price = 0, currency = 'IQD', quantity = null, is_active = true, description = '';
        let customAttr: any[] = [];
        
        headers.forEach((h, idx) => {
          const val = row[idx] || '';
          if (h === 'name') name = val;
          else if (h === 'price') price = parseFloat(val) || 0;
          else if (h === 'currency') currency = val;
          else if (h === 'quantity') quantity = val ? parseInt(val) : null;
          else if (h === 'status') is_active = val.toLowerCase() === 'active';
          else if (h === 'description') description = val;
          else if (h !== 'id' && h !== 'created at' && h !== 'created_at' && h !== '') {
            customAttr.push({ k: rawHeaders[idx].trim(), v: val });
          }
        });
        
        // Ensure name is populated (fallback if standard columns like index 1 was mapped instead)
        if (name === 'Untitled' && row[1] && headers[1] !== 'name') name = row[1];
        
        let finalDesc = description;
        if (customAttr.length > 0) {
          finalDesc = `${finalDesc}\n\n<!-- custom_attr: ${JSON.stringify(customAttr)} -->`.trim();
        }
        
        return {
          name: name,
          price: price,
          currency: currency,
          quantity: quantity,
          is_active: is_active,
          description: finalDesc || null,
          client_id: client.id
        };
      }).filter(p => !!p.name);
      
      if (newProducts.length > 0) {
        const { error } = await supabase.from('products').insert(newProducts);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(lang === 'ar' ? 'تم الاستيراد بنجاح' : 'Import successful');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const submitProduct = async () => {
    if (Object.keys(errors).length > 0) {
      return toast.error(lang === 'ar' ? 'يرجى إصلاح أخطاء النموذج قبل الحفظ' : 'Please fix form errors before saving.');
    }
    if (!form.name.trim()) return toast.error(lang === 'ar' ? 'اسم المنتج مطلوب' : 'Product name is required.');
    
    // Encode variants and custom properties into description
    let finalDesc = form.desc.trim() || '';
    const cleanVariants = form.variants.filter(v => v.name.trim() !== '');
    if (cleanVariants.length > 0) {
      finalDesc = `${finalDesc}\n\n<!-- variants: ${JSON.stringify(cleanVariants)} -->`.trim();
    }
    const cleanAttr = form.customAttr.filter(a => a.k.trim() !== '');
    if (cleanAttr.length > 0) {
      finalDesc = `${finalDesc}\n\n<!-- custom_attr: ${JSON.stringify(cleanAttr)} -->`.trim();
    }
    
    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      quantity: form.qty !== '' ? parseInt(form.qty) : null,
      description: finalDesc || null
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) toast.error(error.message);
      else { toast.success(t('prod_updated')); cancelEdit(); }
    } else {
      const { error } = await supabase.from('products').insert({ ...payload, client_id: client.id, is_active: true });
      if (error) toast.error(error.message);
      else { toast.success(t('prod_added')); cancelEdit(); }
    }
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm({ name: '', price: '', currency: 'IQD', qty: '', desc: '', variants: [], customAttr: [] });
  };

  const toggleProduct = async (id: string, newState: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: newState }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(newState ? (lang === 'ar' ? 'المنتج نشط الآن' : 'Product is now active') : (lang === 'ar' ? 'المنتج مخفي' : 'Product is now hidden'));
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('prod_deleted'));
      setDeleteConfirmId(null);
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (!selectedIds.length) return;
    const { error } = await supabase.from('products').update({ is_active: activate }).in('id', selectedIds);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'ar' ? 'تم التحديث بنجاح' : 'Bulk update successful');
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف المنتجات المحددة؟' : 'Are you sure you want to delete selected products?')) return;
    const { error } = await supabase.from('products').delete().in('id', selectedIds);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      setSelectedIds([]);
    }
  };

  const handleBulkPriceSubmit = async () => {
    if (!selectedIds.length) return;
    const amt = parseFloat(bulkPriceChange.amount);
    if (isNaN(amt)) return toast.error(lang === 'ar' ? 'أدخل سعرًا صالحًا' : 'Enter a valid price');
    try {
      await Promise.all(selectedIds.map(async (id) => {
        const product = products.find((p: any) => p.id === id);
        let newPrice = parseFloat(product?.price || '0');
        if (bulkPriceChange.type === 'fixed') newPrice = amt;
        else if (bulkPriceChange.type === 'increase') newPrice += amt;
        else if (bulkPriceChange.type === 'decrease') newPrice = Math.max(0, newPrice - amt);
        
        const { error } = await supabase.from('products').update({ price: newPrice.toString() }).eq('id', id);
        if (error) throw error;
      }));
      
      toast.success(lang === 'ar' ? 'تم تحديث الأسعار' : 'Prices updated');
      setShowBulkPriceModal(false);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const exportData = () => {
    const headers = ['ID', 'Name', 'Price', 'Currency', 'Quantity', 'Status', 'Description', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...products.map((p: any) => [
        p.id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        p.price,
        p.currency,
        p.quantity || '',
        p.is_active ? 'Active' : 'Hidden',
        `"${(p.description || '').replace(/"/g, '""')}"`,
        p.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${client?.client_name || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc': return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'price_asc': return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      case 'price_desc': return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      case 'date_asc': return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case 'date_desc':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedProducts.length && sortedProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedProducts.map((p: any) => p.id));
    }
  };

  const toggleBulkSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="panel active">
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="page-title">{t('prods_title')}</div>
          <div className="page-sub">{t('prods_sub')}</div>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            style={{ display: 'none' }} 
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost w-full sm:w-auto justify-center whitespace-nowrap text-xs md:text-[13px] px-3 py-1.5 md:px-4 md:py-2">
            {lang === 'ar' ? 'استيراد CSV' : 'Import CSV'}
          </button>
          <button onClick={exportData} className="btn btn-ghost w-full sm:w-auto justify-center whitespace-nowrap text-xs md:text-[13px] px-3 py-1.5 md:px-4 md:py-2">
            {lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </button>
          <input 
            type="text" 
            className="inp w-full sm:w-64" 
            placeholder={t('search_prods')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select className="inp w-full sm:w-48" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date_desc">{t('sort_date_desc')}</option>
            <option value="date_asc">{t('sort_date_asc')}</option>
            <option value="name_asc">{t('sort_name_asc')}</option>
            <option value="name_desc">{t('sort_name_desc')}</option>
            <option value="price_asc">{t('sort_price_asc')}</option>
            <option value="price_desc">{t('sort_price_desc')}</option>
          </select>
        </div>
      </div>
      
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-[color:var(--surface2)] border border-[color:var(--glass-border)] rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {lang === 'ar' ? `${selectedIds.length} منتج محدد` : `${selectedIds.length} products selected`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => handleBulkActivate(true)} className="btn btn-ghost text-xs py-1.5 px-3">
              {lang === 'ar' ? 'تنشيط' : 'Activate'}
            </button>
            <button onClick={() => handleBulkActivate(false)} className="btn btn-ghost text-xs py-1.5 px-3">
              {lang === 'ar' ? 'إخفاء' : 'Deactivate'}
            </button>
            <button onClick={() => setShowBulkPriceModal(true)} className="btn btn-ghost text-xs py-1.5 px-3">
              {lang === 'ar' ? 'تغيير السعر' : 'Change Price'}
            </button>
            <button onClick={handleBulkDelete} className="btn text-red-500 hover:bg-red-500/10 text-xs py-1.5 px-3 bg-transparent border border-red-500/30">
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-sm p-6 rounded-2xl border border-[color:var(--glass-border)] shadow-xl direction-ltr text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="text-lg font-bold mb-4">{lang === 'ar' ? 'تغيير الأسعار المحددة' : 'Change Selected Prices'}</div>
            
            <div className="field mb-4">
              <label>{lang === 'ar' ? 'النوع' : 'Type'}</label>
              <select className="inp" value={bulkPriceChange.type} onChange={e => setBulkPriceChange({ ...bulkPriceChange, type: e.target.value as any })}>
                <option value="fixed">{lang === 'ar' ? 'سعر ثابت' : 'Fixed Price'}</option>
                <option value="increase">{lang === 'ar' ? 'زيادة بالمبلغ' : 'Increase Amount'}</option>
                <option value="decrease">{lang === 'ar' ? 'تخفيض بالمبلغ' : 'Decrease Amount'}</option>
              </select>
            </div>

            <div className="field mb-6">
              <label>{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
              <input type="number" className="inp" value={bulkPriceChange.amount} onChange={e => setBulkPriceChange({ ...bulkPriceChange, amount: e.target.value })} />
            </div>

            <div className="flex gap-2">
              <button className="btn btn-neon flex-1" onClick={handleBulkPriceSubmit}>{lang === 'ar' ? 'تطبيق' : 'Apply'}</button>
              <button className="btn btn-ghost flex-1" onClick={() => setShowBulkPriceModal(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="products-layout">
        <div className="products-grid">
          {sortedProducts.length === 0 ? (
            <div className="empty-state col-span-full flex flex-col items-center justify-center py-20 text-[color:var(--text-muted)] gap-4">
              <PackageOpen className="w-16 h-16 opacity-10" />
              <div className="text-lg">{searchQuery ? t('prods_empty') : t('prods_empty')}</div>
            </div>
          ) : (
            <>
              {sortedProducts.length > 0 && (
                <div className="col-span-full flex items-center p-2 mb-2 bg-[color:var(--surface)] shrink-0 rounded-lg border border-[color:var(--glass-border)]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer accent-[color:var(--neon)] mx-2"
                    checked={selectedIds.length === sortedProducts.length && sortedProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm cursor-pointer select-none" onClick={toggleSelectAll}>
                    {lang === 'ar' ? 'تحديد الكل' : 'Select All'}
                  </span>
                </div>
              )}
              {sortedProducts.map((p: any) => (
                <div className="prod-card glass relative" key={p.id}>
                  <div className="absolute top-4 left-4 z-10 w-fit">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer accent-[color:var(--neon)] bg-[color:var(--bg-card)] border-gray-600 rounded"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleBulkSelect(p.id)}
                    />
                  </div>
                  <div className="prod-top ml-8 rtl:ml-0 rtl:mr-8">
                    <div className="prod-name">{p.name}</div>
                  <span className={`prod-status ${p.is_active ? 'active' : 'inactive'}`}>
                    {p.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'مخفي' : 'Hidden')}
                  </span>
                </div>
                <div className="prod-price">
                  {formatCurrency(Number(p.price), p.currency)}
                </div>
                <div className="prod-qty">📦 {p.quantity != null ? `${p.quantity} ${lang === 'ar' ? 'متاح' : 'available'}` : (lang === 'ar' ? 'غير محدود' : 'unlimited')}</div>
                <div className="prod-desc">
                  {parseProductData(p.description).desc ? (
                    <div className="markdown-body text-sm space-y-1">
                      <Markdown>{parseProductData(p.description).desc}</Markdown>
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
                {parseProductData(p.description).variants.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {parseProductData(p.description).variants.map((v: any, i: number) => (
                      <div key={i} className="text-xs bg-[color:var(--surface)] border border-[color:var(--glass-border)] rounded px-2 py-1 flex items-center gap-2">
                        {v.image && <img src={v.image} alt="variant" className="w-5 h-5 rounded object-cover" />}
                        <span className="font-medium text-[color:var(--text)]">{v.name}</span>
                        <span className="text-[color:var(--neon)] font-mono">{formatCurrency(Number(v.price || 0), p.currency)}</span>
                        {v.qty !== '' && <span className="text-[color:var(--text-muted)] text-[10px]">({v.qty})</span>}
                      </div>
                    ))}
                  </div>
                )}
                {parseProductData(p.description).customAttr.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2 mt-2">
                    {parseProductData(p.description).customAttr.map((attr: any, i: number) => (
                      <div key={i} className="text-xs bg-[color:var(--surface)] border border-[color:var(--glass-border)] rounded px-2 py-1 flex items-center gap-1">
                        <span className="font-medium text-[color:var(--text-muted)]">{attr.k}:</span>
                        <span className="text-[color:var(--text)]">{attr.v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="prod-actions flex flex-wrap">
                  {deleteConfirmId === p.id ? (
                    <div className="flex flex-col gap-2 w-full mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-sm text-red-400 mb-1">{t('confirm_delete')}</div>
                      <div className="flex gap-2">
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>{lang === 'ar' ? 'تأكيد الحذف' : 'Yes, Delete'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => { 
                        setEditingId(p.id); 
                        const pd = parseProductData(p.description);
                        setForm({ name: p.name, price: String(p.price), currency: p.currency, qty: p.quantity != null ? String(p.quantity) : '', desc: pd.desc, variants: pd.variants, customAttr: pd.customAttr }); 
                      }}>
                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleProduct(p.id, !p.is_active)}>
                        {p.is_active ? (lang === 'ar' ? 'إخفاء' : 'Hide') : (lang === 'ar' ? 'إظهار' : 'Show')}
                      </button>
                      <button className="btn btn-ghost btn-sm text-red-400 hover:text-red-300" onClick={() => setDeleteConfirmId(p.id)}>{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        </div>

        <div className="form-panel glass2">
          <div className="form-title">{editingId ? t('edit_prod') : t('add_prod')}</div>
          <div className="field">
            <label>{t('prod_name_lbl')}</label>
            <input className={`inp ${errors.name ? 'border-red-500' : ''}`} type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Advanced English Course" />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
          </div>
          <div className="field">
            <label>{t('prod_price_lbl')}</label>
            <div className="form-row-2">
              <input className={`inp ${errors.price ? 'border-red-500' : ''}`} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" min="0" />
              <select className="inp" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
          </div>
          <div className="field">
            <label>{t('prod_qty_lbl')}</label>
            <input className={`inp ${errors.qty ? 'border-red-500' : ''}`} type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="0 = unlimited" min="0" />
            {errors.qty && <div className="text-red-500 text-xs mt-1">{errors.qty}</div>}
          </div>
          <div className="field">
            <label>{t('prod_desc_lbl')}</label>
            <div className="flex flex-wrap gap-1 mb-2">
              <button 
                type="button" 
                onClick={() => applyFormatting('**', '**')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => applyFormatting('*', '*')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => applyFormatting('\n# ', '\n')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="Heading 1"
              >
                <Heading1 size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => applyFormatting('\n## ', '\n')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="Heading 2"
              >
                <Heading2 size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => applyFormatting('\n> ', '\n')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="Blockquote"
              >
                <Quote size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => applyFormatting('\n- ', '\n')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="List"
              >
                <List size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => applyFormatting('\n```\n', '\n```\n')} 
                className="p-1 px-2 text-sm text-[color:var(--text)] hover:text-[color:var(--text)] rounded border border-[color:var(--glass-border)] hover:border-[color:var(--glass-border-h)] bg-[color:var(--glass-bg)] flex items-center justify-center transition-colors"
                title="Code Block"
              >
                <Code size={16} />
              </button>
            </div>
            <textarea ref={descRef} className="inp" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="What's included, etc." />
          </div>

          <div className="field mt-4 border-t border-[color:var(--glass-border)] pt-4">
            <label className="flex justify-between items-center mb-2">
              <span>{lang === 'ar' ? 'الأنواع (Variants)' : 'Variants'}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({...form, variants: [...form.variants, { name: '', price: form.price, qty: '', image: '' }]})}>
                + {lang === 'ar' ? 'إضافة نوع' : 'Add'}
              </button>
            </label>
            {form.variants.length > 0 && (
              <div className="overflow-x-auto border border-[color:var(--glass-border)] rounded-md mb-2 bg-[color:var(--surface)]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[color:var(--glass-border)] bg-[color:var(--bg)] text-[color:var(--text-muted)] text-xs">
                    <tr>
                      <th className="p-2 font-medium w-12 text-center">#</th>
                      <th className="p-2 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th className="p-2 font-medium">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="p-2 font-medium">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                      <th className="p-2 font-medium">{lang === 'ar' ? 'صورة' : 'Image'}</th>
                      <th className="p-2 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v, i) => {
                      const verr = errors.variants && errors.variants[i] ? errors.variants[i] : {};
                      return (
                        <tr key={i} className="border-b border-[color:var(--glass-border)] last:border-0 hover:bg-[color:var(--bg-hover)] items-start">
                          <td className="p-2 align-top text-[color:var(--text-muted)] text-xs pt-4 text-center">{i + 1}</td>
                          <td className="p-2 align-top min-w-[120px]">
                            <input className={`inp text-sm p-2 w-full ${verr.name ? 'border-red-500' : ''}`} placeholder={lang === 'ar' ? 'اسم النوع' : 'Variant name'} value={v.name} onChange={e => { const nv = [...form.variants]; nv[i].name = e.target.value; setForm({...form, variants: nv}); }} />
                            {verr.name && <div className="text-red-500 text-[10px] mt-1">{verr.name}</div>}
                          </td>
                          <td className="p-2 align-top w-28">
                            <input className={`inp text-sm p-2 w-full ${verr.price ? 'border-red-500' : ''}`} type="number" placeholder="0" value={v.price} onChange={e => { const nv = [...form.variants]; nv[i].price = e.target.value; setForm({...form, variants: nv}); }} />
                            {verr.price && <div className="text-red-500 text-[10px] mt-1">{verr.price}</div>}
                          </td>
                          <td className="p-2 align-top w-24">
                            <input className={`inp text-sm p-2 w-full ${verr.qty ? 'border-red-500' : ''}`} type="number" placeholder="∞" value={v.qty} onChange={e => { const nv = [...form.variants]; nv[i].qty = e.target.value; setForm({...form, variants: nv}); }} />
                            {verr.qty && <div className="text-red-500 text-[10px] mt-1">{verr.qty}</div>}
                          </td>
                          <td className="p-2 align-top min-w-[120px]">
                            <div className="flex items-center gap-2">
                              {v.image && (
                                <img src={v.image} alt="" className="w-8 h-8 rounded object-cover border border-[color:var(--glass-border)] flex-shrink-0" />
                              )}
                              <input className="inp text-sm p-2 w-full" placeholder={lang === 'ar' ? 'رابط' : 'URL'} value={v.image || ''} onChange={e => { const nv = [...form.variants]; nv[i].image = e.target.value; setForm({...form, variants: nv}); }} />
                            </div>
                          </td>
                          <td className="p-2 align-top pt-3">
                            <button type="button" className="text-red-400 hover:text-red-300 p-1" onClick={() => setForm({...form, variants: form.variants.filter((_, idx) => idx !== i)})}>
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="field mt-4 border-t border-[color:var(--glass-border)] pt-4">
            <label className="flex justify-between items-center mb-2">
              <span>{lang === 'ar' ? 'أعمدة إضافية' : 'Custom Attributes'}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({...form, customAttr: [...form.customAttr, { k: '', v: '' }]})}>
                + {lang === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </label>
            {form.customAttr.map((attr, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input className="inp text-sm w-1/3" placeholder={lang === 'ar' ? 'الاسم (العمود)' : 'Key (Column)'} value={attr.k} onChange={e => { const nca = [...form.customAttr]; nca[i].k = e.target.value; setForm({...form, customAttr: nca}); }} />
                <input className="inp text-sm flex-1" placeholder={lang === 'ar' ? 'القيمة' : 'Value'} value={attr.v} onChange={e => { const nca = [...form.customAttr]; nca[i].v = e.target.value; setForm({...form, customAttr: nca}); }} />
                <button type="button" className="text-red-400 hover:text-red-300 ml-1" onClick={() => setForm({...form, customAttr: form.customAttr.filter((_, idx) => idx !== i)})}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2 border-t border-[color:var(--glass-border)] pt-4">
            <button className="btn btn-neon flex-1" onClick={submitProduct}>{editingId ? t('update_prod') : t('save_prod')}</button>
            {editingId && <button className="btn btn-ghost" onClick={cancelEdit}>{t('cancel')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Calculator Panel (Currency Converter) ---
function CalculatorPanel({ t }: any) {
  const [amountStr, setAmount] = useState('1');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('IQD');

  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    SAR: 3.75,
    IQD: 1500,
  };

  const amount = parseFloat(amountStr) || 0;
  
  let result = 0;
  if (rates[fromCurr] && rates[toCurr]) {
    const amountInUSD = amount / rates[fromCurr];
    result = amountInUSD * rates[toCurr];
  }

  const fmt = (n: number, c: string) => `${c} ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const currencies = Object.keys(rates);

  return (
    <div className="panel active">
      <div className="mb-5">
        <div className="page-title">{t('converter_title')}</div>
        <div className="page-sub">{t('converter_sub')}</div>
      </div>
      <div className="calc-layout flex flex-col lg:flex-row gap-6">
        <div className="calc-card glass2 w-full max-w-[480px]">
          <div className="calc-title">{t('converter_title')}</div>
          
          <div className="field">
            <label>{t('conv_amount')}</label>
            <input className="inp" type="number" value={amountStr} onChange={e => setAmount(e.target.value)} placeholder="0" min="0" />
          </div>

          <div className="flex gap-4">
            <div className="field flex-1">
              <label>{t('conv_from')}</label>
              <select className="inp" value={fromCurr} onChange={e => setFromCurr(e.target.value)}>
                {currencies.map(c => <option key={`from-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field flex-1">
              <label>{t('conv_to')}</label>
              <select className="inp" value={toCurr} onChange={e => setToCurr(e.target.value)}>
                {currencies.map(c => <option key={`to-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="calc-result mt-6">
            <div className="calc-result-title">{t('conv_result')}</div>
            <div className="calc-result-row total">
              <span className="r-label">{amountStr || 0} {fromCurr} =</span>
              <span className="r-value">{fmt(result, toCurr)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Orders Panel ---
function OrdersPanel({ t, client, lang }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    const loadOrders = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('instagram_id', client.instagram_page_id)
        .order('created_at', { ascending: false });
      
      if (error) toast.error(error.message);
      else setOrders(data || []);
      setLoading(false);
    };
    loadOrders();
  }, [client]);

  const updateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : (currentStatus === 'pending' ? 'cancelled' : 'paid');
    const { error } = await supabase.from('leads').update({ payment_status: nextStatus }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      setOrders(orders.map(o => o.id === id ? { ...o, payment_status: nextStatus } : o));
      toast.success(t('update_status'));
    }
  };

  const df = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-IQ' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="panel active">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="page-title">{t('orders_title')}</div>
          <div className="page-sub">{t('orders_sub')}</div>
        </div>
      </div>
      <div className="glass2 p-6">
        {loading ? (
          <div className="text-center py-10 text-[color:var(--text-muted)]">{t('loading')}</div>
        ) : orders.length === 0 ? (
          <div className="empty-state flex flex-col items-center justify-center py-20 text-[color:var(--text-muted)] gap-4">
            <Inbox className="w-16 h-16 opacity-10" />
            <div className="text-lg">{t('orders_empty')}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px] text-[color:var(--text)]">
              <thead>
                <tr className="border-b border-[color:var(--glass-border)] text-[color:var(--text-muted)] text-sm label-rtl">
                  <th className="pb-3 pr-4 font-semibold text-start">{lang === 'ar' ? 'معرف الطلب' : 'Order ID'}</th>
                  <th className="pb-3 px-4 font-semibold text-start">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="pb-3 px-4 font-semibold text-start">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="pb-3 px-4 font-semibold text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="pb-3 pl-4 font-semibold text-end">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-[color:var(--glass-border)] last:border-0 hover:bg-[color:var(--bg-hover)] transition-colors label-rtl">
                    <td className="py-4 pr-4 text-xs font-mono text-[color:var(--text-dim)] text-start">{o.id?.slice(0,8)}</td>
                    <td className="py-4 px-4 text-sm whitespace-nowrap text-start">{df.format(new Date(o.created_at))}</td>
                    <td className="py-4 px-4 text-sm font-medium text-start">{formatCurrency(o.amount || 0, o.currency || 'IQD')}</td>
                    <td className="py-4 px-4 text-start">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        o.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        o.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {o.payment_status === 'paid' ? t('status_paid') : o.payment_status === 'pending' ? t('status_pending') : t('status_cancelled')}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-end">
                      <button className="btn btn-ghost btn-sm text-xs" onClick={() => updateStatus(o.id, o.payment_status)}>
                        {t('update_status')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
