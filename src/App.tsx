import { useEffect, useState } from 'react';
import { Card, LogoMark } from './components/ui';
import { ToastContainer, showToast } from './components/Toast';
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
import { MeritView } from './features/merit/MeritView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { DashboardView } from './features/dashboard/DashboardView';

export type View =
  | 'dashboard'
  | 'member-levels'
  | 'member-level-codes'
  | 'points-configs'
  | 'topup-codes'
  | 'points-ledger'
  | 'users'
  | 'content'
  | 'su-buu'
  | 'oracle'
  | 'notifications';

interface NavItem {
  id: View;
  icon: string;
  label: string;
}

const nav: NavItem[] = [
  { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
  { id: 'member-levels', icon: '👑', label: 'User Tiers' },
  { id: 'member-level-codes', icon: '🎟️', label: 'User Codes' },
  { id: 'points-configs', icon: '⚙️', label: 'Pricing' },
  { id: 'topup-codes', icon: '🎫', label: 'Top-up Codes' },
  { id: 'points-ledger', icon: '📜', label: 'User History' },
  { id: 'users', icon: '◉', label: 'Users' },
  { id: 'content', icon: '▤', label: 'Content' },
  { id: 'su-buu', icon: '🏺', label: 'ကံစုဘူး' },
  { id: 'oracle', icon: '✦', label: 'Oracle' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
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
  'su-buu',
  'oracle',
  'notifications',
];

function getViewFromPath(): View {
  if (typeof window === 'undefined') return 'dashboard';
  const rawPath = window.location.pathname.replace(/^\/+/, '').split('/')[0];
  if (rawPath === '' || rawPath === 'dashboard' || rawPath === 'settings') {
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

      <main>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
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

        {view === 'dashboard' && <DashboardView setView={navigateToView} />}
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
        {view === 'su-buu' && <MeritView />}
        {view === 'notifications' && <NotificationsView />}
      </main>
    </div>
  );
}
