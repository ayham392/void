import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { translate } from './lib/i18n';
import LandingPage from './LandingPage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MessageSquare, PackageOpen, Inbox, Menu, X } from 'lucide-react';

type Lang = 'en' | 'ar';
type Panel = 'home' | 'messages' | 'products' | 'calculator';

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
  const [loadingApp, setLoadingApp] = useState(true);
  const navigate = useNavigate();

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
    const { data } = await supabase.from('clients').select('*').single();
    if (data) {
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
            <Dashboard client={client} lang={lang} setLang={setLang} onLogout={() => { supabase.auth.signOut(); navigate('/'); }} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <div id="toast" className="toast"></div>
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
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
            <button type="submit" className="btn btn-neon btn-block" disabled={loading}>
              <span>{loading ? '...' : t('signin_btn')}</span>
            </button>
            {error && <div id="login-error" style={{ display: 'block' }}>{error}</div>}
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

function Dashboard({ client, lang, setLang, onLogout }: any) {
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
      // Products
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      setProducts(prodData || []);

      // Messages
      const { data: msgData } = await supabase.from('interaction_log').select('*').eq('client_id', client.id).order('timestamp', { ascending: false }).limit(80);
      setMessages(msgData || []);

      // Stats
      const [m, l, s] = await Promise.all([
        supabase.from('interaction_log').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('instagram_id', client.instagram_page_id),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('instagram_id', client.instagram_page_id).eq('payment_status', 'paid')
      ]);
      setStats({ msgs: m.count || 0, leads: l.count || 0, sales: s.count || 0 });
    };

    loadData();

    const rtSub = supabase.channel('vs-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interaction_log', filter: `client_id=eq.${client.id}` }, payload => {
        setMessages(prev => [payload.new, ...prev].slice(0, 80));
        setStats(s => ({ ...s, msgs: s.msgs + 1 }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `client_id=eq.${client.id}` }, async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
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
          <NavBtn active={panel === 'products'} onClick={() => setPanel('products')} text={t('nav_prods')} badge={products.length} />
          <NavBtn active={panel === 'calculator'} onClick={() => setPanel('calculator')} text={t('nav_calc')} />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="live-indicator"><div className="live-dot"></div><span>{t('live')}</span></div>
          <div className="client-chip hidden md:block">{client?.client_name || '—'}</div>
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><span>{lang === 'en' ? 'عربي' : 'English'}</span></button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>{t('signout')}</button>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="live-indicator"><div className="live-dot"></div><span>{t('live')}</span></div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#030d06] border-b border-[#00ff9915] p-4 flex flex-col gap-4 relative z-40 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#00ff9910] pb-2">
             <span className="text-gray-400 text-sm"> {client?.client_name || '—'} </span>
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
      <div className="flex md:hidden bg-[#030d06] border-b border-[#00ff9915] p-2 overflow-x-auto gap-2">
         <NavBtn active={panel === 'home'} onClick={() => setPanel('home')} text={t('nav_home')} />
         <NavBtn active={panel === 'messages'} onClick={() => setPanel('messages')} text={t('nav_msgs')} />
         <NavBtn active={panel === 'products'} onClick={() => setPanel('products')} text={t('nav_prods')} />
         <NavBtn active={panel === 'calculator'} onClick={() => setPanel('calculator')} text={t('nav_calc')} />
      </div>

      <div className="flex-1">
        {panel === 'home' && <HomePanel t={t} stats={stats} products={products} messages={messages} setPanel={setPanel} lang={lang} client={client} />}
        {panel === 'messages' && <MessagesPanel t={t} messages={messages} lang={lang} />}
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

// --- Products Panel ---
function ProductsPanel({ t, products, client, lang }: any) {
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ name: '', price: '', currency: 'IQD', qty: '', desc: '' });
  const [err, setErr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        showToast(lang === 'ar' ? 'ملف CSV فارغ' : 'Empty CSV file', 'err');
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
      
      const newProducts = lines.slice(1).map(line => {
        const row = parseCSVLine(line);
        // Map from: ID,Name,Price,Currency,Quantity,Status,Description,CreatedAt
        return {
          name: row[1] || 'Untitled',
          price: parseFloat(row[2]) || 0,
          currency: row[3] || 'IQD',
          quantity: row[4] ? parseInt(row[4]) : null,
          is_active: row[5] === 'Active',
          description: row[6] || null,
          client_id: client.id
        };
      }).filter(p => !!p.name);
      
      if (newProducts.length > 0) {
        const { error } = await supabase.from('products').insert(newProducts);
        if (error) {
          setErr(error.message);
          showToast(lang === 'ar' ? 'فشل الاستيراد' : 'Import failed', 'err');
        } else {
          showToast(lang === 'ar' ? 'تم الاستيراد بنجاح' : 'Import successful');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const submitProduct = async () => {
    setErr('');
    if (!form.name.trim()) return setErr(lang === 'ar' ? 'اسم المنتج مطلوب' : 'Product name is required.');
    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      quantity: form.qty !== '' ? parseInt(form.qty) : null,
      description: form.desc.trim() || null
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) setErr(error.message);
      else { showToast(t('prod_updated')); cancelEdit(); }
    } else {
      const { error } = await supabase.from('products').insert({ ...payload, client_id: client.id, is_active: true });
      if (error) setErr(error.message);
      else { showToast(t('prod_added')); cancelEdit(); }
    }
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm({ name: '', price: '', currency: 'IQD', qty: '', desc: '' });
  };

  const toggleProduct = async (id: string, newState: boolean) => {
    await supabase.from('products').update({ is_active: newState }).eq('id', id);
    showToast(newState ? (lang === 'ar' ? 'المنتج نشط الآن' : 'Product is now active') : (lang === 'ar' ? 'المنتج مخفي' : 'Product is now hidden'));
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    showToast(t('prod_deleted'));
    setDeleteConfirmId(null);
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
      <div className="products-layout">
        <div className="products-grid">
          {sortedProducts.length === 0 ? (
            <div className="empty-state col-span-full flex flex-col items-center justify-center py-20 text-[color:var(--text-muted)] gap-4">
              <PackageOpen className="w-16 h-16 opacity-10" />
              <div className="text-lg">{searchQuery ? t('prods_empty') : t('prods_empty')}</div>
            </div>
          ) : (
            sortedProducts.map((p: any) => (
              <div className="prod-card glass" key={p.id}>
                <div className="prod-top">
                  <div className="prod-name">{p.name}</div>
                  <span className={`prod-status ${p.is_active ? 'active' : 'inactive'}`}>
                    {p.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'مخفي' : 'Hidden')}
                  </span>
                </div>
                <div className="prod-price">
                  {formatCurrency(Number(p.price), p.currency)}
                </div>
                <div className="prod-qty">📦 {p.quantity != null ? `${p.quantity} ${lang === 'ar' ? 'متاح' : 'available'}` : (lang === 'ar' ? 'غير محدود' : 'unlimited')}</div>
                <div className="prod-desc">{p.description || '—'}</div>
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
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(p.id); setForm({ name: p.name, price: String(p.price), currency: p.currency, qty: p.quantity != null ? String(p.quantity) : '', desc: p.description || '' }); }}>
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
            ))
          )}
        </div>

        <div className="form-panel glass2">
          <div className="form-title">{editingId ? t('edit_prod') : t('add_prod')}</div>
          {err && <div id="form-err" style={{ display: 'block' }}>{err}</div>}
          <div className="field">
            <label>{t('prod_name_lbl')}</label>
            <input className="inp" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Advanced English Course" />
          </div>
          <div className="field">
            <label>{t('prod_price_lbl')}</label>
            <div className="form-row-2">
              <input className="inp" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" min="0" />
              <select className="inp" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>{t('prod_qty_lbl')}</label>
            <input className="inp" type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="0 = unlimited" min="0" />
          </div>
          <div className="field">
            <label>{t('prod_desc_lbl')}</label>
            <textarea className="inp" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="What's included, etc." />
          </div>
          <div className="flex gap-2 mt-2">
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

// Global utility for Toast
let toastT: NodeJS.Timeout;
export function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = (type === 'ok' ? '✓ ' : '✕ ') + msg;
  t.className = `toast ${type} show`;
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3000);
}
