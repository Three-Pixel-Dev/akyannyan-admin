import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { memberLevelsService } from './services/member-levels.service';
import { memberLevelsCodeService } from './services/member-levels-code.service';
import type { MemberLevel, MemberLevelRequest } from './types/member-levels.types';

interface MemberLevelsViewProps {
  onNavigateToCodes?: (memberLevelId?: number) => void;
}

export function MemberLevelsView({ onNavigateToCodes }: MemberLevelsViewProps) {
  const [levels, setLevels] = useState<MemberLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MemberLevel | null>(null);
  const [deletingLevel, setDeletingLevel] = useState<MemberLevel | null>(null);
  const [codeGenLevel, setCodeGenLevel] = useState<MemberLevel | null>(null);

  // Form states
  const [formData, setFormData] = useState<MemberLevelRequest>({
    name: '',
    description: '',
    durationDays: 30,
    durationMonths: 1,
    amount: 10000,
    currency: 'MMK',
    initialCreditPoints: 50,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick code generation modal state
  const [genCount, setGenCount] = useState(10);
  const [genPrefix, setGenPrefix] = useState('AKN-');
  const [genExpiryDays, setGenExpiryDays] = useState(30);
  const [generating, setGenerating] = useState(false);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const data = await memberLevelsService.getAll({
        page: 0,
        size: 50,
        sortBy: 'id',
        sortDirection: 'ASC',
        filter: { search: search.trim() || undefined },
      });
      setLevels(data.content || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load member levels', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [search]);

  // Handle opening Create modal
  const handleOpenCreate = () => {
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
      durationDays: 30,
      durationMonths: 1,
      amount: 10000,
      currency: 'MMK',
      initialCreditPoints: 50,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle opening Edit modal
  const handleOpenEdit = (level: MemberLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description || '',
      durationDays: level.durationDays || 30,
      durationMonths: level.durationMonths || 1,
      amount: level.amount || 0,
      currency: level.currency || 'MMK',
      initialCreditPoints: level.initialCreditPoints ?? 0,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Save form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('အဆင့်အမည် ထည့်သွင်းရန် လိုအပ်ပါသည် (Tier name is required).');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingLevel) {
        await memberLevelsService.update(editingLevel.id, formData);
        showToast(`အဆင့် "${formData.name}" ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`, 'success');
      } else {
        await memberLevelsService.create(formData);
        showToast(`အဆင့်အသစ် "${formData.name}" ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။`, 'success');
      }
      setIsFormOpen(false);
      fetchLevels();
    } catch (err: any) {
      setFormError(err.message || 'သိမ်းဆည်းမှု မအောင်မြင်ပါ');
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingLevel) return;
    try {
      await memberLevelsService.delete(deletingLevel.id);
      showToast(`အဆင့် "${deletingLevel.name}" ကို အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။`, 'info');
      setDeletingLevel(null);
      fetchLevels();
    } catch (err: any) {
      showToast(err.message || 'ဖျက်သိမ်းမှု မအောင်မြင်ပါ', 'error');
    }
  };

  // Handle quick code generation
  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeGenLevel) return;

    setGenerating(true);
    try {
      const generated = await memberLevelsCodeService.bulkGenerate({
        memberLevelId: codeGenLevel.id,
        count: genCount,
        prefix: genPrefix.trim().toUpperCase(),
        expiryDays: genExpiryDays > 0 ? genExpiryDays : undefined,
      });
      showToast(`အဆင့် "${codeGenLevel.name}" အတွက် ကုဒ် ${generated.length} ခု အောင်မြင်စွာ ထုတ်ပြီးပါပြီ။`, 'success');
      setCodeGenLevel(null);
      fetchLevels();
      if (onNavigateToCodes) {
        onNavigateToCodes(codeGenLevel.id);
      }
    } catch (err: any) {
      showToast(err.message || 'ကုဒ်ထုတ်လုပ်မှု မအောင်မြင်ပါ', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Format currency
  const formatMoney = (val?: number, cur: string = 'MMK') => {
    if (val === undefined || val === null) return '0 ' + cur;
    return Number(val).toLocaleString() + ' ' + cur;
  };

  const totalCodes = levels.reduce((acc, curr) => acc + (curr.codeCount || 0), 0);

  return (
    <div className="page">
      <PageHeader
        title="အသင်းဝင် အဆင့်များ (Member Levels)"
        description="Akyannyan အဖွဲ့ဝင် အဆင့်ခွဲခြားမှုများ၊ သက်တမ်းနှင့် နှုန်းထားများကို စီမံခန့်ခွဲပြီး Voucher Code များ ထုတ်ဝေပါ။"
        action={
          <Button onClick={handleOpenCreate} variant="jade" aria-label="Create new member level">
            ＋ အဆင့် အသစ် ထည့်မည်
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="metrics">
        <Metric
          icon="👑"
          label="TOTAL TIERS"
          value={levels.length.toString()}
          detail="လက်ရှိ သတ်မှတ်ထားသော အဆင့်များ"
        />
        <Metric
          icon="🎟️"
          label="GENERATED CODES"
          value={totalCodes.toString()}
          detail="ထုတ်ဝေထားသော အဆင့်ကုဒ် စုစုပေါင်း"
        />
        <Metric
          icon="💎"
          label="VIP TIERS"
          value={levels.filter((l) => (l.amount || 0) > 0).length.toString()}
          detail="အခပေး Premium အဆင့်များ"
        />
        <Metric
          icon="⚡"
          label="FREE TIERS"
          value={levels.filter((l) => (l.amount || 0) === 0).length.toString()}
          detail="အခမဲ့ စတင် အဆင့်များ"
        />
      </div>

      {/* Main Table Card */}
      <Card className="resource-card">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="အဆင့်အမည် သို့မဟုတ် အကြောင်းအရာ ရှာရန်..."
              aria-label="Search member levels"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <Button onClick={fetchLevels} variant="ghost" aria-label="Refresh levels">
            🔄 ပြန်လည်ဆွဲယူမည်
          </Button>
        </div>

        {loading ? (
          <div className="table-loading">
            <span className="spinner" aria-hidden="true" />
            <p>အချက်အလက်များ ဆွဲယူနေပါသည်...</p>
          </div>
        ) : levels.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👑</span>
            <h3>အသင်းဝင်အဆင့် မရှိသေးပါ</h3>
            <p>အဆင့်အသစ်တစ်ခု ဖန်တီး၍ အသုံးပြုသူများအတွက် စတင်သတ်မှတ်ပါ။</p>
            <Button onClick={handleOpenCreate} variant="jade">
              ＋ ပထမဆုံး အဆင့် ထည့်မည်
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" aria-label="Member levels table">
              <thead>
                <tr>
                  <th scope="col">အဆင့်အမည် (Tier Name)</th>
                  <th scope="col">သက်တမ်း (Duration)</th>
                  <th scope="col">နှုန်းထား (Price)</th>
                  <th scope="col">ကနဦး အမှတ် (Credits)</th>
                  <th scope="col">ထုတ်ပြီးကုဒ် (Codes)</th>
                  <th scope="col" className="text-right">လုပ်ဆောင်ချက်များ (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level) => (
                  <tr key={level.id}>
                    <td>
                      <div className="cell-primary">
                        <div className="tier-name-row">
                          <b>{level.name}</b>
                          {(level.amount || 0) === 0 ? (
                            <Status tone="jade">FREE</Status>
                          ) : (
                            <Status tone="gold">PREMIUM</Status>
                          )}
                        </div>
                        {level.description && (
                          <small className="cell-subtext">{level.description}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="cell-duration">
                        <span>{level.durationDays ? `${level.durationDays} ရက်` : 'အကန့်အသတ်မဲ့'}</span>
                        {level.durationMonths && level.durationMonths > 0 && (
                          <small>({level.durationMonths} လ)</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="cell-price">
                        {(level.amount || 0) === 0
                          ? 'အခမဲ့ (Free)'
                          : formatMoney(level.amount, level.currency)}
                      </strong>
                    </td>
                    <td>
                      <span title="Login with code အရင်ဆုံး activate လုပ်သည့်အခါ ပေးမည့် package credits">
                        🪙 {level.initialCreditPoints ?? 0} pts
                      </span>
                    </td>
                    <td>
                      <button
                        className="badge-button"
                        onClick={() => onNavigateToCodes && onNavigateToCodes(level.id)}
                        title="ဤအဆင့်အတွက် ကုဒ်များကို ကြည့်မည်"
                      >
                        🎟️ {level.codeCount || 0} ခု ကြည့်မည် ›
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="action-btn action-gen"
                          onClick={() => {
                            setCodeGenLevel(level);
                            setGenPrefix(level.name.slice(0, 3).toUpperCase() + '-');
                            setGenExpiryDays(level.durationDays || 30);
                          }}
                          title="အဆင့်ကုဒ်များ အစုလိုက် ထုတ်မည်"
                          aria-label={`Generate voucher codes for ${level.name}`}
                        >
                          ⚡ ကုဒ်ထုတ်မည်
                        </button>
                        <button
                          type="button"
                          className="action-btn action-edit"
                          onClick={() => handleOpenEdit(level)}
                          title="ပြင်ဆင်မည်"
                          aria-label={`Edit ${level.name}`}
                        >
                          ✏️ ပြင်မည်
                        </button>
                        <button
                          type="button"
                          className="action-btn action-delete"
                          onClick={() => setDeletingLevel(level)}
                          title="ဖျက်သိမ်းမည်"
                          aria-label={`Delete ${level.name}`}
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
      </Card>

      {/* Create / Edit Modal Dialog */}
      {isFormOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="form-dialog-title">
          <div className="modal-backdrop" onClick={() => !saving && setIsFormOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="form-dialog-title">
                {editingLevel ? `✏️ "${editingLevel.name}" ပြင်ဆင်မည်` : '＋ အသင်းဝင် အဆင့် အသစ် ထည့်သွင်းမည်'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsFormOpen(false)}
                disabled={saving}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger" role="alert">
                <span>⚠️ {formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="modal-form">
              <div className="form-group">
                <label htmlFor="tier-name">အဆင့် အမည် (Tier Name) *</label>
                <input
                  id="tier-name"
                  type="text"
                  required
                  placeholder="ဥပမာ - VIP Platinum, Standard Member"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tier-desc">ဖော်ပြချက် (Description)</label>
                <textarea
                  id="tier-desc"
                  rows={3}
                  placeholder="အဖွဲ့ဝင် အဆင့်အတွက် ရရှိမည့် အခွင့်အရေးများနှင့် အကျိုးကျေးဇူးများ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="tier-days">သက်တမ်း (ရက်ပေါင်း / Duration Days)</label>
                  <input
                    id="tier-days"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.durationDays || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tier-months">သက်တမ်း (လအရေအတွက် / Months)</label>
                  <input
                    id="tier-months"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.durationMonths || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMonths: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="tier-amount">နှုန်းထား / ဈေးနှုန်း (Price)</label>
                  <input
                    id="tier-amount"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="10000"
                    value={formData.amount !== undefined ? formData.amount : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value !== '' ? parseFloat(e.target.value) : 0,
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tier-currency">ငွေကြေး (Currency)</label>
                  <input
                    id="tier-currency"
                    type="text"
                    value={formData.currency || 'MMK'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tier-credits">
                  ကနဦး အမှတ် / Initial Credits (package points)
                </label>
                <input
                  id="tier-credits"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="50"
                  value={formData.initialCreditPoints !== undefined ? formData.initialCreditPoints : 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialCreditPoints: e.target.value !== '' ? parseInt(e.target.value, 10) : 0,
                    })
                  }
                  className="form-input"
                />
                <small className="form-hint">
                  အဆင့်ကုဒ်ဖြင့် ပထမဆုံး login / activate လုပ်သည့်အခါ အသုံးပြုသူ wallet သို့ ထည့်ပေးမည့် အမှတ်။
                  ထပ်မံ login လုပ်လျှင် ထပ်မပေးပါ။
                </small>
              </div>

              <div className="modal-footer">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                >
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade" disabled={saving}>
                  {saving ? 'သိမ်းဆည်းနေပါသည်...' : editingLevel ? 'အပြောင်းအလဲ သိမ်းမည်' : 'အဆင့်အသစ် ဖန်တီးမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      {deletingLevel && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="modal-backdrop" onClick={() => setDeletingLevel(null)} />
          <div className="modal-content modal-content-sm">
            <div className="modal-header">
              <h2 id="delete-dialog-title" className="text-danger">⚠️ ဖျက်သိမ်းရန် အတည်ပြုပါ</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingLevel(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                အသင်းဝင်အဆင့် <b>"{deletingLevel.name}"</b> ကို ဖျက်သိမ်းရန် သေချာပါသလား?
              </p>
              <small className="text-muted">
                ဤလုပ်ဆောင်ချက်သည် စနစ်ထဲတွင် Soft Delete အဖြစ် သိမ်းဆည်းသွားမည်ဖြစ်ပြီး ရှိပြီးသားကုဒ်များကို မထိခိုက်ပါ။
              </small>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setDeletingLevel(null)}>
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

      {/* Quick Bulk Code Generation Modal */}
      {codeGenLevel && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="gen-dialog-title">
          <div className="modal-backdrop" onClick={() => !generating && setCodeGenLevel(null)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="gen-dialog-title">
                ⚡ "{codeGenLevel.name}" အတွက် ကုဒ်များ အစုလိုက် ထုတ်မည်
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCodeGenLevel(null)}
                disabled={generating}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleGenerateCodes} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="gen-count">ကုဒ် အရေအတွက် (Count)</label>
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
                  <label htmlFor="gen-prefix">ကုဒ် ရှေ့စကားလုံး (Prefix)</label>
                  <input
                    id="gen-prefix"
                    type="text"
                    value={genPrefix}
                    onChange={(e) => setGenPrefix(e.target.value)}
                    placeholder="AKN-"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gen-expiry">ကုဒ် သက်တမ်း ကုန်ဆုံးမည့် ရက်ပေါင်း (Expiry Days)</label>
                <input
                  id="gen-expiry"
                  type="number"
                  min="1"
                  value={genExpiryDays}
                  onChange={(e) => setGenExpiryDays(parseInt(e.target.value) || 0)}
                  placeholder="30"
                  className="form-input"
                />
                <small className="form-hint">
                  မထည့်သွင်းပါက အဆင့်သတ်မှတ်ချက်အတိုင်း ({codeGenLevel.durationDays || 30} ရက်) သက်တမ်းရှိမည်။
                </small>
              </div>

              <div className="modal-footer">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCodeGenLevel(null)}
                  disabled={generating}
                >
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="gold" disabled={generating}>
                  {generating ? 'ကုဒ်များ ထုတ်နေပါသည်...' : `⚡ ကုဒ် ${genCount} ခု ချက်ချင်း ထုတ်မည်`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
