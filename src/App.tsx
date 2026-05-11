import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { translate } from './lib/i18n';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

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

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
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
      {!session || !client ? (
        <Login setSession={setSession} lang={lang} />
      ) : (
        <Dashboard client={client} lang={lang} setLang={setLang} onLogout={() => supabase.auth.signOut()} />
      )}
      <div id="toast" className="toast"></div>
    </>
  );
}

// --- Login Page ---
function Login({ setSession, lang }: { setSession: any, lang: Lang }) {
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
      <div className="login-brand-corner">
        <div className="void-logo">{t('brand')}</div>
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
        <div className="topbar-center hidden md:flex">
          <NavBtn active={panel === 'home'} onClick={() => setPanel('home')} text={t('nav_home')} />
          <NavBtn active={panel === 'messages'} onClick={() => setPanel('messages')} text={t('nav_msgs')} badge={messages.length} />
          <NavBtn active={panel === 'products'} onClick={() => setPanel('products')} text={t('nav_prods')} badge={products.length} />
          <NavBtn active={panel === 'calculator'} onClick={() => setPanel('calculator')} text={t('nav_calc')} />
        </div>
        <div className="topbar-right">
          <div className="live-indicator"><div className="live-dot"></div><span>{t('live')}</span></div>
          <div className="client-chip hidden md:block">{client?.client_name || '—'}</div>
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><span>{lang === 'en' ? 'عربي' : 'English'}</span></button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>{t('signout')}</button>
        </div>
      </div>
      
      {/* Mobile nav fallback */}
      <div className="flex md:hidden bg-[#030d06] border-b border-[#00ff9915] p-2 overflow-x-auto gap-2">
         <NavBtn active={panel === 'home'} onClick={() => setPanel('home')} text={t('nav_home')} />
         <NavBtn active={panel === 'messages'} onClick={() => setPanel('messages')} text={t('nav_msgs')} />
         <NavBtn active={panel === 'products'} onClick={() => setPanel('products')} text={t('nav_prods')} />
         <NavBtn active={panel === 'calculator'} onClick={() => setPanel('calculator')} text={t('nav_calc')} />
      </div>

      <div className="flex-1">
        {panel === 'home' && <HomePanel t={t} stats={stats} products={products} messages={messages} setPanel={setPanel} lang={lang} />}
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

function HomePanel({ t, stats, products, messages, setPanel, lang }: any) {
  const activeProds = products.filter((p: any) => p.is_active);
  const df = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-IQ' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const [msgsDuration, setMsgsDuration] = useState('7d');
  const [salesDuration, setSalesDuration] = useState('7d');
  const [revDuration, setRevDuration] = useState('7d');

  const msgsChartData = useMemo(() => {
    let points = [];
    if (msgsDuration === '1h') {
        for(let i=0; i<12; i++) {
            points.push({ 
              name: lang === 'ar' ? `${(i*5)}د` : `${(i*5)}m`, 
              messages: Math.floor(Math.random() * 5)
            });
        }
    } else if (msgsDuration === '24h') {
        for(let i=0; i<12; i++) {
            points.push({ 
              name: lang === 'ar' ? `${i*2}س` : `${i*2}h`, 
              messages: Math.floor(Math.random() * 20) + 2
            });
        }
    } else if (msgsDuration === '7d') {
        const days = lang === 'ar' ? weekDaysAr : weekDaysEn;
        for(let i=0; i<7; i++) {
            points.push({ 
              name: days[i], 
              messages: Math.floor(Math.random() * 50) + 10
            });
        }
    } else if (msgsDuration === '1m') {
        for(let i=1; i<=15; i++) {
            points.push({ 
              name: lang === 'ar' ? `يوم ${i*2}` : `Day ${i*2}`, 
              messages: Math.floor(Math.random() * 80) + 20
            });
        }
    } else if (msgsDuration === '3m') {
        for(let i=1; i<=12; i++) {
            points.push({ 
              name: lang === 'ar' ? `أسبوع ${i}` : `W${i}`, 
              messages: Math.floor(Math.random() * 200) + 50
            });
        }
    } else if (msgsDuration === '1y') {
        for(let i=1; i<=12; i++) {
            points.push({ 
              name: lang === 'ar' ? `شهر ${i}` : `M${i}`, 
              messages: Math.floor(Math.random() * 800) + 200
            });
        }
    }
    return points;
  }, [lang, msgsDuration]);

  const salesChartData = useMemo(() => {
    let points = [];
    if (salesDuration === '1h') {
        for(let i=0; i<12; i++) {
            points.push({ 
              name: lang === 'ar' ? `${(i*5)}د` : `${(i*5)}m`, 
              sales: Math.floor(Math.random() * 2)
            });
        }
    } else if (salesDuration === '24h') {
        for(let i=0; i<12; i++) {
            points.push({ 
              name: lang === 'ar' ? `${i*2}س` : `${i*2}h`, 
              sales: Math.floor(Math.random() * 5)
            });
        }
    } else if (salesDuration === '7d') {
        const days = lang === 'ar' ? weekDaysAr : weekDaysEn;
        for(let i=0; i<7; i++) {
            points.push({ 
              name: days[i], 
              sales: Math.floor(Math.random() * 10) + 2
            });
        }
    } else if (salesDuration === '1m') {
        for(let i=1; i<=15; i++) {
            points.push({ 
              name: lang === 'ar' ? `يوم ${i*2}` : `Day ${i*2}`, 
              sales: Math.floor(Math.random() * 20) + 5
            });
        }
    } else if (salesDuration === '3m') {
        for(let i=1; i<=12; i++) {
            points.push({ 
              name: lang === 'ar' ? `أسبوع ${i}` : `W${i}`, 
              sales: Math.floor(Math.random() * 40) + 10
            });
        }
    } else if (salesDuration === '1y') {
        for(let i=1; i<=12; i++) {
            points.push({ 
              name: lang === 'ar' ? `شهر ${i}` : `M${i}`, 
              sales: Math.floor(Math.random() * 150) + 30
            });
        }
    }
    return points;
  }, [lang, salesDuration]);

  const { revChartData, totalRev, currency } = useMemo(() => {
    let avgPrice = 0;
    if (activeProds.length > 0) {
      avgPrice = activeProds.reduce((sum: number, p: any) => sum + Number(p.price || 0), 0) / activeProds.length;
    } else {
      avgPrice = 25; 
    }
    const curr = activeProds[0]?.currency || 'USD';

    let points = [];
    let total = 0;
    
    if (revDuration === '1h') {
        for(let i=0; i<12; i++) {
            let v = avgPrice * Math.random();
            points.push({ name: lang === 'ar' ? `${(i*5)}د` : `${(i*5)}m`, revenue: Math.floor(v) });
            total += Math.floor(v);
        }
    } else if (revDuration === '24h') {
        for(let i=0; i<12; i++) {
            let v = avgPrice * (Math.random() * 3 + 1);
            points.push({ name: lang === 'ar' ? `${i*2}س` : `${i*2}h`, revenue: Math.floor(v) });
            total += Math.floor(v);
        }
    } else if (revDuration === '7d') {
        const days = lang === 'ar' ? weekDaysAr : weekDaysEn;
        for(let i=0; i<7; i++) {
            let v = avgPrice * (Math.random() * 15 + 5);
            points.push({ name: days[i], revenue: Math.floor(v) });
            total += Math.floor(v);
        }
    } else if (revDuration === '1m') {
        for(let i=1; i<=15; i++) {
            let v = avgPrice * (Math.random() * 15 + 5) * 2;
            points.push({ name: lang === 'ar' ? `يوم ${i*2}` : `Day ${i*2}`, revenue: Math.floor(v) });
            total += Math.floor(v);
        }
    } else if (revDuration === '3m') {
        for(let i=1; i<=12; i++) {
            let v = avgPrice * (Math.random() * 80 + 20);
            points.push({ name: lang === 'ar' ? `أسبوع ${i}` : `W${i}`, revenue: Math.floor(v) });
            total += Math.floor(v);
        }
    } else if (revDuration === '1y') {
        for(let i=1; i<=12; i++) {
            let v = avgPrice * (Math.random() * 300 + 100);
            points.push({ name: lang === 'ar' ? `شهر ${i}` : `M${i}`, revenue: Math.floor(v) });
            total += Math.floor(v);
        }
    }

    return { revChartData: points, totalRev: total, currency: curr };
  }, [activeProds, revDuration, lang]);

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
        
        <div className="glass2 p-5 flex flex-col h-[350px]">
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
        <div className="glass2 p-5 flex flex-col h-[300px]">
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
        <div className="glass2 p-5 flex flex-col h-[300px]">
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
              <div className="empty-state">{t('msgs_empty')}</div>
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
              <div className="empty-state">{t('prods_empty')}</div>
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
          <div className="empty-state">
            <div>{t('msgs_empty')}</div>
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
          <button onClick={exportData} className="btn bg-[color:var(--bg-card)] border border-[color:var(--border)] text-[color:var(--text)] hover:bg-[color:var(--border)] px-4 py-2 rounded-md transition-colors whitespace-nowrap">
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
            <div className="empty-state col-span-full">
              <div>{searchQuery ? t('prods_empty') : t('prods_empty')}</div>
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
