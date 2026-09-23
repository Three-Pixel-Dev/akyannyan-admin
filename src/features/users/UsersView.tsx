import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { usersService } from './services/users.service';
import { memberLevelsService } from '../member-levels/services/member-levels.service';
import type { User, CreateUserWithLoginCodeRequest, CreateBulkUsersWithLoginCodeRequest } from './types/users.types';
import type { MemberLevel } from '../member-levels/types/member-levels.types';

export function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [levels, setLevels] = useState<MemberLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | undefined>();
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState<'single' | 'bulk'>('single');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Created bulk users success modal
  const [createdUsersResult, setCreatedUsersResult] = useState<User[] | null>(null);

  // View details modal
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Single form data
  const [singleData, setSingleData] = useState<CreateUserWithLoginCodeRequest>({
    displayName: '',
    email: '',
    phoneNumber: '',
    loginCode: '',
    memberLevelId: undefined,
  });

  // Bulk form data
  const [bulkQuantity, setBulkQuantity] = useState<number>(5);
  const [bulkPrefix, setBulkPrefix] = useState<string>('AKN-');
  const [bulkLevelId, setBulkLevelId] = useState<number | undefined>();
  const [bulkCustomCodesText, setBulkCustomCodesText] = useState<string>('');
  const [bulkMode, setBulkMode] = useState<'auto' | 'custom'>('auto');

  // Copied tracker
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  // Load member levels
  useEffect(() => {
    memberLevelsService.findAllList().then((list) => {
      setLevels(list);
      if (list.length > 0) {
        setSingleData((prev) => ({ ...prev, memberLevelId: list[0].id }));
        setBulkLevelId(list[0].id);
      }
    });
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getAll({
        page,
        size,
        sortBy: 'id',
        sortDirection: 'DESC',
        filter: {
          search: search.trim() || undefined,
          memberLevelId: levelFilter,
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
        },
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size, levelFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setLevelFilter(undefined);
    setRoleFilter('ALL');
    setPage(0);
  };

  const handleCopyCode = async (user: User) => {
    if (!user.loginCode) return;
    try {
      await navigator.clipboard.writeText(user.loginCode);
      setCopiedCodeId(user.id);
      showToast(`Login code "${user.loginCode}" ကို ကူးယူပြီးပါပြီ။`, 'success');
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      showToast('ကူးယူမှု မအောင်မြင်ပါ', 'error');
    }
  };

  const handleCopyBulkResults = async () => {
    if (!createdUsersResult || createdUsersResult.length === 0) return;
    const text = createdUsersResult
      .map((u) => `${u.displayName} | Code: ${u.loginCode} | Tier: ${u.memberLevelName || 'Default'}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast(`အသုံးပြုသူ ${createdUsersResult.length} ယောက်၏ Login code များကို ကူးယူပြီးပါပြီ။`, 'success');
    } catch {
      showToast('ကူးယူမှု မအောင်မြင်ပါ', 'error');
    }
  };

  // Submit Create Single User
  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const created = await usersService.createUserWithLoginCode({
        displayName: singleData.displayName?.trim() || undefined,
        email: singleData.email?.trim() || undefined,
        phoneNumber: singleData.phoneNumber?.trim() || undefined,
        loginCode: singleData.loginCode?.trim() ? singleData.loginCode.trim().toUpperCase() : undefined,
        memberLevelId: singleData.memberLevelId,
      });
      showToast(`အသုံးပြုသူ "${created.displayName}" ကို Login Code ဖြင့် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။`, 'success');
      setIsCreateOpen(false);
      setSingleData({
        displayName: '',
        email: '',
        phoneNumber: '',
        loginCode: '',
        memberLevelId: levels[0]?.id,
      });
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || 'အသုံးပြုသူ ဖန်တီးမှု မအောင်မြင်ပါ');
    } finally {
      setCreating(false);
    }
  };

  // Submit Create Bulk Users
  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      let customCodes: string[] | undefined = undefined;
      if (bulkMode === 'custom') {
        customCodes = bulkCustomCodesText
          .split('\n')
          .map((s) => s.trim().toUpperCase())
          .filter((s) => s.length > 0);
        if (customCodes.length === 0) {
          setCreateError('ကျေးဇူးပြု၍ စိတ်ကြိုက် ကုဒ်များကို တစ်ကြောင်းလျှင် တစ်ခု ရိုက်ထည့်ပါ (Please enter custom codes).');
          setCreating(false);
          return;
        }
      }

      const payload: CreateBulkUsersWithLoginCodeRequest = {
        quantity: bulkMode === 'auto' ? bulkQuantity : customCodes?.length,
        prefix: bulkPrefix.trim().toUpperCase(),
        customCodes,
        memberLevelId: bulkLevelId,
      };

      const createdList = await usersService.createBulkUsersWithLoginCode(payload);
      showToast(`အသုံးပြုသူ ${createdList.length} ယောက်ကို Login Code များနှင့်တကွ အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။`, 'success');
      setIsCreateOpen(false);
      setCreatedUsersResult(createdList);
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || 'အစုလိုက် ဖန်တီးမှု မအောင်မြင်ပါ');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (user.role === 'ADMIN') {
      showToast('Cannot deactivate an admin account.', 'error');
      return;
    }
    const nextActive = !user.active;
    try {
      await usersService.setUserActive(user.id, nextActive);
      showToast(
        nextActive
          ? `User "${user.displayName}" activated.`
          : `User "${user.displayName}" deactivated.`,
        nextActive ? 'success' : 'info',
      );
      setDeletingUser(null);
      if (viewingUser?.id === user.id) {
        setViewingUser({ ...viewingUser, active: nextActive });
      }
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Could not update user status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    await handleToggleActive(deletingUser);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const BURMESE_MONTHS_MAP: Record<number, string> = {
    1: 'ဇန်နဝါရီ',
    2: 'ဖေဖော်ဝါရီ',
    3: 'မတ်',
    4: 'ဧပြီ',
    5: 'မေ',
    6: 'ဇွန်',
    7: 'ဇူလိုင်',
    8: 'ဩဂုတ်',
    9: 'စက်တင်ဘာ',
    10: 'အောက်တိုဘာ',
    11: 'နိုဝင်ဘာ',
    12: 'ဒီဇင်ဘာ',
  };

  const formatBirthDate = (user: User) => {
    if (user.birthYear && user.birthMonth && user.birthDay) {
      const monthName = BURMESE_MONTHS_MAP[user.birthMonth] || `${user.birthMonth} လ`;
      return `${user.birthDay} ${monthName} ${user.birthYear} (${user.birthDay}/${user.birthMonth}/${user.birthYear})`;
    }
    if (user.birthDate) {
      return user.birthDate;
    }
    return 'မသတ်မှတ်ရသေးပါ (Not set)';
  };

  const formatBirthTime = (user: User) => {
    if (user.birthTimeUnknown) {
      return 'မွေးချိန်မသိပါ (Unknown)';
    }
    if (user.birthHour !== undefined && user.birthMinute !== undefined) {
      const h = user.birthHour;
      const m = user.birthMinute.toString().padStart(2, '0');
      const ap = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${m} ${ap} (${h.toString().padStart(2, '0')}:${m})`;
    }
    if (user.birthTime) {
      return user.birthTime;
    }
    return '—';
  };

  return (
    <div className="page">
      <PageHeader
        title="Users"
        description="Manage accounts, login codes, user tiers, and activate or deactivate access."
        action={
          <Button
            onClick={() => {
              setIsCreateOpen(true);
              setCreateError(null);
            }}
            variant="jade"
            aria-label="Create new user with login code"
          >
            ＋ Add User
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="metrics">
        <Metric
          icon="👥"
          label="TOTAL USERS"
          value={totalItems.toString()}
          detail="All users in the system"
        />
        <Metric
          icon="🔑"
          label="LOGIN CODE USERS"
          value={users.filter((u) => !!u.loginCode).length.toString()}
          detail="Users who sign in with a code"
        />
        <Metric
          icon="💎"
          label="PREMIUM TIERS"
          value={users.filter((u) => u.memberLevelId && u.memberLevelName !== 'Free Tier').length.toString()}
          detail="Users on a paid tier"
        />
        <Metric
          icon="🟢"
          label="ACTIVE USERS"
          value={users.filter((u) => u.active).length.toString()}
          detail="Accounts that can sign in"
        />
      </div>

      {/* Filters & Table Card */}
      <Card className="resource-card">
        <div className="filter-toolbar">
          {/* Member Level Filter */}
          <div className="filter-field">
            <label htmlFor="user-filter-level">User Tier:</label>
            <select
              id="user-filter-level"
              value={levelFilter || ''}
              onChange={(e) => {
                setLevelFilter(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(0);
              }}
              className="form-select"
            >
              <option value="">All Tiers</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="filter-field">
            <label htmlFor="user-filter-role">Role:</label>
            <select
              id="user-filter-role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="form-select"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="search-box filter-search">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="အမည်၊ အီးမေးလ်၊ Login Code ရှာရန်..."
              aria-label="Search users"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearch('');
                  setPage(0);
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
            <button type="submit" className="button ghost search-submit-btn">
              ရှာမည်
            </button>
          </form>

          {(levelFilter !== undefined || roleFilter !== 'ALL' || search) && (
            <button
              type="button"
              className="button ghost reset-filter-btn"
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              ✕ Filter ရှင်းမည်
            </button>
          )}
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="table-loading">
            <span className="spinner" aria-hidden="true" />
            <p>အသုံးပြုသူ စာရင်း ဆွဲယူနေပါသည်...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>အသုံးပြုသူ မရှိသေးပါ</h3>
            <p>Login Code ဖြင့် အသုံးပြုသူ အသစ်များကို စတင်ဖန်တီးနိုင်ပါသည်။</p>
            <Button
              onClick={() => {
                setIsCreateOpen(true);
                setCreateError(null);
              }}
              variant="jade"
            >
              ＋ ပထမဆုံး အသုံးပြုသူ ထည့်မည်
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" aria-label="Users management table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Login Code</th>
                  <th scope="col">Role</th>
                  <th scope="col">User Tier</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">လုပ်ဆောင်ချက် (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-profile-row">
                        <span className="person-avatar">
                          {(u.displayName || 'U').slice(0, 1).toUpperCase()}
                        </span>
                        <div className="user-cell-meta">
                          <b>{u.displayName}</b>
                          <small>{u.email}</small>
                          {u.phoneNumber && <small className="phone-tag">📞 {u.phoneNumber}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.loginCode ? (
                        <div className="code-cell-wrapper">
                          <code className="code-pill">{u.loginCode}</code>
                          <button
                            type="button"
                            className={`copy-code-btn ${copiedCodeId === u.id ? 'copied' : ''}`}
                            onClick={() => handleCopyCode(u)}
                            title="Copy Login Code"
                            aria-label={`Copy login code for ${u.displayName}`}
                          >
                            {copiedCodeId === u.id ? '✓ ကူးပြီး' : '📋 ကူးမည်'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">— Email Login —</span>
                      )}
                    </td>
                    <td>
                      {u.role === 'ADMIN' ? (
                        <Status tone="gold">👑 ADMIN</Status>
                      ) : (
                        <Status tone="jade">USER</Status>
                      )}
                    </td>
                    <td>
                      {u.memberLevelName ? (
                        <div className="tier-info-cell">
                          <span className="tier-tag">{u.memberLevelName}</span>
                          {u.premiumExpiresAt && (
                            <small className="cell-subtext">
                              ကုန်ဆုံး: {formatDate(u.premiumExpiresAt)}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">— No tier —</span>
                      )}
                    </td>
                    <td>
                      {u.active ? (
                        <Status tone="jade">ACTIVE</Status>
                      ) : (
                        <Status tone="danger">INACTIVE</Status>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="action-btn action-edit"
                          onClick={() => setViewingUser(u)}
                          title="View details"
                          aria-label={`View details for ${u.displayName}`}
                        >
                          👁️ Details
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            type="button"
                            className={`action-btn ${u.active ? 'action-delete' : 'action-edit'}`}
                            onClick={() => setDeletingUser(u)}
                            title={u.active ? 'Deactivate user' : 'Activate user'}
                            aria-label={
                              u.active
                                ? `Deactivate ${u.displayName}`
                                : `Activate ${u.displayName}`
                            }
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalItems > 0 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              <span>
                စုစုပေါင်း <b>{totalItems}</b> ယောက်တွင်{' '}
                <b>{page * size + 1} - {Math.min((page + 1) * size, totalItems)}</b> ပြသနေသည်
              </span>
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="button ghost pagination-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous page"
              >
                ‹ ရှေ့သို့ (Prev)
              </button>
              <span className="pagination-page-indicator">
                စာမျက်နှာ <b>{page + 1}</b> / <b>{Math.max(1, totalPages)}</b>
              </span>
              <button
                type="button"
                className="button ghost pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next page"
              >
                နောက်သို့ (Next) ›
              </button>

              <select
                value={size}
                onChange={(e) => {
                  setSize(parseInt(e.target.value));
                  setPage(0);
                }}
                className="form-select size-select"
                aria-label="Items per page"
              >
                <option value={10}>၁၀ ယောက်စီ</option>
                <option value={20}>၂၀ ယောက်စီ</option>
                <option value={50}>၅၀ ယောက်စီ</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Create User Dialog with Single / Bulk Login Code flow */}
      {isCreateOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
          <div className="modal-backdrop" onClick={() => !creating && setIsCreateOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="create-user-title">＋ Login Code ဖြင့် အသုံးပြုသူ ဖန်တီးမည်</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="tabs-nav" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={createTab === 'single'}
                className={`tab-btn ${createTab === 'single' ? 'active' : ''}`}
                onClick={() => setCreateTab('single')}
              >
                👤 တစ်ဦးချင်း ထည့်မည် (Single User)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={createTab === 'bulk'}
                className={`tab-btn ${createTab === 'bulk' ? 'active' : ''}`}
                onClick={() => setCreateTab('bulk')}
              >
                ⚡ အစုလိုက် ထုတ်မည် (Bulk Users Flow)
              </button>
            </div>

            {createError && (
              <div className="alert alert-danger" role="alert">
                <span>⚠️ {createError}</span>
              </div>
            )}

            {createTab === 'single' ? (
              /* Single User Form */
              <form onSubmit={handleCreateSingle} className="modal-form">
                <div className="form-group">
                  <label htmlFor="single-display-name">အမည် (Display Name)</label>
                  <input
                    id="single-display-name"
                    type="text"
                    placeholder="မောင်အောင် / AKN Member (ဗလာထားပါက Auto-generate ဖြစ်မည်)"
                    value={singleData.displayName || ''}
                    onChange={(e) => setSingleData({ ...singleData, displayName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="single-email">အီးမေးလ် (Email - Optional)</label>
                    <input
                      id="single-email"
                      type="email"
                      placeholder="user@example.com"
                      value={singleData.email || ''}
                      onChange={(e) => setSingleData({ ...singleData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="single-phone">ဖုန်းနံပါတ် (Phone - Optional)</label>
                    <input
                      id="single-phone"
                      type="text"
                      placeholder="09xxxxxxxxx"
                      value={singleData.phoneNumber || ''}
                      onChange={(e) => setSingleData({ ...singleData, phoneNumber: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="single-login-code">စိတ်ကြိုက် Login Code (Custom Login Code)</label>
                  <input
                    id="single-login-code"
                    type="text"
                    placeholder="ဥပမာ - AKN-USER-9988 (ဗလာထားပါက Auto-generate ဖြစ်မည်)"
                    value={singleData.loginCode || ''}
                    onChange={(e) => setSingleData({ ...singleData, loginCode: e.target.value })}
                    className="form-input"
                  />
                  <small className="form-hint">
                    အသုံးပြုသူသည် ဤ Login Code ဖြင့် Mobile App (သို့) ဝန်ဆောင်မှုထဲသို့ ချက်ချင်း Login ဝင်ရောက်နိုင်မည်။
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="single-tier">အသင်းဝင် အဆင့် (Member Tier)</label>
                  <select
                    id="single-tier"
                    value={singleData.memberLevelId || ''}
                    onChange={(e) =>
                      setSingleData({
                        ...singleData,
                        memberLevelId: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="form-input"
                  >
                    <option value="">-- အဆင့် ရွေးချယ်ပါ --</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.durationDays ? `${l.durationDays} ရက်` : 'အကန့်အသတ်မဲ့'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={creating}
                  >
                    မလုပ်တော့ပါ (Cancel)
                  </Button>
                  <Button type="submit" variant="jade" disabled={creating}>
                    {creating ? 'ဖန်တီးနေပါသည်...' : '＋ အသုံးပြုသူ ဖန်တီးမည်'}
                  </Button>
                </div>
              </form>
            ) : (
              /* Bulk Users Flow */
              <form onSubmit={handleCreateBulk} className="modal-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="bulk-quantity">ထုတ်ဝေမည့် အကောင့်အရေအတွက် (Quantity)</label>
                    <select
                      id="bulk-quantity"
                      value={bulkQuantity}
                      onChange={(e) => setBulkQuantity(parseInt(e.target.value))}
                      className="form-input"
                      disabled={bulkMode === 'custom'}
                    >
                      <option value={5}>၅ ယောက် (5 Users)</option>
                      <option value={10}>၁၀ ယောက် (10 Users)</option>
                      <option value={20}>၂၀ ယောက် (20 Users)</option>
                      <option value={50}>၅၀ ယောက် (50 Users)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bulk-prefix">ကုဒ် ရှေ့ဆက်စကားလုံး (Prefix)</label>
                    <input
                      id="bulk-prefix"
                      type="text"
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      placeholder="AKN-"
                      className="form-input"
                      disabled={bulkMode === 'custom'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bulk-tier">အသင်းဝင် အဆင့် (Member Tier)</label>
                  <select
                    id="bulk-tier"
                    value={bulkLevelId || ''}
                    onChange={(e) => setBulkLevelId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="form-input"
                  >
                    <option value="">-- အဆင့် ရွေးချယ်ပါ --</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.durationDays ? `${l.durationDays} ရက်` : 'အကန့်အသတ်မဲ့'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Codes Option */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="bulk-custom-codes">သို့မဟုတ် စိတ်ကြိုက် ကုဒ်များ တိုက်ရိုက်ထည့်မည်</label>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setBulkMode(bulkMode === 'auto' ? 'custom' : 'auto')}
                    >
                      {bulkMode === 'custom' ? '✓ Auto-generation ပြန်သုံးမည်' : '✏️ Custom Codes ရိုက်ထည့်မည်'}
                    </button>
                  </div>
                  {bulkMode === 'custom' && (
                    <textarea
                      id="bulk-custom-codes"
                      rows={4}
                      placeholder="ကုဒ်တစ်ခုစီကို တစ်ကြောင်းစီ ရိုက်ထည့်ပါ:&#10;AKN-VIP-001&#10;AKN-VIP-002&#10;AKN-VIP-003"
                      value={bulkCustomCodesText}
                      onChange={(e) => setBulkCustomCodesText(e.target.value)}
                      className="form-input"
                    />
                  )}
                </div>

                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={creating}
                  >
                    မလုပ်တော့ပါ (Cancel)
                  </Button>
                  <Button type="submit" variant="gold" disabled={creating}>
                    {creating ? 'ဖန်တီးနေပါသည်...' : `⚡ အကောင့် ${bulkMode === 'auto' ? bulkQuantity : 'Custom'} ခု ထုတ်ဝေမည်`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bulk Creation Results Modal */}
      {createdUsersResult && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="bulk-result-title">
          <div className="modal-backdrop" onClick={() => setCreatedUsersResult(null)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="bulk-result-title" className="text-jade">
                🎉 အသုံးပြုသူ {createdUsersResult.length} ယောက် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCreatedUsersResult(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="modal-subtext">
              အောက်ပါ Login Code များကို အသုံးပြုသူများထံ ဖြန့်ဝေ၍ ချက်ချင်း အကောင့်ဝင်ရောက်ခွင့် ပေးနိုင်ပါသည်။
            </p>

            <div className="bulk-results-list">
              {createdUsersResult.map((u) => (
                <div key={u.id} className="bulk-result-row">
                  <div>
                    <b>{u.displayName}</b>
                    <small>{u.memberLevelName || 'Default Tier'}</small>
                  </div>
                  <code className="code-pill">{u.loginCode}</code>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setCreatedUsersResult(null)}>
                ပိတ်မည် (Close)
              </Button>
              <Button type="button" variant="jade" onClick={handleCopyBulkResults}>
                📋 ကုဒ်အားလုံး ကူးမည် (Copy All)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {viewingUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="view-user-title">
          <div className="modal-backdrop" onClick={() => setViewingUser(null)} />
          <div className="modal-content modal-content-sm">
            <div className="modal-header">
              <h2 id="view-user-title">👤 အသုံးပြုသူ အချက်အလက်</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingUser(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="user-details-card">
              <div className="user-details-header">
                <span className="person-avatar large">
                  {(viewingUser.displayName || 'U').slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h3>{viewingUser.displayName}</h3>
                  <small>{viewingUser.email}</small>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span>Login Code:</span>
                  <b>{viewingUser.loginCode || 'None (Email Login)'}</b>
                </div>
                <div className="detail-item">
                  <span>Role:</span>
                  <Status tone={viewingUser.role === 'ADMIN' ? 'gold' : 'jade'}>
                    {viewingUser.role}
                  </Status>
                </div>
                <div className="detail-item">
                  <span>Member Tier:</span>
                  <b>{viewingUser.memberLevelName || 'None'}</b>
                </div>
                <div className="detail-item">
                  <span>Status:</span>
                  <b>{viewingUser.active ? 'Active' : 'Inactive'}</b>
                </div>
                <div className="detail-item">
                  <span>မွေးသက္ကရာဇ် (Date of Birth):</span>
                  <b className={viewingUser.birthYear ? 'text-jade' : 'text-muted'}>
                    {formatBirthDate(viewingUser)}
                  </b>
                </div>
                <div className="detail-item">
                  <span>မွေးချိန် (Birth Time):</span>
                  <b>{formatBirthTime(viewingUser)}</b>
                </div>
                <div className="detail-item">
                  <span>မွေးနံ (Day Sign):</span>
                  <b>{viewingUser.daySign ? `🪐 ${viewingUser.daySign}` : '—'}</b>
                </div>
                <div className="detail-item">
                  <span>ကျား / မ (Gender):</span>
                  <b>{viewingUser.gender || '—'}</b>
                </div>
                <div className="detail-item">
                  <span>မွေးရပ်ဒေသ (Birth Place):</span>
                  <b>{viewingUser.birthPlace || '—'}</b>
                </div>
                <div className="detail-item">
                  <span>Premium Expires:</span>
                  <b>{formatDate(viewingUser.premiumExpiresAt)}</b>
                </div>
                <div className="detail-item">
                  <span>Created At:</span>
                  <b>{formatDate(viewingUser.createdAt)}</b>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setViewingUser(null)}>
                ပိတ်မည် (Close)
              </Button>
              {viewingUser.loginCode && (
                <Button
                  type="button"
                  variant="jade"
                  onClick={() => handleCopyCode(viewingUser)}
                >
                  📋 Login Code ကူးမည်
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activate / Deactivate User Dialog */}
      {deletingUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
          <div className="modal-backdrop" onClick={() => setDeletingUser(null)} />
          <div className="modal-content modal-content-sm">
            <div className="modal-header">
              <h2 id="delete-user-title" className={deletingUser.active ? 'text-danger' : ''}>
                {deletingUser.active ? 'Deactivate user?' : 'Activate user?'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingUser(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                {deletingUser.active ? (
                  <>
                    Deactivate <b>"{deletingUser.displayName}"</b>? They will not be able to sign in.
                  </>
                ) : (
                  <>
                    Activate <b>"{deletingUser.displayName}"</b>? They will be able to sign in again.
                  </>
                )}
              </p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <button
                type="button"
                className={`button ${deletingUser.active ? 'danger-btn' : ''}`}
                onClick={handleDeleteConfirm}
              >
                {deletingUser.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
