// src/components/Landing/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Droplet, Package, CreditCard, BarChart3, Shield, CheckCircle, X,
  Phone, Mail, Calendar, Send, User, Building, MessageSquare, ArrowRight,
  Gauge, Users, FileText, ClipboardList, Truck, Store, LogIn, AlertTriangle, Quote,
  Sparkles, Smartphone, Lock, FileSpreadsheet, MessageCircle, ChevronLeft, ChevronRight, Wallet
} from 'lucide-react';
import logoImage from '../../assets/profile.png';

const EMAIL = 'xabiiib0790@gmail.com';
const PHONE = '0741848348';

const inputCls =
  'w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition';

const Field = ({ label, icon: Icon, required, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    <span className="relative block">
      {Icon && <Icon size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />}
      {children}
    </span>
  </label>
);

// ============================================
// DEMO MODAL
// ============================================
const DemoBookingModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting, formSuccess }) => {
  if (!isOpen) return null;
  const set = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm kaafi-fade" role="dialog" aria-modal="true">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto kaafi-pop">
        <div className="bg-[#0B2A3C] px-6 py-6 rounded-t-3xl flex items-start justify-between gap-4">
          <div>
            <h2 className="kaafi-display text-2xl font-bold text-white">Book a demo</h2>
            <p className="text-cyan-100/80 text-sm mt-1">We'll walk you through KAAFI AQUA using your own business setup.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {formSuccess ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center mb-4">
                <CheckCircle size={34} />
              </div>
              <h3 className="kaafi-display text-2xl font-bold text-slate-900">Request sent</h3>
              <p className="text-slate-600 text-sm mt-2 max-w-sm mx-auto">
                We'll reach out within 24 hours to confirm a time. Replies go to {formData.email || 'your email'}.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" icon={User} required>
                  <input type="text" required placeholder="John Doe" className={inputCls} value={formData.name} onChange={set('name')} />
                </Field>
                <Field label="Email" icon={Mail} required>
                  <input type="email" required placeholder="john@business.com" className={inputCls} value={formData.email} onChange={set('email')} />
                </Field>
                <Field label="Phone number" icon={Phone}>
                  <input type="tel" placeholder="+254 712 345 678" className={inputCls} value={formData.phone} onChange={set('phone')} />
                </Field>
                <Field label="Business name" icon={Building} required>
                  <input type="text" required placeholder="Your water business" className={inputCls} value={formData.company} onChange={set('company')} />
                </Field>
                <Field label="Business type">
                  <select className={inputCls + ' pl-3'} value={formData.businessType} onChange={set('businessType')}>
                    <option value="">Select type</option>
                    <option>Water Refill Station</option>
                    <option>Bottled Water Retailer</option>
                    <option>Water Distributor / Wholesaler</option>
                    <option>Bottling Plant</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Preferred date" icon={Calendar}>
                  <input type="date" className={inputCls} value={formData.preferredDate} onChange={set('preferredDate')} />
                </Field>
              </div>
              <Field label="What do you need help with?" icon={MessageSquare}>
                <textarea rows="3" placeholder="Number of outlets, how you sell today, anything else…" className={inputCls + ' resize-none'} value={formData.message} onChange={set('message')} />
              </Field>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button type="button" onClick={onClose} className="sm:w-32 px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#0B2A3C] hover:bg-[#12405a] disabled:opacity-60 transition">
                  {isSubmitting ? (<><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Sending…</>) : (<><Send size={16} /> Send request</>)}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// HERO PREVIEW CAROUSEL (desktop): sample screens from the system
// ============================================
const good = 'bg-emerald-400/20 text-emerald-300';
const warn = 'bg-amber-400/20 text-amber-300';
const bad = 'bg-rose-400/20 text-rose-300';
const info = 'bg-cyan-400/20 text-cyan-200';

const Tile = ({ label, value, tone = '' }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
    <p className="text-[11px] text-cyan-100/60">{label}</p>
    <p className={`kaafi-display text-[17px] font-bold mt-0.5 ${tone}`}>{value}</p>
  </div>
);
const Chip = ({ children, tone }) => (
  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${tone}`}>{children}</span>
);
const Row = ({ title, sub, right }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
    <div className="min-w-0">
      <p className="text-[13px] font-medium truncate">{title}</p>
      {sub && <p className="text-[11px] text-cyan-100/60 truncate">{sub}</p>}
    </div>
    <div className="text-right shrink-0 space-y-0.5">{right}</div>
  </div>
);
const Bar = ({ pct, tone }) => (
  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
    <div className={`h-full rounded-full ${tone}`} style={{ width: pct + '%' }} />
  </div>
);
const Amount = ({ children }) => <p className="text-[13px] font-semibold">{children}</p>;

const slides = [
  {
    title: 'Tank level monitor', icon: Droplet,
    body: (
      <div className="flex gap-5 items-stretch">
        <div className="relative w-28 h-44 rounded-2xl border border-white/15 bg-white/5 overflow-hidden shrink-0">
          <div className="kaafi-fill absolute bottom-0 inset-x-0 bg-gradient-to-t from-cyan-500 to-cyan-300" style={{ height: '72%' }}>
            <svg className="kaafi-wave absolute -top-3 left-0 w-[200%] h-4 text-cyan-300" viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden>
              <path d="M0 8 Q 12.5 0 25 8 T 50 8 T 75 8 T 100 8 T 125 8 T 150 8 T 175 8 T 200 8 V16 H0Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="kaafi-display text-3xl font-bold drop-shadow">72%</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
          <div>
            <p className="text-xs text-cyan-100/60">Remaining</p>
            <p className="kaafi-display text-2xl font-bold">3,600 L</p>
            <p className="text-xs text-cyan-100/60">of 5,000 L capacity</p>
          </div>
          <Tile label="Credit owed to you" value="KSh 14,200 from 6 customers" />
          <div className="rounded-xl bg-amber-400/15 border border-amber-300/30 p-2.5 text-xs flex gap-2 items-start">
            <AlertTriangle size={14} className="text-amber-300 mt-0.5 shrink-0" />
            <span className="text-amber-100">Filter 2 needs replacing in 6 days</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Point of sale', icon: CreditCard,
    body: (
      <div className="space-y-2">
        <Row title="20 L refill" sub="KSh 30 each" right={<Amount>× 3</Amount>} />
        <Row title="10 L refill" sub="KSh 20 each" right={<Amount>× 2</Amount>} />
        <div className="flex justify-between text-sm px-1 pt-1">
          <span className="text-cyan-100/70">Subtotal</span><span className="font-bold">KSh 130</span>
        </div>
        <div className="flex gap-2">
          {['Cash', 'M-Pesa', 'Credit'].map((m) => (
            <span key={m} className={`flex-1 text-center text-xs font-semibold py-2 rounded-lg border ${m === 'M-Pesa' ? 'bg-cyan-400 text-[#0B2A3C] border-cyan-400' : 'border-white/15 text-cyan-100/80'}`}>{m}</span>
          ))}
        </div>
        <div className="text-center text-sm font-bold py-2.5 rounded-xl bg-emerald-400 text-[#0B2A3C]">Complete sale</div>
      </div>
    )
  },
  {
    title: 'Sales history', icon: FileText,
    body: (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Total revenue" value="KSh 48,350" />
          <Tile label="Transactions" value="312" />
          <Tile label="Average sale" value="KSh 155" />
          <Tile label="Pending amount" value="KSh 14,200" tone="text-amber-300" />
        </div>
        <Row title="Walk-in customer" sub="20 L refill × 3" right={<><Amount>KSh 90</Amount><Chip tone={good}>M-Pesa</Chip></>} />
        <Row title="Mama Njeri" sub="Carton × 2" right={<><Amount>KSh 640</Amount><Chip tone={warn}>Credit, pending</Chip></>} />
      </div>
    )
  },
  {
    title: 'Admin dashboard', icon: BarChart3,
    body: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Today's revenue" value="KSh 6,420" />
          <Tile label="Today's sales" value="41" />
          <Tile label="Active staff" value="3" />
          <Tile label="Net profit" value="KSh 4,180" tone="text-emerald-300" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] text-cyan-100/60 mb-2">Weekly sales trend</p>
          <div className="flex items-end gap-2 h-16">
            {[45, 60, 38, 72, 55, 90, 66].map((h, k) => (
              <div key={k} className={`flex-1 rounded-t ${k === 6 ? 'bg-cyan-300' : 'bg-cyan-500/50'}`} style={{ height: h + '%' }} />
            ))}
          </div>
          <div className="flex gap-2 mt-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, k) => <span key={k} className="flex-1 text-center text-[10px] text-cyan-100/50">{d}</span>)}</div>
        </div>
      </div>
    )
  },
  {
    title: 'Customers & credit', icon: Users,
    body: (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Customers" value="86" />
          <Tile label="With credit" value="6" />
          <Tile label="Outstanding" value="KSh 14,200" tone="text-amber-300" />
        </div>
        <Row title="Mama Njeri" sub="Credit since 3 Nov" right={<><Amount>KSh 4,800</Amount><Chip tone={info}>Record payment</Chip></>} />
        <Row title="Kamau Hotel" sub="Credit since 9 Nov" right={<Amount>KSh 3,600</Amount>} />
        <Row title="Baraka Shop" sub="No purchase in 18 days" right={<Chip tone={warn}>Inactive</Chip>} />
      </div>
    )
  },
  {
    title: 'Filter status', icon: Gauge,
    body: (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Active filters" value="5" />
          <Tile label="Need attention" value="2" tone="text-amber-300" />
          <Tile label="Critical" value="1" tone="text-rose-300" />
        </div>
        {[['Sediment filter', 82, 'bg-emerald-400', good, 'Good'], ['Carbon filter', 46, 'bg-amber-400', warn, 'Warning'], ['RO membrane', 12, 'bg-rose-400', bad, 'Critical']].map(([name, pct, barTone, chipTone, label]) => (
          <div key={name} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 space-y-1.5">
            <div className="flex justify-between items-center"><p className="text-[13px] font-medium">{name}</p><Chip tone={chipTone}>{label}</Chip></div>
            <Bar pct={pct} tone={barTone} />
          </div>
        ))}
      </div>
    )
  },
  {
    title: 'Stock management', icon: Package,
    body: (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Items" value="24" />
          <Tile label="Low stock" value="3" tone="text-amber-300" />
          <Tile label="Value" value="KSh 86,500" />
        </div>
        <Row title="20 L bottles" sub="48 in stock" right={<Chip tone={good}>In stock</Chip>} />
        <Row title="5 L bottles" sub="12 left" right={<Chip tone={warn}>Low</Chip>} />
        <Row title="Bottle caps" sub="300 in stock" right={<Chip tone={good}>In stock</Chip>} />
      </div>
    )
  },
  {
    title: 'Expense tracker', icon: Wallet,
    body: (
      <div className="space-y-2">
        <Tile label="Total expenses" value="KSh 32,400" />
        {[['Salaries', 'KSh 15,000', 100], ['Utilities', 'KSh 12,000', 80], ['Maintenance', 'KSh 3,400', 23], ['Supplies', 'KSh 2,000', 13]].map(([name, amt, pct]) => (
          <div key={name} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 space-y-1.5">
            <div className="flex justify-between text-[13px]"><span className="font-medium">{name}</span><span className="font-semibold">{amt}</span></div>
            <Bar pct={pct} tone="bg-cyan-400" />
          </div>
        ))}
      </div>
    )
  },
  {
    title: 'Settings & roles', icon: Shield,
    body: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {['Products', 'Categories', 'Containers', 'Filters', 'Tank', 'System'].map((t, k) => (
            <span key={t} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${k === 0 ? 'bg-cyan-400 text-[#0B2A3C]' : 'bg-white/5 border border-white/10 text-cyan-100/80'}`}>{t}</span>
          ))}
        </div>
        <Row title="Admin" sub="Products, users, and reports" right={<Chip tone={info}>Full access</Chip>} />
        <Row title="Staff" sub="Make sales and view their own" right={<Chip tone={good}>Sales only</Chip>} />
        <Row title="20 L refill" sub="Retail price" right={<Amount>KSh 30</Amount>} />
      </div>
    )
  }
];

const PreviewCarousel = () => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = (d) => setI((v) => (v + d + n) % n);

  // Auto-advance every 3 seconds; restarts after any manual change, pauses on hover.
  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % n), 3000);
    return () => clearInterval(t);
  }, [paused, i, n]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Previews of the KAAFI AQUA system"
    >
      <div className="absolute -inset-6 bg-cyan-300/30 blur-3xl rounded-full" aria-hidden />
      <div className="relative overflow-hidden rounded-3xl bg-[#0B2A3C] text-white shadow-2xl shadow-cyan-900/30">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {slides.map(({ title, icon: Icon, body }, k) => (
            <div key={title} className="w-full shrink-0 h-[388px] p-5 pb-10" aria-hidden={k !== i}>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 text-sm font-semibold"><Icon size={16} className="text-cyan-300" /> {title}</span>
                <span className="text-[11px] text-cyan-100/60">Sample preview</span>
              </div>
              {body}
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
          {slides.map(({ title }, k) => (
            <button key={title} onClick={() => setI(k)} aria-label={`Show ${title}`} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-cyan-300' : 'w-1.5 bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
      </div>

      {[['Previous preview', -1, '-left-4', ChevronLeft], ['Next preview', 1, '-right-4', ChevronRight]].map(([label, d, pos, Icon]) => (
        <button key={label} onClick={() => go(d)} aria-label={label} className={`absolute top-1/2 -translate-y-1/2 ${pos} z-10 w-10 h-10 rounded-full bg-white text-[#0B2A3C] shadow-lg flex items-center justify-center hover:bg-cyan-50 transition`}>
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
};

// ============================================
// DATA
// ============================================
const features = [
  { icon: CreditCard, title: 'Point of sale', text: 'Retail and wholesale checkout with discounts, paid by M-Pesa, cash, or credit.' },
  { icon: Users, title: 'Customer credit', text: 'Record credit sales, see who owes what, and close sales the moment they pay.' },
  { icon: Droplet, title: 'Tank levels', text: 'Watch water levels, set capacity, and get a warning before you run low.' },
  { icon: Gauge, title: 'Filter upkeep', text: 'Track filter lifespan and get alerts when a replacement is due.' },
  { icon: BarChart3, title: 'Sales reports', text: 'Export history to PDF or Excel and review revenue, discounts, and pending credit.' },
  { icon: Shield, title: 'Roles & permissions', text: 'Staff make sales. Admins manage products, users, and reports.' }
];

const solutions = [
  { icon: Store, title: 'Refill stations', text: 'Serve walk-ins, sell containers, and keep a tab for your regulars.' },
  { icon: Package, title: 'Bottled water retailers', text: 'Sell cartons and packs with clear margins and exportable sales history.' },
  { icon: Truck, title: 'Distributors', text: 'Handle wholesale orders and customer credit from one dashboard.' }
];

const steps = [
  { icon: ClipboardList, title: 'Set up your catalog', text: 'Add products, containers, tank capacity, and filters.' },
  { icon: CreditCard, title: 'Sell at the counter', text: 'Ring up retail or wholesale sales in a few taps.' },
  { icon: Users, title: 'Collect on credit', text: 'Record payments and balances close out automatically.' },
  { icon: FileText, title: 'Export reports', text: 'Download PDF or Excel whenever your accountant asks.' }
];

const testimonials = [
  { quote: 'Checkout time dropped by half, and I no longer lose track of credit customers.', author: 'James Mwangi', role: 'Owner, AquaPure Refill Station' },
  { quote: 'The tank and filter alerts have saved us from running dry more than once.', author: 'Grace Wanjiru', role: 'Manager, ClearWater Retailers' },
  { quote: 'Monthly reports to Excel take seconds now. My accountant loves it.', author: 'Peter Otieno', role: 'Director, Nairobi Water Distributors' }
];

const navItems = [['Features', 'features'], ['Who it\'s for', 'solutions'], ['How it works', 'how-it-works'], ['Reviews', 'testimonials']];

// ============================================
// MOBILE LAYOUT (phones): compact, app-style
// ============================================
const featureColors = ['#0891B2', '#2563EB', '#7C3AED', '#F59E0B', '#059669', '#64748B'];
const solutionPoints = [
  { c: '#0891B2', bg: '#E0F4F8', points: ['Walk-in retail refills', 'Container sales', 'Credit tracking for regulars'] },
  { c: '#2563EB', bg: '#E3EEFD', points: ['Cartons and packs', 'Clear margins and discounts', 'Exportable sales history'] },
  { c: '#059669', bg: '#E3F5EC', points: ['Wholesale bulk orders', 'Customer credit', 'One dashboard for reports'] }
];
const trust = [
  { icon: Smartphone, label: 'M-Pesa ready' },
  { icon: Lock, label: 'Role-based access' },
  { icon: FileSpreadsheet, label: 'PDF & Excel' }
];

const SectionHead = ({ label, title, sub }) => (
  <div className="text-center mb-5">
    <p className="text-[11px] font-extrabold tracking-[0.15em] text-cyan-600">{label}</p>
    <h2 className="kaafi-display text-[22px] font-extrabold text-slate-900 mt-2">{title}</h2>
    {sub && <p className="text-[13px] text-slate-500 mt-1.5">{sub}</p>}
  </div>
);

const MobileBody = ({ onLogin, onDemo }) => (
  <div className="sm:hidden">
    {/* Hero */}
    <section className="flex flex-col items-center text-center px-5 pt-8 pb-4">
      <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4">
        
      </span>
      <h1 className="kaafi-display text-[32px] leading-[40px] font-extrabold text-slate-900">
        Run Your Water Business <span className="text-cyan-600">Smarter</span>
      </h1>
      <p className="text-sm text-slate-600 leading-5 mt-3">
        KAAFI AQUA helps refill stations, retailers, and distributors manage sales, customer credit, tank levels, filters, and reports, all in one place.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 mt-5">
        <button onClick={onLogin} className="inline-flex items-center gap-2 bg-cyan-600 text-white font-bold text-[15px] px-5 py-3 rounded-xl shadow-md shadow-cyan-600/25 active:scale-95 transition">
          Get Started <ArrowRight size={16} />
        </button>
        <button onClick={onDemo} className="inline-flex items-center gap-2 bg-white text-cyan-700 font-bold text-[15px] px-5 py-3 rounded-xl border-[1.5px] border-cyan-200 active:scale-95 transition">
          <Calendar size={16} /> Request demo
        </button>
      </div>
      <img src={logoImage} alt="KAAFI AQUA" className="w-40 h-40 object-contain mt-7" onError={(e) => { e.target.style.display = 'none'; }} />
    </section>

    {/* Trust */}
    <div className="mx-4 mt-2 bg-white rounded-2xl border border-cyan-100 shadow-sm py-3.5 flex justify-around">
      {trust.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-1.5 px-1">
          <Icon size={16} className="text-cyan-600" />
          <span className="text-[11px] font-semibold text-slate-700">{label}</span>
        </span>
      ))}
    </div>

    {/* Features */}
    <section className="px-5 pt-9">
      <SectionHead label="PLATFORM FEATURES" title="All the tools you need" sub="Sales, credit, tank levels and more, in one place." />
      <div className="grid grid-cols-2 gap-3">
        {features.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2.5" style={{ background: featureColors[i] + '20' }}>
              <Icon size={22} color={featureColors[i]} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-xs text-slate-500 leading-[17px]">{text}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Solutions */}
    <section className="px-5 pt-9">
      <SectionHead label="BUILT FOR EVERY BUSINESS" title="One platform, three sides" sub="Refill stations, retailers, and distributors." />
      <div className="space-y-3">
        {solutions.map(({ icon: Icon, title }, i) => (
          <div key={title} className="bg-white rounded-2xl overflow-hidden border-2 shadow-sm" style={{ borderColor: solutionPoints[i].c }}>
            <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ background: solutionPoints[i].bg }}>
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: solutionPoints[i].c }}><Icon size={20} /></span>
              <h3 className="text-[15px] font-extrabold" style={{ color: solutionPoints[i].c }}>{title}</h3>
            </div>
            <ul className="p-4 space-y-2.5">
              {solutionPoints[i].points.map((pt) => (
                <li key={pt} className="flex items-center gap-2 text-[13px] text-slate-700">
                  <CheckCircle size={16} color={solutionPoints[i].c} className="shrink-0" /> {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    {/* Steps */}
    <section className="px-5 pt-9">
      <SectionHead label="HOW IT WORKS" title="Start in four easy steps" />
      <div className="grid grid-cols-2 gap-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <span className="w-[26px] h-[26px] rounded-full bg-cyan-600 text-white text-xs font-extrabold flex items-center justify-center mb-2">{i + 1}</span>
            <Icon size={22} className="text-cyan-600" />
            <h3 className="text-[13px] font-bold text-slate-900 mt-2">{title}</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-[15px]">{text}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Testimonials */}
    <section className="pt-9">
      <div className="px-5"><SectionHead label="TESTIMONIALS" title="What owners say" /></div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-2 [&::-webkit-scrollbar]:hidden">
        {testimonials.map((t) => (
          <figure key={t.author} className="min-w-[82%] snap-start bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <Quote size={18} className="text-cyan-500" />
            <blockquote className="text-[13px] text-slate-700 leading-5 mt-2">{t.quote}</blockquote>
            <figcaption className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">{t.author}</p>
              <p className="text-[11px] text-slate-500">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>

    {/* CTA banner */}
    <div className="mx-4 mt-8 p-5 rounded-[18px] bg-cyan-50 border-[1.5px] border-cyan-600 text-center">
      <h3 className="text-xl font-extrabold text-cyan-800">Ready to modernize your water business?</h3>
      <p className="text-[13px] text-slate-600 leading-[18px] mt-2">Get a quote based on your business size and needs.</p>
      <button onClick={onDemo} className="mt-4 inline-flex items-center gap-2 bg-white text-cyan-700 font-extrabold text-sm px-5 py-3 rounded-xl border-[1.5px] border-cyan-600 active:scale-95 transition">
        Request a demo <ArrowRight size={16} />
      </button>
    </div>

    {/* Contact */}
    <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
      {[
        { href: 'https://wa.me/254741848348', icon: MessageCircle, color: '#25D366', label: 'WhatsApp' },
        { href: `mailto:${EMAIL}`, icon: Mail, color: '#2563EB', label: 'Email' },
        { href: `tel:${PHONE}`, icon: Phone, color: '#F59E0B', label: 'Call' }
      ].map(({ href, icon: Icon, color, label }) => (
        <a key={label} href={href} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-[10px] px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm">
          <Icon size={18} color={color} /> {label}
        </a>
      ))}
    </div>

    {/* Footer */}
    <footer className="mt-9 bg-white border-t border-slate-200 px-5 py-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1.5">
        <img src={logoImage} alt="" className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
        <span className="kaafi-display text-lg font-extrabold text-slate-900">KAAFI<span className="text-cyan-600">AQUA</span></span>
      </div>
      <p className="text-xs text-slate-500 mb-2">Water business management</p>
      <p className="text-[11px] text-slate-500">© 2026 KAAFI AQUA</p>
    </footer>
  </div>
);

// ============================================
// PAGE
// ============================================
const LandingPage = ({ onNavigate }) => {
    const [showDemo, setShowDemo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const empty = { name: '', email: '', phone: '', company: '', businessType: '', message: '', preferredDate: '' };
  const [formData, setFormData] = useState(empty);

  const navigate = (page) => {
    if (typeof onNavigate === 'function') onNavigate(page);
    else if (page === 'login') window.location.href = '/login';
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      alert('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    const subject = encodeURIComponent('KAAFI AQUA Demo Request');
    const body = encodeURIComponent(
      `New demo request for KAAFI AQUA\n\nName: ${formData.name}\nEmail: ${formData.email}\n` +
      `Phone: ${formData.phone || 'Not provided'}\nBusiness: ${formData.company}\n` +
      `Business Type: ${formData.businessType || 'Not specified'}\nPreferred Date: ${formData.preferredDate || 'Anytime'}\n\n` +
      `Message:\n${formData.message || 'No additional message.'}\n`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setFormSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => { setShowDemo(false); setFormSuccess(false); setFormData(empty); }, 3500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#EAF6F9] sm:bg-white text-slate-800 kaafi-body">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <img src={logoImage} alt="KAAFI AQUA" className="h-10 sm:h-11 w-auto max-w-[120px] sm:max-w-[150px] object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="kaafi-display text-lg sm:text-xl font-extrabold text-[#0B2A3C] tracking-tight"><span className="text-cyan-600"></span></span>
          </button>

          <nav className="hidden md:flex items-center gap-7">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="text-sm font-medium text-slate-600 hover:text-[#0B2A3C] transition-colors">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('login')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-cyan-700 border-[1.5px] border-cyan-600 sm:border-transparent sm:text-[#0B2A3C] rounded-lg hover:bg-slate-100 transition">
              <LogIn size={16} /> Log in
            </button>
          </div>

        </div>
      </header>

      <MobileBody onLogin={() => navigate('login')} onDemo={() => setShowDemo(true)} />

      <div className="hidden sm:block">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-20 pb-12 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          <div>
            <h1 className="kaafi-display text-[2rem] sm:text-6xl font-extrabold text-[#0B2A3C] leading-[1.1] tracking-tight">
              Know every litre, every sale, every balance.
            </h1>
            <p className="mt-4 text-[15px] sm:text-lg text-slate-600 max-w-lg leading-relaxed">
              KAAFI AQUA gives refill stations, retailers, and distributors one place for sales, customer credit, tank levels, filters, and reports.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('login')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-600/25 transition">
                Get started <ArrowRight size={16} />
              </button>
              <button onClick={() => setShowDemo(true)} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[#0B2A3C] bg-white border border-slate-300 hover:border-[#0B2A3C] transition">
                <Calendar size={16} /> Book a demo
              </button>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-slate-500">Works with M-Pesa, cash, and credit. Exports to PDF and Excel.</p>
          </div>

          <div className="lg:px-6 max-w-lg w-full mx-auto lg:max-w-none"><PreviewCarousel /></div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-12 sm:py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="kaafi-display text-2xl sm:text-4xl font-extrabold text-[#0B2A3C] tracking-tight">Everything the counter, the tank, and the books need</h2>
            <p className="mt-3 text-slate-600">Replace the notebook, the calculator, and the guesswork.</p>
          </div>
          <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white p-5 sm:p-7">
                <Icon className="w-6 h-6 text-cyan-600" />
                <h3 className="kaafi-display mt-4 text-lg font-bold text-[#0B2A3C]">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-12 sm:py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="kaafi-display text-2xl sm:text-4xl font-extrabold text-[#0B2A3C] tracking-tight max-w-2xl">Made for how water is actually sold</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {solutions.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl bg-cyan-50/60 border border-cyan-100 p-5 sm:p-7">
                <div className="w-12 h-12 rounded-2xl bg-[#0B2A3C] text-cyan-200 flex items-center justify-center"><Icon className="w-6 h-6" /></div>
                <h3 className="kaafi-display mt-5 text-xl font-bold text-[#0B2A3C]">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-12 sm:py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="kaafi-display text-2xl sm:text-4xl font-extrabold text-[#0B2A3C] tracking-tight max-w-2xl">Up and selling in four steps</h2>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="kaafi-display w-9 h-9 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">{i + 1}</span>
                  <Icon className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="kaafi-display mt-5 text-lg font-bold text-[#0B2A3C]">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-12 sm:py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="kaafi-display text-2xl sm:text-4xl font-extrabold text-[#0B2A3C] tracking-tight">What owners say</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <figure key={t.author} className="rounded-3xl border border-slate-200 p-5 sm:p-7 flex flex-col">
                <Quote className="w-6 h-6 text-cyan-500" />
                <blockquote className="mt-4 text-slate-700 leading-relaxed flex-1">{t.quote}</blockquote>
                <figcaption className="mt-6 pt-5 border-t border-slate-100">
                  <p className="font-bold text-sm text-[#0B2A3C]">{t.author}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-24">
        <div className="max-w-3xl mx-auto rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-10 text-center">
          <h2 className="kaafi-display text-2xl sm:text-3xl font-extrabold text-[#0B2A3C] tracking-tight">Get a quote for your business</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">Pricing depends on your size and needs. Call us or book a demo and we'll tailor it.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setShowDemo(true)} className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0B2A3C] hover:bg-[#12405a] transition">Book a demo</button>
            <a href={`tel:${PHONE}`} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[#0B2A3C] bg-white border border-slate-300 hover:border-[#0B2A3C] transition">
              <Phone size={16} /> {PHONE}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B2A3C] text-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col sm:flex-row gap-8 sm:gap-10 sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center p-2 shrink-0">
              <img src={logoImage} alt="KAAFI AQUA" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <p className="kaafi-display text-xl font-extrabold text-white"><span className="text-cyan-300"></span></p>
              <p className="text-sm text-slate-200 mt-1">Water business management</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-14 text-[15px] sm:text-base">
            <div>
              <p className="font-bold text-white mb-3">Explore</p>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-slate-100 hover:text-cyan-300 transition">Features</a></li>
                <li><a href="#solutions" className="text-slate-100 hover:text-cyan-300 transition">Who it's for</a></li>
                <li><a href="#how-it-works" className="text-slate-100 hover:text-cyan-300 transition">How it works</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Contact</p>
              <ul className="space-y-2.5">
                <li><a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 text-slate-100 hover:text-cyan-300 transition"><Phone size={16} /> {PHONE}</a></li>
                <li><a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 text-slate-100 hover:text-cyan-300 transition"><Mail size={16} /> Email us</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 py-4 text-center text-sm text-slate-200">© 2026 KAAFI AQUA</div>
      </footer>

      </div>

      {/* Floating WhatsApp button (desktop) */}
      <a
        href="https://wa.me/254741848348?text=Hello%20KAAFI%20AQUA%2C%20I%27d%20like%20to%20know%20more."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="hidden sm:flex group fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center"
      >
        <span className="mr-2 px-3 py-2 rounded-lg bg-[#0B2A3C] text-white text-sm font-semibold shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition pointer-events-none whitespace-nowrap">
          Chat with us on WhatsApp
        </span>
        <span className="flex items-center gap-2 pl-4 pr-4 py-3.5 rounded-l-2xl bg-[#25D366] text-white shadow-xl shadow-emerald-900/20 hover:bg-[#1ebe5a] transition">
          <MessageCircle size={26} />
        </span>
      </a>

      <DemoBookingModal
        isOpen={showDemo}
        onClose={() => { setShowDemo(false); setFormSuccess(false); }}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        formSuccess={formSuccess}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .kaafi-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .kaafi-display { font-family: 'Bricolage Grotesque', 'DM Sans', system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
        @keyframes kaafiFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes kaafiPop { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes kaafiFill { from { height: 8% } }
        @keyframes kaafiWave { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .kaafi-fade { animation: kaafiFade .25s ease-out }
        .kaafi-pop { animation: kaafiPop .3s ease-out }
        .kaafi-fill { animation: kaafiFill 1.6s cubic-bezier(.2,.8,.2,1) }
        .kaafi-wave { animation: kaafiWave 4s linear infinite }
        @media (prefers-reduced-motion: reduce) {
          .kaafi-fill, .kaafi-wave, .kaafi-fade, .kaafi-pop { animation: none }
          html { scroll-behavior: auto }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;