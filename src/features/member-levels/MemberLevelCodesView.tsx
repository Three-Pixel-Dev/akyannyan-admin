import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { memberLevelsService } from './services/member-levels.service';
import { memberLevelsCodeService } from './services/member-levels-code.service';
import type { MemberLevel } from './types/member-levels.types';
import type {
  MemberLevelCode,
  MemberLevelCodeBulkGenerateRequest,
  MemberLevelCodeRequest,
} from './types/member-levels-code.types';

interface MemberLevelCodesViewProps {
  initialMemberLevelId?: number;
}

export function MemberLevelCodesView({ initialMemberLevelId }: MemberLevelCodesViewProps) {
  const [codes, setCodes] = useState<MemberLevelCode[]>([]);
  const [levels, setLevels] = useState<MemberLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedLevelId, setSelectedLevelId] = useState<number | undefined>(initialMemberLevelId);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [codeSearch, setCodeSearch] = useState<string>('');

  // Dialog states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<MemberLevelCode | null>(null);
  const [deletingCode, setDeletingCode] = useState<MemberLevelCode | null>(null);

  // Generation Form State
  const [generateTab, setGenerateTab] = useState<'bulk' | 'single'>('bulk');
  const [genLevelId, setGenLevelId] = useState<number | undefined>(initialMemberLevelId);
  const [genCount, setGenCount] = useState<number>(10);
  const [genPrefix, setGenPrefix] = useState<string>('AKN-');
  const [singleCodeInput, setSingleCodeInput] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Edit Code Form State
  const [editLevelId, setEditLevelId] = useState<number | undefined>();
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Copied code tracker for animation
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  // Load levels for dropdown
  useEffect(() => {
    memberLevelsService.findAllList().then((list) => {
      setLevels(list);
      if (!genLevelId && list.length > 0) {
        setGenLevelId(list[0].id);
      }
    });
  }, []);

  // Fetch codes
  const fetchCodes = async () => {
    setLoading(true);
    try {
      const data = await memberLevelsCodeService.getAll({
        page,
        size,
        sortBy: 'id',
        sortDirection: 'DESC',
        filter: {
          memberLevelId: selectedLevelId,
          code: codeSearch.trim() || undefined,
          status: statusFilter,
        },
      });
      setCodes(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (err: any) {
      showToast(err.message || 'Failed to load codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page, size, selectedLevelId, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCodes();
  };

  const handleClearFilters = () => {
    setSelectedLevelId(undefined);
    setStatusFilter('ALL');
    setCodeSearch('');
    setPage(0);
  };

  // 1-Click Copy code
  const handleCopyCode = async (code: MemberLevelCode) => {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopiedCodeId(code.id);
      showToast(`ကုဒ် "${code.code}" ကို Clipboard ထဲသို့ ကူးယူပြီးပါပြီ။`, 'success');
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      showToast('ကူးယူမှု မအောင်မြင်ပါ', 'error');
    }
  };

  // Copy all visible codes
  const handleCopyAllCodes = async () => {
    if (codes.length === 0) return;
    const allText = codes.map((c) => c.code).join('\n');
    try {
      await navigator.clipboard.writeText(allText);
      showToast(`ကုဒ် ${codes.length} ခုလုံးကို ကူးယူပြီးပါပြီ။`, 'success');
    } catch {
      showToast('ကူးယူမှု မအောင်မြင်ပါ', 'error');
    }
  };

  // Handle generation submission
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genLevelId) {
      setGenerationError('ကျေးဇူးပြု၍ အသင်းဝင်အဆင့်ကို ရွေးချယ်ပါ (Please select a member tier).');
      return;
    }

    setGenerating(true);
    setGenerationError(null);

    try {
      const selectedTier = levels.find((l) => l.id === genLevelId);
      const tierDays = selectedTier?.durationDays && selectedTier.durationDays > 0
        ? selectedTier.durationDays
        : undefined;

      if (generateTab === 'bulk') {
        const payload: MemberLevelCodeBulkGenerateRequest = {
          memberLevelId: genLevelId,
          count: genCount,
          prefix: genPrefix.trim().toUpperCase(),
          expiryDays: tierDays,
        };
        const created = await memberLevelsCodeService.bulkGenerate(payload);
        showToast(`ကုဒ် ${created.length} ခု အောင်မြင်စွာ ထုတ်ဝေပြီးပါပြီ။`, 'success');
      } else {
        const payload: MemberLevelCodeRequest = {
          memberLevelId: genLevelId,
          code: singleCodeInput.trim() ? singleCodeInput.trim().toUpperCase() : undefined,
          expiredAt: tierDays
            ? new Date(Date.now() + tierDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        };
        await memberLevelsCodeService.create(payload);
        showToast('ကုဒ်အသစ် ၁ ခု အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။', 'success');
      }

      setIsGenerateModalOpen(false);
      setSingleCodeInput('');
      fetchCodes();
    } catch (err: any) {
      setGenerationError(err.message || 'ထုတ်ဝေမှု မအောင်မြင်ပါ');
    } finally {
      setGenerating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (code: MemberLevelCode) => {
    setEditingCode(code);
    setEditLevelId(code.memberLevelId);
    setEditExpiryDate(code.expiredAt ? code.expiredAt.slice(0, 10) : '');
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode || !editLevelId) return;

    setSavingEdit(true);
    try {
      await memberLevelsCodeService.update(editingCode.id, {
        memberLevelId: editLevelId,
        expiredAt: editExpiryDate ? new Date(editExpiryDate).toISOString() : undefined,
      });
      showToast(`ကုဒ် "${editingCode.code}" ကို ပြင်ဆင်ပြီးပါပြီ။`, 'success');
      setIsEditModalOpen(false);
      fetchCodes();
    } catch (err: any) {
      showToast(err.message || 'ပြင်ဆင်မှု မအောင်မြင်ပါ', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingCode) return;
    try {
      await memberLevelsCodeService.delete(deletingCode.id);
      showToast(`ကုဒ် "${deletingCode.code}" ကို ဖျက်သိမ်းပြီးပါပြီ။`, 'info');
      setDeletingCode(null);
      fetchCodes();
    } catch (err: any) {
      showToast(err.message || 'ဖျက်သိမ်းမှု မအောင်မြင်ပါ', 'error');
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="User Codes"
        description="Issue and manage activation codes that assign a user tier on first login."
        action={
          <div className="header-action-group">
            {codes.length > 0 && (
              <Button onClick={handleCopyAllCodes} variant="ghost" aria-label="Copy all visible codes">
                📋 Copy All
              </Button>
            )}
            <Button
              onClick={() => {
                setIsGenerateModalOpen(true);
                setGenerationError(null);
              }}
              variant="jade"
              aria-label="Issue new user codes"
            >
              ＋ Issue User Codes
            </Button>
          </div>
        }
      />

      {/* Stats row */}
      <div className="metrics">
        <Metric
          icon="🎟️"
          label="TOTAL CODES"
          value={totalItems.toString()}
          detail="All user codes in the system"
        />
        <Metric
          icon="🟢"
          label="AVAILABLE"
          value={codes.filter((c) => c.status === 'AVAILABLE').length.toString()}
          detail="Ready to assign on this page"
        />
        <Metric
          icon="⭐"
          label="REDEEMED"
          value={codes.filter((c) => c.status === 'REDEEMED').length.toString()}
          detail="Already activated by users"
        />
        <Metric
          icon="⏳"
          label="EXPIRED"
          value={codes.filter((c) => c.status === 'EXPIRED').length.toString()}
          detail="Past expiry date"
        />
      </div>

      {/* Filtering Toolbar */}
      <Card className="resource-card">
        <div className="filter-toolbar">
          {/* Tier Dropdown */}
          <div className="filter-field">
            <label htmlFor="filter-level">User Tier:</label>
            <select
              id="filter-level"
              value={selectedLevelId || ''}
              onChange={(e) => {
                setSelectedLevelId(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(0);
              }}
              className="form-select"
            >
              <option value="">အားလုံး (All Tiers)</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="filter-field">
            <label htmlFor="filter-status">အခြေအနေ (Status):</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="form-select"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="REDEEMED">Redeemed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="search-box filter-search">
            <input
              type="text"
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              placeholder="Search code..."
              aria-label="Search code"
            />
            {codeSearch && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setCodeSearch('');
                  setPage(0);
                }}
                aria-label="Clear code search"
              >
                ×
              </button>
            )}
            <button type="submit" className="button ghost search-submit-btn">
              ရှာမည်
            </button>
          </form>

          {(selectedLevelId !== undefined || statusFilter !== 'ALL' || codeSearch) && (
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
            <p>ကုဒ်များ ဆွဲယူနေပါသည်...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎟️</span>
            <h3>ကိုက်ညီသော ကုဒ် မတွေ့ရှိပါ</h3>
            <p>ရွေးချယ်ထားသော Filter နှင့် ကိုက်ညီသော ကုဒ်များ မရှိသေးပါ။ အသစ် ထုတ်ဝေနိုင်ပါသည်။</p>
            <Button
              onClick={() => {
                setIsGenerateModalOpen(true);
                setGenerationError(null);
              }}
              variant="jade"
            >
              ＋ ကုဒ် အသစ် ထုတ်မည်
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" aria-label="Member level codes table">
              <thead>
                <tr>
                  <th scope="col">ကုဒ် (Code)</th>
                  <th scope="col">အဆင့် (Member Tier)</th>
                  <th scope="col">အခြေအနေ (Status)</th>
                  <th scope="col">အသုံးပြုသူ (Redeemed By)</th>
                  <th scope="col">သက်တမ်းကုန်ရက် (Expires At)</th>
                  <th scope="col" className="text-right">လုပ်ဆောင်ချက် (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="code-cell-wrapper">
                        <code className="code-pill">{item.code}</code>
                        <button
                          type="button"
                          className={`copy-code-btn ${copiedCodeId === item.id ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(item)}
                          title="Click to copy code"
                          aria-label={`Copy code ${item.code}`}
                        >
                          {copiedCodeId === item.id ? '✓ ကူးပြီး' : '📋 ကူးမည်'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="tier-tag">{item.memberLevelName || '—'}</span>
                    </td>
                    <td>
                      {item.status === 'AVAILABLE' && (
                        item.userId ? (
                          <Status tone="jade">⚡ PENDING LOGIN</Status>
                        ) : (
                          <Status tone="jade">🟢 AVAILABLE</Status>
                        )
                      )}
                      {item.status === 'REDEEMED' && (
                        <Status tone="gold">⭐ REDEEMED</Status>
                      )}
                      {item.status === 'EXPIRED' && (
                        <Status tone="danger">⏳ EXPIRED</Status>
                      )}
                    </td>
                    <td>
                      {item.userDisplayName || item.userEmail ? (
                        <div className="redeemed-user-info">
                          <b>{item.userDisplayName || 'User'}</b>
                          <small>{item.userEmail}</small>
                          {item.activatedAt ? (
                            <span className="activated-date">
                              အသက်သွင်းရက်: {formatDate(item.activatedAt)}
                            </span>
                          ) : (
                            <span className="activated-date" style={{ color: 'var(--color-gold, #e8b54d)' }}>
                              ⚡ စတင်ဝင်ရောက်ချိန်တွင် အသက်ဝင်မည်
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">— မသုံးရသေးပါ —</span>
                      )}
                    </td>
                    <td>
                      <span className="cell-date">
                        {item.expiredAt ? formatDate(item.expiredAt) : '— ဝင်ရောက်ချိန်တွက်မည် —'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="action-btn action-edit"
                          onClick={() => handleOpenEdit(item)}
                          title="သက်တမ်းပြင်မည်"
                          aria-label={`Edit expiration for ${item.code}`}
                        >
                          ✏️ ပြင်မည်
                        </button>
                        <button
                          type="button"
                          className="action-btn action-delete"
                          onClick={() => setDeletingCode(item)}
                          title="ဖျက်သိမ်းမည်"
                          aria-label={`Delete code ${item.code}`}
                        >
                          🗑️
                        </button>
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
                စုစုပေါင်း <b>{totalItems}</b> ခုတွင်{' '}
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
                <option value={10}>၁၀ ခုစီ</option>
                <option value={20}>၂၀ ခုစီ</option>
                <option value={50}>၅၀ ခုစီ</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Generate Codes Modal */}
      {isGenerateModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="generate-modal-title">
          <div className="modal-backdrop" onClick={() => !generating && setIsGenerateModalOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="generate-modal-title">⚡ အသင်းဝင်ကုဒ် အသစ် ထုတ်ဝေမည်</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={generating}
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
                aria-selected={generateTab === 'bulk'}
                className={`tab-btn ${generateTab === 'bulk' ? 'active' : ''}`}
                onClick={() => setGenerateTab('bulk')}
              >
                ⚡ အစုလိုက် ထုတ်မည် (Bulk Generator)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={generateTab === 'single'}
                className={`tab-btn ${generateTab === 'single' ? 'active' : ''}`}
                onClick={() => setGenerateTab('single')}
              >
                ✏️ တစ်ခုချင်း ထည့်မည် (Single Code)
              </button>
            </div>

            {generationError && (
              <div className="alert alert-danger" role="alert">
                <span>⚠️ {generationError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="gen-modal-level">အသင်းဝင် အဆင့် (Member Tier) *</label>
                <select
                  id="gen-modal-level"
                  required
                  value={genLevelId || ''}
                  onChange={(e) => setGenLevelId(parseInt(e.target.value) || undefined)}
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

              {generateTab === 'bulk' ? (
                <>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="gen-modal-count">ထုတ်ဝေမည့် အရေအတွက် (Count)</label>
                      <select
                        id="gen-modal-count"
                        value={genCount}
                        onChange={(e) => setGenCount(parseInt(e.target.value))}
                        className="form-input"
                      >
                        <option value={5}>၅ ခု (5 codes)</option>
                        <option value={10}>၁၀ ခု (10 codes)</option>
                        <option value={20}>၂၀ ခု (20 codes)</option>
                        <option value={50}>၅၀ ခု (50 codes)</option>
                        <option value={100}>၁၀၀ ခု (100 codes)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="gen-modal-prefix">ကုဒ် ရှေ့ဆက် စကားလုံး (Prefix)</label>
                      <input
                        id="gen-modal-prefix"
                        type="text"
                        value={genPrefix}
                        onChange={(e) => setGenPrefix(e.target.value)}
                        placeholder="AKN-"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {genLevelId ? (
                    <p className="form-hint" style={{ marginTop: 4 }}>
                      သက်တမ်း — ရွေးထားသော User Tier အတိုင်း (
                      {levels.find((l) => l.id === genLevelId)?.durationDays
                        ? `${levels.find((l) => l.id === genLevelId)?.durationDays} ရက်`
                        : 'အကန့်အသတ်မဲ့'}
                      )
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="gen-single-code">စိတ်ကြိုက် ကုဒ် (Custom Code - Optional)</label>
                    <input
                      id="gen-single-code"
                      type="text"
                      value={singleCodeInput}
                      onChange={(e) => setSingleCodeInput(e.target.value)}
                      placeholder="ဥပမာ - AKN-LUCKY-2026 (ဗလာထားပါက Auto-generate ဖြစ်မည်)"
                      className="form-input"
                    />
                    <small className="form-hint">
                      မထည့်သွင်းပါက စနစ်မှ Random Code ထုတ်ပေးပါမည်။
                    </small>
                  </div>

                  {genLevelId ? (
                    <p className="form-hint">
                      သက်တမ်း — ရွေးထားသော User Tier အတိုင်း (
                      {levels.find((l) => l.id === genLevelId)?.durationDays
                        ? `${levels.find((l) => l.id === genLevelId)?.durationDays} ရက်`
                        : 'အကန့်အသတ်မဲ့'}
                      )
                    </p>
                  ) : null}
                </>
              )}

              <div className="modal-footer">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsGenerateModalOpen(false)}
                  disabled={generating}
                >
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade" disabled={generating}>
                  {generating
                    ? 'ထုတ်ဝေနေပါသည်...'
                    : generateTab === 'bulk'
                    ? `⚡ ကုဒ် ${genCount} ခု အစုလိုက် ထုတ်မည်`
                    : '＋ ကုဒ် ထည့်သွင်းမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Code Modal */}
      {isEditModalOpen && editingCode && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-code-title">
          <div className="modal-backdrop" onClick={() => !savingEdit && setIsEditModalOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="edit-code-title">✏️ ကုဒ် ပြင်ဆင်မည် - {editingCode.code}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                disabled={savingEdit}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-code-level">အသင်းဝင် အဆင့် (Member Tier)</label>
                <select
                  id="edit-code-level"
                  value={editLevelId || ''}
                  onChange={(e) => setEditLevelId(parseInt(e.target.value))}
                  className="form-input"
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-code-expiry">သက်တမ်းကုန်ဆုံးမည့်ရက် (Expiry Date)</label>
                <input
                  id="edit-code-expiry"
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={savingEdit}
                >
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade" disabled={savingEdit}>
                  {savingEdit ? 'သိမ်းဆည်းနေပါသည်...' : 'အပြောင်းအလဲ သိမ်းမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Code Confirmation Dialog */}
      {deletingCode && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-code-title">
          <div className="modal-backdrop" onClick={() => setDeletingCode(null)} />
          <div className="modal-content modal-content-sm">
            <div className="modal-header">
              <h2 id="delete-code-title" className="text-danger">⚠️ ကုဒ် ဖျက်သိမ်းရန် အတည်ပြုပါ</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingCode(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                ကုဒ် <b>"{deletingCode.code}"</b> ကို ဖျက်သိမ်းရန် သေချာပါသလား?
              </p>
              <small className="text-muted">
                ဤကုဒ်ကို ဖျက်လိုက်ပါက အသုံးပြုသူများ အသက်သွင်းနိုင်တော့မည် မဟုတ်ပါ။
              </small>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setDeletingCode(null)}>
                မလုပ်တော့ပါ (Cancel)
              </Button>
              <button
                type="button"
                className="button danger-btn"
                onClick={handleDeleteConfirm}
              >
                သေချာပါသည်၊ ဖျက်မည် (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
