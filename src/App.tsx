import { useEffect, useState } from 'react';
import { Button, Card, LogoMark, Metric, PageHeader, Status } from './components/ui';
import { ToastContainer, showToast } from './components/Toast';
import { content, metrics, users } from './data/mock';
import { authService, type AdminUser } from './features/auth/services/auth.service';
import { SignIn } from './features/auth/SignIn';
import { MemberLevelsView } from './features/member-levels/MemberLevelsView';
import { MemberLevelCodesView } from './features/member-levels/MemberLevelCodesView';
import { UsersView } from './features/users/UsersView';
import { PointsConfigsView } from './features/points/PointsConfigsView';
import { TopupCodesView } from './features/points/TopupCodesView';
import { PointsLedgerView } from './features/points/PointsLedgerView';
import { OracleView } from './features/oracle/OracleView';
import { ContentView } from './features/content/ContentView';
import { SettingsView } from './features/settings/SettingsView';

export type View =
  | 'dashboard'
  | 'member-levels'
  | 'member-level-codes'
  | 'points-configs'
  | 'topup-codes'
  | 'points-ledger'
  | 'users'
  | 'content'
  | 'oracle'
  | 'settings';

interface NavItem {
  id: View;
  icon: string;
  label: string;
  badge?: string;
}

const nav: NavItem[] = [
  { id: 'dashboard', icon: '⌂', label: 'အနှစ်ချုပ် (Dashboard)' },
  { id: 'member-levels', icon: '👑', label: 'အသင်းဝင် အဆင့်များ (Tiers)' },
  { id: 'member-level-codes', icon: '🎟️', label: 'အဆင့်ကုဒ်များ (Codes)' },
  { id: 'points-configs', icon: '⚙️', label: 'အမှတ်နှုန်းထားများ (Pricing)' },
  { id: 'topup-codes', icon: '🎫', label: 'အမှတ်ဘောက်ချာများ (Top-up Codes)' },
  { id: 'points-ledger', icon: '📜', label: 'အမှတ်စာရင်း (Ledger)' },
  { id: 'users', icon: '◉', label: 'အသုံးပြုသူများ (Users)' },
  { id: 'content', icon: '▤', label: 'အကြောင်းအရာ (Content)' },
  { id: 'oracle', icon: '✦', label: 'Oracle' },
  { id: 'settings', icon: '⚙', label: 'ဆက်တင်များ (Settings)' },
];

const VALID_VIEWS: View[] = [
  'dashboard',
  'member-levels',
  'member-level-codes',
  'points-configs',
  'topup-codes',
  'points-ledger',
  'users',
  'content',
  'oracle',
  'settings',
];

function getViewFromPath(): View {
  if (typeof window === 'undefined') return 'dashboard';
  const rawPath = window.location.pathname.replace(/^\/+/, '').split('/')[0];
  if (rawPath === '' || rawPath === 'dashboard') {
    return 'dashboard';
  }
  if (VALID_VIEWS.includes(rawPath as View)) {
    return rawPath as View;
  }
  return 'dashboard';
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(authService.getUser());
  const [view, setViewState] = useState<View>(() => getViewFromPath());
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToView = (nextView: View, replace = false) => {
    setViewState(nextView);
    const targetPath = nextView === 'dashboard' ? '/' : `/${nextView}`;
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setViewState(getViewFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // If user is at a valid subpath on initial load, ensure URL is cleanly aligned
    const currentView = getViewFromPath();
    const expectedPath = currentView === 'dashboard' ? '/' : `/${currentView}`;
    if (window.location.pathname !== expectedPath && window.location.pathname !== '/dashboard') {
      window.history.replaceState(null, '', expectedPath);
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      setCurrentUser(authService.getUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Initial session verification
    if (authService.isAuthenticated()) {
      authService.fetchCurrentUser().then((user) => {
        if (user) setCurrentUser(user);
      });
    }

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('အကောင့်မှ အောင်မြင်စွာ ထွက်ပြီးပါပြီ (Signed out).', 'info');
  };

  const handleNavigateToCodes = (memberLevelId?: number) => {
    setSelectedLevelFilter(memberLevelId);
    navigateToView('member-level-codes');
  };

  // If not authenticated, display the Akyannyan Admin SignIn view
  if (!isAuthenticated) {
    return (
      <>
        <SignIn onSuccess={() => setIsAuthenticated(true)} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-shell">
      <ToastContainer />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <LogoMark />
          <div>
            <b>အကြံဉာဏ်</b>
            <small>AKYAN NYAN · ADMIN</small>
          </div>
        </div>

        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigateToView(item.id);
                setMobileMenuOpen(false);
              }}
              className={view === item.id ? 'nav-item active' : 'nav-item'}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Card className="support-card">
            <span>💬</span>
            <p>အကူအညီ လိုအပ်ပါသလား?</p>
            <button type="button" onClick={() => showToast('Technical Support: support@akyannyan.com', 'info')}>
              Support ကို ဆက်သွယ်ပါ ›
            </button>
          </Card>

          <div className="admin-user">
            <span>✦</span>
            <div>
              <b>{currentUser?.displayName || 'Admin'}</b>
              <small>{currentUser?.email || 'administrator'}</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
            <span className="topbar-badge">● System Online</span>
          </div>

          <div className="top-actions">
            <div className="user-profile-badge">
              <span className="admin-avatar">
                {(currentUser?.displayName || 'A').slice(0, 1).toUpperCase()}
              </span>
              <div className="admin-meta">
                <b>{currentUser?.displayName || 'Admin'}</b>
                <small>{currentUser?.email || 'admin@akyannyan.com'}</small>
              </div>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              aria-label="Log out from admin"
            >
              🚪 ထွက်မည် (Log Out)
            </button>
          </div>
        </header>

        {/* View Router */}
        {view === 'dashboard' && <Dashboard setView={navigateToView} />}
        {view === 'member-levels' && (
          <MemberLevelsView onNavigateToCodes={handleNavigateToCodes} />
        )}
        {view === 'member-level-codes' && (
          <MemberLevelCodesView initialMemberLevelId={selectedLevelFilter} />
        )}
        {view === 'points-configs' && <PointsConfigsView />}
        {view === 'topup-codes' && <TopupCodesView />}
        {view === 'points-ledger' && <PointsLedgerView />}
        {view === 'users' && <UsersView />}
        {view === 'oracle' && <OracleView />}
        {view === 'content' && <ContentView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function Dashboard({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="page">
      <PageHeader
        title="မင်္ဂလာပါ Admin 👋"
        description="Akyannyan ၏ အသင်းဝင်အဆင့်များ၊ ဘောက်ချာကုဒ်များနှင့် ဗေဒင်/ဇာတာ ဝန်ဆောင်မှုများကို စီမံခန့်ခွဲပါ။"
        action={
          <div className="header-action-group">
            <Button onClick={() => setView('member-level-codes')} variant="gold">
              ⚡ ကုဒ်ထုတ်မည်
            </Button>
            <Button onClick={() => setView('member-levels')} variant="jade">
              👑 အသင်းဝင် အဆင့်များ
            </Button>
          </div>
        }
      />

      <div className="metrics">
        {metrics.map(([icon, label, value, detail]) => (
          <Metric key={label} icon={icon} label={label} value={value} detail={detail} />
        ))}
      </div>

      <div className="dashboard-grid">
        <Card className="wide-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">ဒီအပတ်</p>
              <h2>အသုံးပြုသူ လှုပ်ရှားမှု</h2>
            </div>
            <select aria-label="Date range">
              <option>လွန်ခဲ့သော ၇ ရက်</option>
              <option>လွန်ခဲ့သော ၃၀ ရက်</option>
            </select>
          </div>
          <div className="chart" aria-label="Weekly activity chart">
            {[35, 48, 42, 67, 55, 82, 73].map((height, index) => (
              <div className="chart-bar" key={height}>
                <i style={{ height: `${height}%` }} />
                <span>{['တန', 'လာ', 'ဂါ', 'ဗုဒ္ဓ', 'ကြာ', 'သော', 'စနေ'][index]}</span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span><i className="dot jade" />Active users</span>
            <span><i className="dot gold" />Oracle questions</span>
          </div>
        </Card>

        <Card className="ritual-card">
          <span className="ritual-icon">🏺</span>
          <p className="eyebrow">DAILY RITUAL</p>
          <h2>ကံစုဘူး</h2>
          <strong>74%</strong>
          <p>ယနေ့ ကုသိုလ်အလေ့အကျင့် ပြီးစီးမှု</p>
          <div className="progress">
            <i />
          </div>
          <span className="hint">1,846 / 2,494 users</span>
        </Card>

        <Card className="wide-card table-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">RECENTLY ACTIVE</p>
              <h2>အသုံးပြုသူအသစ်များ</h2>
            </div>
            <button className="link-button" onClick={() => setView('users')}>
              အားလုံးကြည့်ရန် ›
            </button>
          </div>
          <div className="table">
            {users.map(([name, detail, plan, last]) => (
              <div className="table-row" key={name}>
                <span className="person-avatar">{name.slice(0, 1)}</span>
                <div className="user-detail">
                  <b>{name}</b>
                  <small>{detail}</small>
                </div>
                <Status tone={plan === 'Premium' ? 'gold' : 'jade'}>{plan}</Status>
                <time>{last}</time>
              </div>
            ))}
          </div>
        </Card>

        <Card className="quick-card">
          <p className="eyebrow">QUICK ACTIONS</p>
          <h2>အမြန် လုပ်ဆောင်ရန်</h2>
          {[
            ['👑', 'အသင်းဝင် အဆင့် စီမံမည်', () => setView('member-levels')],
            ['🎟️', 'Voucher Code အသစ် ထုတ်မည်', () => setView('member-level-codes')],
            ['☀', 'နေ့စဉ် ကံဇာတာ ပြင်မည်', () => setView('content')],
          ].map(([icon, label, action]) => (
            <button
              key={label as string}
              className="quick-action"
              onClick={action as () => void}
            >
              <span>{icon as string}</span>
              {label as string}
              <b>›</b>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

