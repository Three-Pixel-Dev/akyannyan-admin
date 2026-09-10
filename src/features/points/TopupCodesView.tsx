import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { adminPointsService } from './services/points.service';
import type { TopupCode, TopupCodeBulkGenerateRequest } from './types/points.types';

export function TopupCodesView() {
  const [codes, setCodes] = useState<TopupCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchCode, setSearchCode] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [justGeneratedCodes, setJustGeneratedCodes] = useState<TopupCode[]>([]);

  // Generator form
  const [genPoints, setGenPoints] = useState<number>(100);
  const [genCount, setGenCount] = useState<number>(10);
  const [genPrefix, setGenPrefix] = useState<string>('AKN-P-');
  const [genExpiryDays, setGenExpiryDays] = useState<number>(30);
  const [generating, setGenerating] = useState(false);

  // Copy tracker
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const data = await adminPointsService.getTopupCodes({
        page,
        size,
        sortBy: 'id',
        sortDirection: 'DESC',
        filter: searchCode.trim() || undefined,
      });

      let list = data.content || [];
      if (statusFilter !== 'ALL') {
        list = list.filter((c) => c.status === statusFilter);
      }
      setCodes(list);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err: any) {
      console.warn('Could not fetch from backend:', err.message);
      // Fallback empty
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page, size, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCodes();
  };

  const handleCopyCode = (code: TopupCode) => {
    navigator.clipboard.writeText(code.code);
    setCopiedId(code.id);
    showToast(`ကုဒ် '${code.code}' ကို ကူးယူပြီးပါပြီ။`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllGenerated = () => {
    const text = justGeneratedCodes.map((c) => `${c.code} (${c.points} pts)`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(`ထုတ်ဝေထားသော ကုဒ် ${justGeneratedCodes.length} ခုလုံးကို Clipboard သို့ ကူးယူပြီးပါပြီ။`, 'success');
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    const req: TopupCodeBulkGenerateRequest = {
      points: genPoints,
      count: genCount,
      prefix: genPrefix.trim() || 'AKN-P-',
      expiryDays: genExpiryDays > 0 ? genExpiryDays : undefined,
    };

    try {
      const generated = await adminPointsService.bulkGenerateCodes(req);
      showToast(`အမှတ် ${genPoints} တန် ဘောက်ချာကုဒ် ${generated.length} ခု အောင်မြင်စွာ ထုတ်ဝေပြီးပါပြီ။`, 'success');
      setIsGenerateModalOpen(false);
      setJustGeneratedCodes(generated);
      setIsSuccessModalOpen(true);
      fetchCodes();
    } catch (err: any) {
      showToast(`ကုဒ်ထုတ်ဝေခြင်း မအောင်မြင်ပါ: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCode = async (id: number) => {
    if (!window.confirm('ဤကုဒ်ကို ဖျက်ပစ်ရန် သေချာပါသလား?')) return;
    try {
      await adminPointsService.deleteTopupCode(id);
      showToast('ကုဒ်ကို ဖျက်သိမ်းပြီးပါပြီ။', 'info');
      fetchCodes();
    } catch (err: any) {
      showToast(`ဖျက်သိမ်းခြင်း မအောင်မြင်ပါ: ${err.message}`, 'error');
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('my-MM', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const activeCount = codes.filter((c) => c.status === 'ACTIVE').length;
  const redeemedCount = codes.filter((c) => c.status === 'REDEEMED').length;
  const totalPointsValue = codes.reduce((acc, c) => acc + (c.points || 0), 0);

  return (
    <div className="page">
      <PageHeader
        title="အမှတ်ဖြည့်ဘောက်ချာကုဒ်များ (Top-up Codes)"
        description="မိုဘိုင်းအသုံးပြုသူများ အမှတ်ဖြည့်သွင်းနိုင်ရန် AKN-P- ဘောက်ချာကုဒ်များကို အစုလိုက် ထုတ်ဝေစီမံပါ။"
        action={
          <div className="header-action-group">
            <Button variant="ghost" onClick={fetchCodes} disabled={loading}>
              🔄 ပြန်စစ်မည်
            </Button>
            <Button variant="gold" onClick={() => setIsGenerateModalOpen(true)}>
              ⚡ ကုဒ်အသစ် ထုတ်ဝေမည်
            </Button>
          </div>
        }
      />

      <div className="metrics">
        <Metric
          icon="🎫"
          label="စုစုပေါင်း ဘောက်ချာကုဒ်"
          value={`${totalItems || codes.length} ခု`}
          detail="စနစ်တွင်း ထုတ်ဝေထားသော ကုဒ်များ"
        />
        <Metric
          icon="🟢"
          label="အသုံးပြုနိုင်သော ကုဒ်များ"
          value={`${activeCount} ခု`}
          detail="အမှတ် ဖြည့်သွင်းရန် အသင့်ရှိ"
        />
        <Metric
          icon="⭐"
          label="ဖြည့်သွင်းပြီးသော ကုဒ်များ"
          value={`${redeemedCount} ခု`}
          detail="အသုံးပြုသူများ ထည့်သွင်းပြီး"
        />
        <Metric
          icon="🪙"
          label="စုစုပေါင်း အမှတ်တန်ဖိုး"
          value={`${totalPointsValue} pts`}
          detail="ထုတ်ဝေထားသော အမှတ်စုစုပေါင်း"
        />
      </div>

      <Card className="table-card">
        {/* Filter Bar */}
        <div className="table-controls" style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="ကုဒ်ဖြင့် ရှာဖွေပါ (ဥပမာ: AKN-P-...)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="form-input"
              style={{ minHeight: '36px' }}
            />
            <Button type="submit" variant="jade" style={{ minHeight: '36px' }}>
              🔍 ရှာမည်
            </Button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="form-input"
            style={{ width: '180px', minHeight: '36px' }}
            aria-label="Filter by status"
          >
            <option value="ALL">အခြေအနေ အားလုံး</option>
            <option value="ACTIVE">🟢 ACTIVE (အသုံးပြုနိုင်)</option>
            <option value="REDEEMED">⭐ REDEEMED (သုံးပြီး)</option>
            <option value="EXPIRED">⏳ EXPIRED (သက်တမ်းကုန်)</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>ဘောက်ချာကုဒ်များ ရယူနေပါသည်...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="empty-state">
            <p>ဘောက်ချာကုဒ် မရှိသေးပါ။ ကုဒ်အသစ်များ စတင်ထုတ်ဝေပါ။</p>
            <Button variant="gold" onClick={() => setIsGenerateModalOpen(true)} style={{ marginTop: '12px' }}>
              ⚡ ကုဒ် အသစ် ထုတ်ဝေမည်
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" aria-label="Topup codes table">
              <thead>
                <tr>
                  <th scope="col">ဘောက်ချာကုဒ် (Code)</th>
                  <th scope="col">အမှတ်တန်ဖိုး (Points)</th>
                  <th scope="col">အခြေအနေ (Status)</th>
                  <th scope="col">ဖြည့်သွင်းသူ (Redeemed By)</th>
                  <th scope="col">သက်တမ်းကုန်ရက် (Expires At)</th>
                  <th scope="col" className="text-right">လုပ်ဆောင်ချက် (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="code-cell-wrapper">
                        <code className="code-pill" style={{ color: 'var(--gold, #e8b54d)' }}>
                          {item.code}
                        </code>
                        <button
                          type="button"
                          className={`copy-code-btn ${copiedId === item.id ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(item)}
                          title="Click to copy code"
                        >
                          {copiedId === item.id ? '✓ ကူးပြီး' : '📋 ကူးမည်'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--gold, #e8b54d)', fontSize: '14px' }}>
                        🪙 +{item.points} pts
                      </span>
                    </td>
                    <td>
                      {item.status === 'ACTIVE' && <Status tone="jade">🟢 ACTIVE</Status>}
                      {item.status === 'REDEEMED' && <Status tone="gold">⭐ REDEEMED</Status>}
                      {item.status === 'EXPIRED' && <Status tone="danger">⏳ EXPIRED</Status>}
                    </td>
                    <td>
                      {item.redeemedByUsername || item.redeemedByUserId ? (
                        <div className="redeemed-user-info">
                          <b>{item.redeemedByUsername || `User #${item.redeemedByUserId}`}</b>
                          <small>{formatDate(item.redeemedAt)}</small>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <small style={{ color: 'var(--text-muted)' }}>{formatDate(item.expiresAt)}</small>
                    </td>
                    <td className="text-right">
                      {item.status === 'ACTIVE' && (
                        <button
                          type="button"
                          className="badge-button"
                          onClick={() => handleDeleteCode(item.id)}
                          style={{ color: 'var(--danger, #e86a5d)', borderColor: 'var(--danger, #e86a5d)' }}
                        >
                          🗑️ ဖျက်မည်
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              စာမျက်နှာ {page + 1} / {totalPages} (စုစုပေါင်း {totalItems} ခု)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                ‹ နောက်သို့
              </Button>
              <Button variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                ရှေ့သို့ ›
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Generate Modal */}
      {isGenerateModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="generate-topup-title">
          <div className="modal-backdrop" onClick={() => !generating && setIsGenerateModalOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="generate-topup-title">⚡ အမှတ်ဖြည့်ကုဒ်များ အစုလိုက် ထုတ်ဝေမည်</h2>
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

            <form onSubmit={handleGenerateSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="gen-points">အမှတ်ပမာဏ (Points Value) *</label>
                <select
                  id="gen-points"
                  value={genPoints}
                  onChange={(e) => setGenPoints(parseInt(e.target.value))}
                  className="form-input"
                >
                  <option value={50}>🪙 50 Points (အစမ်းသုံး)</option>
                  <option value={100}>🪙 100 Points (ပုံမှန်အထုပ်)</option>
                  <option value={200}>🪙 200 Points (လူကြိုက်များ)</option>
                  <option value={500}>🪙 500 Points (ပရိုအထုပ်ကြီး)</option>
                  <option value={1000}>🪙 1,000 Points (ဗီအိုင်ပီ)</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="gen-count">ထုတ်ဝေမည့် အရေအတွက် (Count)</label>
                  <select
                    id="gen-count"
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
                  <label htmlFor="gen-prefix">ကုဒ် ရှေ့ဆက်စာလုံး (Prefix)</label>
                  <input
                    id="gen-prefix"
                    type="text"
                    value={genPrefix}
                    onChange={(e) => setGenPrefix(e.target.value)}
                    placeholder="AKN-P-"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gen-expiry">သက်တမ်း (ရက်ပေါင်း)</label>
                <input
                  id="gen-expiry"
                  type="number"
                  min="0"
                  value={genExpiryDays}
                  onChange={(e) => setGenExpiryDays(parseInt(e.target.value) || 0)}
                  placeholder="30 (၀ ထားပါက အကန့်အသတ်မဲ့)"
                  className="form-input"
                />
                <small className="form-hint">ရက် ၃၀ မရွေးချယ်လိုပါက ၀ ထည့်သွင်း၍ သက်တမ်းအကန့်အသတ်မဲ့ ထားရှိနိုင်ပါသည်။</small>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setIsGenerateModalOpen(false)} disabled={generating}>
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="gold" disabled={generating}>
                  {generating ? 'ထုတ်ဝေနေပါသည်...' : `⚡ ကုဒ် ${genCount} ခု ထုတ်ဝေမည်`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Codes Success Modal */}
      {isSuccessModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="modal-backdrop" onClick={() => setIsSuccessModalOpen(false)} />
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 id="success-title">🎉 ကုဒ် {justGeneratedCodes.length} ခု အောင်မြင်စွာ ထုတ်ပြီးပါပြီ</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsSuccessModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Messenger သို့မဟုတ် Viber မှတစ်ဆင့် ဝယ်ယူသူများထံ ချက်ချင်း ပေးပို့ဖြန့်ဝေနိုင်ပါသည်။
              </p>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: 'var(--bg-primary, #0b1410)',
                  border: '1px solid var(--border-color, #24382e)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.8',
                }}
              >
                {justGeneratedCodes.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gold, #e8b54d)', fontWeight: 700 }}>{c.code}</span>
                    <span style={{ color: 'var(--text-muted)' }}>🪙 {c.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setIsSuccessModalOpen(false)}>
                ပိတ်မည် (Close)
              </Button>
              <Button type="button" variant="jade" onClick={handleCopyAllGenerated}>
                📋 ကုဒ်အားလုံး ကူးယူမည် (Copy All)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
