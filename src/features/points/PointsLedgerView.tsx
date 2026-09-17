import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { adminPointsService } from './services/points.service';
import type { PointsTransaction, PointTransactionType } from './types/points.types';

export function PointsLedgerView() {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const getTxType = (tx: PointsTransaction): PointTransactionType =>
    (tx.transactionType || tx.source || 'TOP_UP') as PointTransactionType;

  const getTxAmount = (tx: PointsTransaction): number =>
    tx.pointsAmount !== undefined ? tx.pointsAmount : (tx.amount ?? 0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await adminPointsService.getTransactions(page, size);
      let list = data.content || [];
      if (typeFilter !== 'ALL') {
        list = list.filter((t) => getTxType(t) === typeFilter);
      }
      setTransactions(list);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err: any) {
      console.warn('Could not fetch ledger from backend:', err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, size, typeFilter]);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('my-MM', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const renderTypeStatus = (type: PointTransactionType) => {
    switch (type) {
      case 'TOP_UP':
        return <Status tone="gold">🪙 ဖြည့်သွင်းမှု (Top-up)</Status>;
      case 'STAGE_DEDUCT':
        return <Status tone="danger">🔻 အဆင့်ဖြတ်တောက် (Deduct)</Status>;
      case 'ADMIN_ADJUST':
        return <Status tone="jade">⚖️ စီမံသူချိန်ညှိ (Adjust)</Status>;
      case 'REFUND':
        return <Status tone="jade">↩️ ပြန်အမ်းငွေ (Refund)</Status>;
      case 'MERIT_REWARD':
        return <Status tone="gold">🏺 ကံစုဘူးဆု (Reward)</Status>;
      case 'MEMBERSHIP_GRANT':
        return <Status tone="gold">👑 အသင်းဝင် ကနဦးအမှတ်</Status>;
      default:
        return <Status tone="jade">{type}</Status>;
    }
  };

  const deductCount = transactions.filter((t) => getTxType(t) === 'STAGE_DEDUCT').length;
  const topupCount = transactions.filter((t) => getTxType(t) === 'TOP_UP').length;

  return (
    <div className="page">
      <PageHeader
        title="အမှတ်မှတ်တမ်းနှင့် စာရင်းချုပ် (Points Ledger)"
        description="မိုဘိုင်းအသုံးပြုသူများ၏ ဝန်ဆောင်မှုအလိုက် အမှတ်ဖြတ်တောက်မှု၊ ဖြည့်သွင်းမှုနှင့် အလှူကုသိုလ်ဆု မှတ်တမ်းများ။"
        action={
          <div className="header-action-group">
            <Button variant="ghost" onClick={fetchTransactions} disabled={loading}>
              🔄 ပြန်စစ်မည်
            </Button>
          </div>
        }
      />

      <div className="metrics">
        <Metric
          icon="📜"
          label="မှတ်တမ်း စုစုပေါင်း"
          value={`${totalItems || transactions.length} ခု`}
          detail="စနစ်တွင်း ငွေသွင်းငွေထုတ် လှုပ်ရှားမှုများ"
        />
        <Metric
          icon="🔻"
          label="ဝန်ဆောင်မှု အသုံးပြုမှု"
          value={`${deductCount} ကြိမ်`}
          detail="Stage-by-stage ဖြတ်တောက်မှုများ"
        />
        <Metric
          icon="🪙"
          label="အမှတ်ဖြည့်သွင်းမှု"
          value={`${topupCount} ကြိမ်`}
          detail="ဘောက်ချာကုဒ်ဖြင့် ထည့်သွင်းထားမှု"
        />
      </div>

      <Card className="table-card">
        {/* Filter bar */}
        <div className="table-controls" style={{ padding: '16px 20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="form-input"
            style={{ width: '220px', minHeight: '36px' }}
            aria-label="Filter by transaction type"
          >
            <option value="ALL">အမျိုးအစား အားလုံး</option>
            <option value="STAGE_DEDUCT">🔻 STAGE DEDUCT (ဖြတ်တောက်မှု)</option>
            <option value="TOP_UP">🪙 TOP UP (ဖြည့်သွင်းမှု)</option>
            <option value="MEMBERSHIP_GRANT">👑 MEMBERSHIP GRANT (ကနဦးအမှတ်)</option>
            <option value="REFUND">↩️ REFUND (ပြန်အမ်းမှု)</option>
            <option value="MERIT_REWARD">🏺 MERIT REWARD (ကံစုဘူး)</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>အမှတ်မှတ်တမ်းများ ရယူနေပါသည်...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>အမှတ်မှတ်တမ်း မရှိသေးပါ။</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" aria-label="Points transaction ledger table">
              <thead>
                <tr>
                  <th scope="col">စဥ်/ရက်စွဲ (Time)</th>
                  <th scope="col">အသုံးပြုသူ (User)</th>
                  <th scope="col">အမျိုးအစား (Type)</th>
                  <th scope="col">ပမာဏ (Points)</th>
                  <th scope="col">ဝန်ဆောင်မှု/အဆင့် (Feature)</th>
                  <th scope="col">လက်ကျန် (Balance)</th>
                  <th scope="col">မှတ်ချက် (Note)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const amt = getTxAmount(tx);
                  const isPositive = amt > 0;
                  const txType = getTxType(tx);
                  const featureOrRef = tx.featureName || tx.referenceId || tx.stageId;
                  return (
                    <tr key={tx.id}>
                      <td>
                        <small style={{ color: 'var(--text-muted)' }}>{formatDate(tx.createdAt)}</small>
                      </td>
                      <td>
                        <b>{tx.userDisplayName || `User #${tx.userId}`}</b>
                        {tx.userEmail && <small style={{ display: 'block', color: 'var(--text-muted)' }}>{tx.userEmail}</small>}
                      </td>
                      <td>{renderTypeStatus(txType)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '14px',
                            color: isPositive ? 'var(--jade, #3ecf74)' : 'var(--danger, #e86a5d)',
                          }}
                        >
                          {isPositive ? `+${amt}` : amt} pts
                        </span>
                      </td>
                      <td>
                        {featureOrRef ? (
                          <code className="code-pill">{featureOrRef}</code>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {tx.balanceAfter !== undefined && tx.balanceAfter !== null ? (
                          <b style={{ color: 'var(--gold, #e8b54d)' }}>{tx.balanceAfter} pts</b>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <small style={{ color: 'var(--text-muted)' }}>{tx.note || '—'}</small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
}
