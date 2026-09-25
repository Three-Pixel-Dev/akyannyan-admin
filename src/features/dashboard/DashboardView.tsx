import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { usersService } from '../users/services/users.service';
import type { User } from '../users/types/users.types';
import { adminContentService } from '../content/services/content.service';
import { adminOracleService } from '../oracle/services/oracle.service';
import { adminPointsService } from '../points/services/points.service';
import { memberLevelsService } from '../member-levels/services/member-levels.service';

/** View ids used for quick navigation from the dashboard */
export type DashboardNavView =
  | 'member-levels'
  | 'member-level-codes'
  | 'topup-codes'
  | 'points-ledger'
  | 'su-buu'
  | 'content'
  | 'oracle'
  | 'users'
  | 'notifications';

function formatWhen(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function tierLabel(user: User): string {
  if (user.memberLevelName) return user.memberLevelName;
  if (user.memberLevelId) return `Tier #${user.memberLevelId}`;
  return 'Free';
}

function isPaidTier(user: User): boolean {
  return !!user.memberLevelId || !!user.memberLevelName;
}

interface DashboardStats {
  userTotal: number;
  contentTotal: number;
  oracleActive: number;
  oracleTotal: number;
  pricingEnabled: number;
  pricingTotal: number;
  tierTotal: number;
  recentUsers: User[];
}

export function DashboardView({ setView }: { setView: (view: DashboardNavView) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [usersPage, recentPage, contentPage, oraclePrompts, configs, levels] =
          await Promise.all([
            usersService.getAll({ page: 0, size: 1, sortBy: 'id', sortDirection: 'DESC' }),
            usersService.getAll({ page: 0, size: 6, sortBy: 'id', sortDirection: 'DESC' }),
            adminContentService.list({ page: 0, size: 1 }),
            adminOracleService.list(),
            adminPointsService.getConfigs(),
            memberLevelsService.findAllList(),
          ]);

        if (cancelled) return;

        setStats({
          userTotal: usersPage.totalItems ?? 0,
          contentTotal: contentPage.totalItems ?? 0,
          oracleActive: oraclePrompts.filter((p) => p.active).length,
          oracleTotal: oraclePrompts.length,
          pricingEnabled: configs.filter((c) => c.isEnabled).length,
          pricingTotal: configs.length,
          tierTotal: levels.length,
          recentUsers: recentPage.content ?? [],
        });
      } catch (err: any) {
        if (!cancelled) {
          showToast(err?.message || 'Dashboard data ရယူ၍ မရပါ', 'error');
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <PageHeader
        title="Welcome, Admin 👋"
        description="Live counts from the API — tiers, codes, content, and Oracle prompts."
        action={
          <div className="header-action-group">
            <Button onClick={() => setView('member-level-codes')} variant="gold">
              ⚡ Issue User Codes
            </Button>
            <Button onClick={() => setView('member-levels')} variant="jade">
              👑 User Tiers
            </Button>
          </div>
        }
      />

      <div className="metrics">
        <Metric
          icon="👤"
          label="အသုံးပြုသူများ"
          value={loading ? '…' : String(stats?.userTotal ?? '—')}
          detail="Users (API total)"
        />
        <Metric
          icon="▤"
          label="Content"
          value={loading ? '…' : String(stats?.contentTotal ?? '—')}
          detail="CMS items"
        />
        <Metric
          icon="✦"
          label="Oracle prompts"
          value={
            loading ? '…' : stats ? `${stats.oracleActive} / ${stats.oracleTotal}` : '—'
          }
          detail="Active / total templates"
        />
        <Metric
          icon="⚙️"
          label="Pricing"
          value={
            loading ? '…' : stats ? `${stats.pricingEnabled} / ${stats.pricingTotal}` : '—'
          }
          detail="Enabled stage configs"
        />
        <Metric
          icon="👑"
          label="User tiers"
          value={loading ? '…' : String(stats?.tierTotal ?? '—')}
          detail="Member levels"
        />
      </div>

      <div className="dashboard-grid">
        <Card className="wide-card table-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">RECENT</p>
              <h2>အသုံးပြုသူအသစ်များ</h2>
            </div>
            <button className="link-button" type="button" onClick={() => setView('users')}>
              အားလုံးကြည့်ရန် ›
            </button>
          </div>
          <div className="table">
            {loading ? (
              <div className="table-row">
                <div className="user-detail">
                  <b>Loading…</b>
                </div>
              </div>
            ) : !stats?.recentUsers.length ? (
              <div className="table-row">
                <div className="user-detail">
                  <b>No users yet</b>
                  <small>Create users from the Users page</small>
                </div>
              </div>
            ) : (
              stats.recentUsers.map((user) => {
                const plan = tierLabel(user);
                const paid = isPaidTier(user);
                return (
                  <div className="table-row" key={user.id}>
                    <span className="person-avatar">
                      {(user.displayName || user.email || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <div className="user-detail">
                      <b>{user.displayName || user.email || `User #${user.id}`}</b>
                      <small>
                        {[user.daySign, user.birthPlace].filter(Boolean).join(' · ') ||
                          user.email ||
                          `ID ${user.id}`}
                      </small>
                    </div>
                    <Status tone={paid ? 'gold' : 'jade'}>{plan}</Status>
                    <time>{formatWhen(user.createdAt)}</time>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="quick-card">
          <p className="eyebrow">QUICK ACTIONS</p>
          <h2>အမြန် လုပ်ဆောင်ရန်</h2>
          {(
            [
              ['👑', 'Manage User Tiers', 'member-levels'],
              ['🎟️', 'Issue User Codes', 'member-level-codes'],
              ['🎫', 'Top-up Codes', 'topup-codes'],
              ['📜', 'User History', 'points-ledger'],
              ['🏺', 'ကံစုဘူး monthly plan', 'su-buu'],
              ['🔔', 'Send notifications', 'notifications'],
              ['☀', 'Edit content', 'content'],
              ['✦', 'Oracle prompts', 'oracle'],
            ] as const
          ).map(([icon, label, viewId]) => (
            <button
              key={label}
              className="quick-action"
              type="button"
              onClick={() => setView(viewId)}
            >
              <span>{icon}</span>
              {label}
              <b>›</b>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}
