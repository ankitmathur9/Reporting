import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
  ShieldAlert, TrendingUp, Users, DollarSign, Activity, 
  CheckCircle, LogOut, LayoutDashboard, PlusCircle, 
  ArrowUpRight, ArrowDownRight, Search, 
  ChevronRight, Bell, Star, AlertTriangle, 
  FileText, Menu, X, Lock, Mail, Key, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';

// --- 1. DESIGN SYSTEM UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(' ');

const THEME = {
  colors: {
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    bg: 'bg-slate-50',
    surface: 'bg-white',
    border: 'border-slate-200',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
  },
  shadows: {
    card: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
    float: 'shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
  }
};

// --- 2. AUTHENTICATION CONFIGURATION ---
const AUTHORIZED_USERS = {
  'amathur@paramantra.com': { name: 'Ankit Mathur', role: 'Sr. Director Strategy', initials: 'AM' },
  'tj@paramantra.com': { name: 'TJ', role: 'CEO', initials: 'TJ' },
  'ikram.a@paramantra.com': { name: 'Ikram A.', role: 'Team Manager', initials: 'IA' },
  'mohammed.m@paramantra.com': { name: 'Mohammed M.', role: 'Team Manager', initials: 'MM' },
  'dilip.s@paramantra.com': { name: 'Dilip S.', role: 'Sr. Director', initials: 'DS' },
  'shilpith@paramantra.com': { name: 'Shilpith', role: 'Sr. Director', initials: 'SH' },
};

const SESSION_KEY = 'paramantra_session_v1';

// --- 3. MOCK DATA & SIMULATION ENGINE ---
const MOCK_DATA = {
  kpi: {
    forecast: { value: 5700000, weighted: 1250000, trend: 12.5 },
    demos: { value: 12, target: 50, trend: -33 },
    meetings: { value: 85, rate: 4.2, trend: 0.5 },
    risks: { count: 3, critical: 1 }
  },
  chartData: {
    velocity: [
      { name: 'Mon', value: 4200, leads: 45 },
      { name: 'Tue', value: 3800, leads: 32 },
      { name: 'Wed', value: 5100, leads: 55 },
      { name: 'Thu', value: 4900, leads: 48 },
      { name: 'Fri', value: 6200, leads: 65 },
      { name: 'Sat', value: 3500, leads: 20 },
      { name: 'Sun', value: 2100, leads: 12 },
    ],
    industry: [
      { name: 'Real Estate', value: 72 },
      { name: 'Non-RE', value: 20 },
      { name: 'Other', value: 8 },
    ]
  },
  alerts: [
    { id: 1, title: 'Compliance Breach', desc: '3 Leads with ≤ 3 calls today', severity: 'high', time: '2h ago' },
    { id: 2, title: 'Forecast Dip', desc: 'Dilip forecast dropped by 15%', severity: 'medium', time: '4h ago' },
    { id: 3, title: 'CRM Sync', desc: 'Inbound latency > 5 mins', severity: 'low', time: '1d ago' },
  ]
};

// --- 4. AUTH UTILITIES ---
const authUtils = {
  setSession: (email, rememberMe) => {
    const user = AUTHORIZED_USERS[email];
    if (!user) return null;
    
    const now = new Date();
    // 7 days if remember me, else 24 hours
    const expiry = new Date(now.getTime() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    
    const sessionData = {
      user: { ...user, email },
      expiresAt: expiry.toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData.user;
  },
  
  getSession: () => {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;
      
      const session = JSON.parse(sessionStr);
      const now = new Date();
      const expiry = new Date(session.expiresAt);
      
      if (now > expiry) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      
      return session.user;
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};

// --- 5. MAIN APP SHELL ---
export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);

  // Initialize App & Auth
  useEffect(() => {
    // Check for existing valid session
    const existingUser = authUtils.getSession();
    if (existingUser) {
      setUser(existingUser);
    }
    
    // Simulate boot sequence
    const timer = setTimeout(() => setAppLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Toast Handler
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.name.split(' ')[0]}`);
  };

  const handleLogout = () => {
    authUtils.clearSession();
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  if (appLoading) return <BootLoader />;

  // RENDER LOGIN SCREEN IF NO USER
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // RENDER DASHBOARD
  return (
    <div className={`min-h-screen ${THEME.colors.bg} font-sans flex text-slate-800`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
             {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-400" /> : <Activity size={18} className="text-blue-400" />}
             <span className="font-medium text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed h-full z-30 bg-white border-r border-slate-200 transition-all duration-300 ease-out flex flex-col`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Activity className="text-white" size={18} />
            </div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-900">Nexus</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Executive Dashboard" 
            active={activeTab === 'dashboard'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<PlusCircle size={20} />} 
            label="Daily Reporting" 
            active={activeTab === 'entry'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveTab('entry')} 
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Forecast Analysis" 
            active={activeTab === 'forecast'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveTab('forecast')} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Archives" 
            active={activeTab === 'archives'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveTab('archives')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Strategic Command Center' : 'Daily Reporting Protocol'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
              <Search size={14} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Search deals, reps..." className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
               <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
               </button>
               <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                   {user.initials}
                 </div>
                 <div className="hidden md:block">
                   <p className="text-sm font-bold text-slate-700 leading-none">{user.name}</p>
                   <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{user.role}</p>
                 </div>
               </div>
            </div>
          </div>
        </header>

        {/* VIEWPORT */}
        <main className="p-6 lg:p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? <ExecutiveDashboard /> : <ReportingWizard showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

// --- 6. LOGIN COMPONENT ---
const LoginScreen = ({ onLogin }) => {
  const [step, setStep] = useState('EMAIL'); // EMAIL | OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Focus simulation
  const inputRef = React.useRef(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    if (AUTHORIZED_USERS[email]) {
      setStep('OTP');
      setIsLoading(false);
    } else {
      setError('Access Denied: This email is not authorized for Paramantra Nexus.');
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate OTP validation (Any 4-6 digit code works for demo)
    await new Promise(r => setTimeout(r, 1000));

    if (otp.length >= 4) {
      // Success
      const userData = authUtils.setSession(email, rememberMe);
      onLogin(userData);
    } else {
      setError('Invalid OTP code. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('EMAIL');
    setError('');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-transparent opacity-50"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 z-10 overflow-hidden relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden">
            <div className="h-full bg-indigo-600 animate-progress"></div>
          </div>
        )}

        <div className="p-8 pb-6 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 transform rotate-3">
            <Activity className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Paramantra Nexus</h2>
          <p className="text-sm text-slate-500 mt-2">Enterprise Intelligence Portal</p>
        </div>

        <div className="px-8 pb-8">
          {step === 'EMAIL' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in slide-in-from-right-8 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    ref={inputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="name@paramantra.com"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-slate-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Verify Identity <ArrowRight size={18} /></>}
              </button>
              
              <div className="flex items-center gap-2 pt-2">
                 <input 
                   type="checkbox" 
                   id="remember" 
                   checked={rememberMe}
                   onChange={(e) => setRememberMe(e.target.checked)}
                   className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                 />
                 <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer select-none">Remember this device</label>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center">
                 <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-4">
                    <span className="text-xs font-medium text-indigo-700">{email}</span>
                    <button type="button" onClick={handleBack} className="bg-white p-0.5 rounded-full hover:bg-indigo-200 transition-colors">
                       <X size={10} className="text-indigo-700" />
                    </button>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Enter Security Code</h3>
                 <p className="text-xs text-slate-500 mt-1">We've sent a 6-digit code to your email.</p>
              </div>

              <div>
                <div className="relative group">
                  <Key className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    ref={inputRef}
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-bold tracking-widest text-center text-lg"
                    placeholder="0 0 0 0 0 0"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Authenticate <Lock size={16} /></>}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setOtp('');
                    showToast('New code sent to email', 'success');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw size={12} /> Resend Code
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Authorized Access Only. All activities are monitored.
            <br/>Paramantra Inc © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

// --- 7. EXECUTIVE DASHBOARD ---
const ExecutiveDashboard = () => (
  <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    {/* KPI Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard 
        title="Total Forecast Value" 
        value="₹57.0L" 
        trend="+12.5%" 
        sub="Weighted: ₹12.5L"
        icon={<DollarSign size={22} className="text-emerald-600" />}
        chartColor="#059669"
      />
      <KPICard 
        title="Net New Demos" 
        value="12" 
        trend="-33%" 
        isNegative
        sub="Target: 50 | Gap: 38"
        icon={<Users size={22} className="text-indigo-600" />}
        chartColor="#4f46e5"
      />
      <KPICard 
        title="Meeting Rate" 
        value="4.2%" 
        trend="+0.5%" 
        sub="85 Meetings (MTD)"
        icon={<TrendingUp size={22} className="text-blue-600" />}
        chartColor="#2563eb"
      />
      <KPICard 
        title="Critical Risks" 
        value="3" 
        trend="Action Req"
        isAlert
        sub="Leads ≤ 3 Calls"
        icon={<ShieldAlert size={22} className="text-red-600" />}
        chartColor="#dc2626"
      />
    </div>

    {/* Main Analysis Section */}
    <div className="grid grid-cols-12 gap-6 h-[450px]">
      
      {/* Primary Chart */}
      <div className={`col-span-12 lg:col-span-8 ${THEME.colors.surface} ${THEME.shadows.card} rounded-xl border border-slate-200 p-6 flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pipeline Velocity & Inbound Volume</h3>
            <p className="text-sm text-slate-500">Comparing lead generation vs forecast value (7 Days)</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">Daily</button>
            <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-200">Weekly</button>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DATA.chartData.velocity}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" hide />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fill="url(#colorForecast)" name="Forecast Value" />
              <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} name="Inbound Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Feed & Industry Split */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
        {/* Risk Feed */}
        <div className={`flex-1 ${THEME.colors.surface} ${THEME.shadows.card} rounded-xl border border-slate-200 p-0 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
               <AlertTriangle size={16} className="text-amber-500" /> Operational Risks
             </h4>
             <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">3 Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {MOCK_DATA.alerts.map(alert => (
               <div key={alert.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                 <div className="flex justify-between items-start mb-1">
                   <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                     alert.severity === 'high' ? 'bg-red-100 text-red-700' : 
                     alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                   }`}>
                     {alert.severity.toUpperCase()}
                   </span>
                   <span className="text-[10px] text-slate-400">{alert.time}</span>
                 </div>
                 <h5 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{alert.title}</h5>
                 <p className="text-xs text-slate-500 mt-1">{alert.desc}</p>
               </div>
             ))}
          </div>
        </div>
        
        {/* Industry Donut */}
        <div className={`h-48 ${THEME.colors.surface} ${THEME.shadows.card} rounded-xl border border-slate-200 p-4 flex items-center`}>
           <div className="w-1/2 h-full relative">
             <ResponsiveContainer>
               <PieChart>
                 <Pie 
                    data={MOCK_DATA.chartData.industry} 
                    innerRadius={40} 
                    outerRadius={55} 
                    paddingAngle={5} 
                    dataKey="value"
                    cornerRadius={4}
                  >
                    <Cell fill="#4f46e5" />
                    <Cell fill="#e2e8f0" />
                    <Cell fill="#94a3b8" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">72%</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">RE Sec</span>
             </div>
           </div>
           <div className="w-1/2 pl-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Industry Split</h4>
              <LegendItem color="bg-indigo-600" label="Real Estate" val="72%" />
              <LegendItem color="bg-slate-200" label="Non-RE" val="20%" />
              <LegendItem color="bg-slate-400" label="Others" val="8%" />
           </div>
        </div>
      </div>
    </div>
  </div>
);

// --- 8. REPORTING WIZARD (Write View) ---
const ReportingWizard = ({ showToast }) => {
  const [step, setStep] = useState(0);
  const steps = ["Demo Metrics", "Lead Funnel", "US / Global", "Forecast", "Active Deals", "Critical Alerts"];

  const handleNext = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));
  const handleSubmit = () => showToast("Report submitted successfully to Executive Dashboard");

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(i)}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                   i === step ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 
                   i < step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                 }`}>
                   {i < step ? <CheckCircle size={14} /> : i + 1}
                 </div>
                 <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${i === step ? 'text-indigo-600' : 'text-slate-400'}`}>{s}</span>
              </div>
            ))}
         </div>
      </div>

      {/* Main Form Container */}
      <div className={`bg-white border border-slate-200 rounded-xl shadow-sm min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500`}>
        
        <div className="flex-1 p-8">
          {/* STEP 1: DEMO METRICS */}
          {step === 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div>
                   <h3 className="text-xl font-bold text-slate-800">India Operations - Demo Metrics</h3>
                   <p className="text-sm text-slate-500">Track targets and qualitative feedback</p>
                 </div>
                 <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                   Target: 100/Month
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <RepDemoForm name="Dilip" />
                 <RepDemoForm name="Shilpith" />
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-3 gap-6">
                 <Input label="Carry Forward Deficit" placeholder="From yesterday" icon={<ArrowDownRight size={14}/>} />
                 <Input label="Net New (MTD)" placeholder="Auto-calc" disabled value="17" icon={<TrendingUp size={14}/>} />
                 <div className="flex flex-col justify-center">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2">Compliance</label>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                       <span className="text-sm text-slate-700">All demo notes logged in CRM</span>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* STEP 2: LEAD FUNNEL */}
          {step === 1 && (
            <div className="space-y-8">
               <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">Lead Funnel Health</h3>
                  <p className="text-sm text-slate-500">Inbound flow and cancellation analysis</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SectionGroup title="Inbound Flow" color="blue">
                     <Input label="Leads Received (Yesterday)" />
                     <Input label="Leads Received (MTD)" />
                     <Input label="Conversion %" disabled value="--%" />
                  </SectionGroup>
                  <SectionGroup title="Meetings" color="indigo">
                     <Input label="Scheduled (Yesterday)" />
                     <Input label="Scheduled (MTD)" />
                     <Input label="Schedule Rate" disabled value="--%" />
                  </SectionGroup>
                  <SectionGroup title="Cancellations" color="rose">
                     <Input label="Cancellations (MTD)" />
                     <Input label="Primary Reason" placeholder="Dropdown..." />
                     <Input label="Cancel Rate" disabled value="--%" />
                  </SectionGroup>
               </div>

               <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-start gap-5">
                  <div className="p-3 bg-red-100 rounded-full text-red-600">
                    <ShieldAlert size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-red-900 mb-1">Zero Tolerance Metric</h4>
                    <p className="text-sm text-red-700 mb-4">Any leads with ≤ 3 calls must be justified immediately.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <Input label="Leads ≤ 3 Calls" placeholder="Count (Must be 0)" className="bg-white border-red-200" />
                       <Input label="Justification / Action" placeholder="Explain deviation..." className="bg-white border-red-200" />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* STEP 3: US / GLOBAL */}
          {step === 2 && (
             <div className="space-y-8">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">US & Global Operations</h3>
                  <p className="text-sm text-slate-500">Outbound activity and hunter performance</p>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <Input label="RPC (Right Party Contact)" placeholder="Count" />
                   <Input label="Calls to New Contacts" placeholder="Count" />
                   <Input label="Total Calls Made" placeholder="Count" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-700 mb-3 text-sm">Email Sentiment</h5>
                      <div className="grid grid-cols-2 gap-4">
                         <Input label="Positive Responses" />
                         <Input label="Negative Responses" />
                      </div>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-700 mb-3 text-sm">Meeting Outcomes</h5>
                      <Input label="Meetings Scheduled Today" />
                   </div>
                </div>
             </div>
          )}
          
          {/* STEP 4: Forecast (Simplified for brevity) */}
          {step === 3 && (
             <div className="space-y-8">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">Forecast & Pipeline</h3>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <Input label="Total Forecast Value (₹)" icon={<DollarSign size={14}/>} />
                   <Input label="Change from Yesterday" placeholder="+/-" />
                   <Input label="Weighted Forecast" />
                </div>
                {/* Industry Table Mock */}
                <div className="border rounded-xl overflow-hidden">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                         <tr><th className="p-3">Sector</th><th className="p-3">Value</th><th className="p-3">% Total</th></tr>
                      </thead>
                      <tbody>
                         <tr><td className="p-3 border-b">Real Estate</td><td className="p-3 border-b"><Input placeholder="₹" className="h-8"/></td><td className="p-3 border-b">--%</td></tr>
                         <tr><td className="p-3">Non-RE</td><td className="p-3"><Input placeholder="₹" className="h-8"/></td><td className="p-3">--%</td></tr>
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* Placeholders for steps 4 & 5... */}
          {step >= 4 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText size={48} className="mb-4 text-slate-200" />
                <p>Additional steps configured in full simulation...</p>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-between items-center">
           <button 
             onClick={handleBack} 
             disabled={step === 0}
             className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
           >
             Back
           </button>
           <button 
             onClick={step === steps.length - 1 ? handleSubmit : handleNext}
             className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 transition-all transform active:scale-95"
           >
             {step === steps.length - 1 ? 'Submit Report' : 'Next Section'} <ChevronRight size={16} />
           </button>
        </div>

      </div>
    </div>
  );
};

// --- 9. ATOMIC COMPONENTS ---

const BootLoader = () => (
  <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <h2 className="text-lg font-bold text-slate-800">Paramantra Nexus</h2>
    <p className="text-xs text-slate-500 font-mono mt-1">Establishing Secure Connection...</p>
  </div>
);

const NavItem = ({ icon, label, active, expanded, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-1",
      active 
        ? "bg-indigo-50 text-indigo-700 font-semibold" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      !expanded && "justify-center"
    )}
    title={!expanded ? label : ""}
  >
    {icon}
    {expanded && <span className="text-sm">{label}</span>}
  </button>
);

const KPICard = ({ title, value, trend, sub, icon, isNegative, isAlert }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-lg", isAlert ? "bg-red-50" : "bg-slate-50")}>
        {icon}
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border",
        isAlert ? "bg-red-50 text-red-700 border-red-100" :
        isNegative ? "bg-red-50 text-red-700 border-red-100" : 
        "bg-emerald-50 text-emerald-700 border-emerald-100"
      )}>
        {isNegative ? <ArrowDownRight size={12} /> : !isAlert && <ArrowUpRight size={12} />}
        {trend}
      </div>
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">{title}</p>
    <p className="text-xs text-slate-500 font-medium">{sub}</p>
  </div>
);

const RepDemoForm = ({ name }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{name.charAt(0)}</div>
        <h4 className="font-bold text-lg text-slate-800">{name}</h4>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-slate-200 hover:text-amber-400 cursor-pointer transition-colors" />)}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
       <Input label="Today" placeholder="0" />
       <Input label="MTD" placeholder="0" />
    </div>
    <div className="space-y-4">
       <Input label="Key Learnings" placeholder="Notes..." />
       <Input label="Tools Used" placeholder="e.g. Zoom" />
    </div>
  </div>
);

const Input = ({ label, placeholder, disabled, value, icon, className }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-0.5">{label}</label>}
    <div className="relative">
      <input 
        type="text" 
        disabled={disabled}
        value={value}
        className={cn(
          "w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400",
          disabled && "bg-slate-50 text-slate-500 cursor-not-allowed",
          icon && "pl-9",
          className
        )}
        placeholder={placeholder}
      />
      {icon && <div className="absolute left-3 top-2.5 text-slate-400">{icon}</div>}
    </div>
  </div>
);

const SectionGroup = ({ title, children, color }) => (
  <div className="space-y-4">
     <h5 className={`font-bold text-xs uppercase tracking-wider text-${color}-600 border-b border-${color}-100 pb-2`}>{title}</h5>
     <div className="space-y-4">
       {children}
     </div>
  </div>
);

const LegendItem = ({ color, label, val }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-slate-600">{label}</span>
    </div>
    <span className="font-bold text-slate-800">{val}</span>
  </div>
);