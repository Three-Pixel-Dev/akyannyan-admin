import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { adminPointsService } from './services/points.service';
import type { PointsConfig, PointsConfigUpdateRequest } from './types/points.types';

const DEFAULT_CONFIGS: PointsConfig[] = [
  {
    id: 1,
    featureKey: 'YEARLY_CHART_EXTERNAL',
    featureName: 'နှစ်ချုပ် မဟာဘုတ် ဇာတာတွက်ချက်ခြင်း',
    costPoints: 20,
    isEnabled: true,
    description: 'အခြားသူများအတွက် တစ်နှစ်စာ မဟာဘုတ်နှင့် ဂြိုဟ်အသွားအလာ ဇာတာ အသေးစိတ်တွက်ချက်ခြင်း',
    category: 'ASTROLOGY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    featureKey: 'KP_HORARY_EXTERNAL',
    featureName: 'KP ဟူးရား အမေးပုစ္ဆာ တွက်ချက်ခြင်း',
    costPoints: 10,
    isEnabled: true,
    description: 'နက္ခတ်နှင့် သဗ္ဗဒိသာ ၁-၂၄၉ ဂဏန်းရွေးချယ်မှုဖြင့် အမေးပုစ္ဆာ အဖြေထုတ်ခြင်း',
    category: 'HORARY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    featureKey: 'DAY_PICK_EXTERNAL',
    featureName: 'ရက်ရာဇာ/ပြဿဒါး အခါပေး ရွေးချယ်ခြင်း',
    costPoints: 10,
    isEnabled: true,
    description: 'မင်္ဂလာအခါ၊ အိမ်တက်အခါ၊ ခရီးထွက်အခါ စသည့် အခါကောင်းရက်မြတ်များ တွက်ချက်ပေးခြင်း',
    category: 'CALENDAR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    featureKey: 'TRANSIT_EXTERNAL',
    featureName: 'လက်ရှိဂြိုဟ်စီးဂြိုဟ်နင်း (Transit Analysis)',
    costPoints: 15,
    isEnabled: true,
    description: 'လက်ရှိအချိန် မိုးကောင်းကင်ရှိ ဂြိုဟ်များ မိမိဇာတာအပေါ် လွှမ်းမိုးသက်ရောက်မှု အသေးစိတ်',
    category: 'ASTROLOGY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    featureKey: 'COMPATIBILITY_PAIR',
    featureName: 'နှစ်ဦးဇာတာ လိုက်ဖက်ညီမှု တွက်ချက်ခြင်း',
    costPoints: 10,
    isEnabled: true,
    description: 'အိမ်ထောင်ဖက်၊ စီးပွားဖက် သို့မဟုတ် ချစ်သူနှစ်ဦး၏ ဓာတ်၊ နက္ခတ်၊ မဟာဘုတ် လိုက်ဖက်ညီမှု',
    category: 'COMPATIBILITY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    featureKey: 'TAROT_SPREAD_3_CARD',
    featureName: 'တာရော့ (Tarot) ၃ ကတ် ဟောစာတမ်း',
    costPoints: 5,
    isEnabled: true,
    description: 'အတိတ်၊ ပစ္စုပ္ပန်၊ အနာဂတ် ၃ ကတ်တွဲ တာရော့နိမိတ်ဖတ်ကြားချက်',
    category: 'TAROT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    featureKey: 'BPZ_DECISION_ANALYSIS',
    featureName: 'ဗေဒင်ပညာရှင်စုံ (BPZ) ဘက်စုံသုံးသပ်ချက်',
    costPoints: 15,
    isEnabled: true,
    description: 'အရေးကြီးသော ဘဝဆုံးဖြတ်ချက်များအတွက် မဟာဘုတ်၊ နက္ခတ်နှင့် တာရော့ ပေါင်းစပ်သုံးသပ်ချက်',
    category: 'ANALYSIS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    featureKey: 'LIFETIME_CHART_EXTERNAL',
    featureName: 'တစ်သက်စာ ဟောစာတမ်း (အခြားသူအတွက်)',
    costPoints: 30,
    isEnabled: true,
    description: 'မွေးချက်ကောင်းကင်နှင့် မွေးမဟာဘုတ်အိမ်ဖြင့် တစ်သက်စာ ဟောစာတမ်း',
    category: 'ASTROLOGY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    featureKey: 'AI_DEEP_REMEDY_STAGE',
    featureName: 'နတ်မင်းကြီးများ ယတြာနှင့် အစီအရင် အဆင့်',
    costPoints: 5,
    isEnabled: true,
    description: 'ဂြိုဟ်စီးဂြိုဟ်နင်း ညံ့နေချိန်များတွင် ပြုလုပ်ရမည့် အစီအရင်နှင့် ယတြာ အညွှန်း',
    category: 'REMEDY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function PointsConfigsView() {
  const [configs, setConfigs] = useState<PointsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingConfig, setEditingConfig] = useState<PointsConfig | null>(null);
  const [costInput, setCostInput] = useState<number>(10);
  const [enabledInput, setEnabledInput] = useState<boolean>(true);
  const [descInput, setDescInput] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await adminPointsService.getConfigs();
      if (data && data.length > 0) {
        setConfigs(data);
      } else {
        setConfigs(DEFAULT_CONFIGS);
      }
    } catch (err: any) {
      console.warn('Failed to fetch from backend, using defaults:', err.message);
      setConfigs(DEFAULT_CONFIGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleEditClick = (item: PointsConfig) => {
    setEditingConfig(item);
    setCostInput(item.costPoints || 0);
    setEnabledInput(item.isEnabled);
    setDescInput(item.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;

    setSaving(true);
    const req: PointsConfigUpdateRequest = {
      costPoints: costInput,
      isEnabled: enabledInput,
      description: descInput,
    };

    try {
      await adminPointsService.updateConfig(editingConfig.featureKey, req);
      showToast(`'${editingConfig.featureName}' နှုန်းထားကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`, 'success');
      setConfigs((prev) =>
        prev.map((c) =>
          c.featureKey === editingConfig.featureKey
            ? { ...c, costPoints: costInput, isEnabled: enabledInput, description: descInput }
            : c
        )
      );
      setEditingConfig(null);
    } catch (err: any) {
      showToast(`ပြင်ဆင်ခြင်း မအောင်မြင်ပါ: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFast = async (item: PointsConfig) => {
    try {
      const updatedEnabled = !item.isEnabled;
      await adminPointsService.updateConfig(item.featureKey, {
        costPoints: item.costPoints || 0,
        isEnabled: updatedEnabled,
        description: item.description,
      });
      setConfigs((prev) =>
        prev.map((c) => (c.featureKey === item.featureKey ? { ...c, isEnabled: updatedEnabled } : c))
      );
      showToast(`'${item.featureName}' ကို ${updatedEnabled ? 'ဖွင့်လိုက်ပါပြီ' : 'ပိတ်လိုက်ပါပြီ'}။`, 'info');
    } catch (err: any) {
      showToast(`အခြေအနေ ပြောင်းလဲခြင်း မအောင်မြင်ပါ: ${err.message}`, 'error');
    }
  };

  const totalConfigs = configs.length;
  const activeConfigs = configs.filter((c) => c.isEnabled).length;
  const avgCost = totalConfigs > 0 ? Math.round(configs.reduce((acc, c) => acc + (c.costPoints || 0), 0) / totalConfigs) : 0;

  const filteredConfigs = configs.filter((c) => {
    const matchesSearch =
      search.trim() === '' ||
      c.featureName.toLowerCase().includes(search.toLowerCase()) ||
      c.featureKey.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (c.category && c.category.toUpperCase() === selectedCategory.toUpperCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page">
      <PageHeader
        title="အမှတ်နှုန်းထားများ (Stage Pricing)"
        description="Akyannyan မိုဘိုင်းဝန်ဆောင်မှု အဆင့်တစ်ခုချင်းစီအတွက် ဖြတ်တောက်မည့် အမှတ် (Points) များကို စီမံခန့်ခွဲပါ။"
        action={
          <Button variant="ghost" onClick={loadConfigs} disabled={loading}>
            🔄 ပြန်လည်စစ်ဆေးမည်
          </Button>
        }
      />

      <div className="metrics">
        <Metric
          icon="⚙️"
          label="ဝန်ဆောင်မှု အဆင့် စုစုပေါင်း"
          value={`${totalConfigs} ခု`}
          detail="စနစ်တွင်း သတ်မှတ်ထားသော အဆင့်များ"
        />
        <Metric
          icon="🟢"
          label="အသုံးပြုနိုင်သော အဆင့်များ"
          value={`${activeConfigs} ခု`}
          detail="လက်ရှိ ဖွင့်ထားသော ဝန်ဆောင်မှုများ"
        />
        <Metric
          icon="🪙"
          label="ပျမ်းမျှ ဖြတ်တောက်မှု"
          value={`${avgCost} pts`}
          detail="အဆင့်တစ်ခုလျှင် ပျမ်းမျှကုန်ကျစရိတ်"
        />
      </div>

      <Card className="resource-card">
        <div className="card-heading" style={{ marginBottom: '18px', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✦</span> STAGE PRICING MATRIX
            </p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 4px', color: 'var(--text-main)' }}>
              ဝန်ဆောင်မှုအလိုက် အမှတ်ဖြတ်တောက်မှု ဇယား
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
              အဆင့်တစ်ခုချင်းစီအတွက် လိုအပ်သော Points နှုန်းထားများကို စစ်ဆေးပြင်ဆင်နိုင်ပါသည်။
            </p>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ဝန်ဆောင်မှု အမည် သို့မဟုတ် Feature Key ရှာရန်..."
              aria-label="Search stage pricing"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--bg-primary, #0d1511)',
                border: '1px solid var(--border-color, #1e3328)',
                color: 'var(--text-main, #e3ede8)',
                fontSize: '13px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                background: 'var(--bg-primary, #0d1511)',
                border: '1px solid var(--border-color, #1e3328)',
                color: 'var(--text-main, #e3ede8)',
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
              aria-label="Filter category"
            >
              <option value="ALL">အမျိုးအစား အားလုံး</option>
              <option value="ASTROLOGY">ဇာတာ / နက္ခတ် (Astrology)</option>
              <option value="HORARY">KP ဟူးရား (Horary)</option>
              <option value="CALENDAR">ရက်ရွေး အခါပေး (Calendar)</option>
              <option value="COMPATIBILITY">အံဝင်မှု (Compatibility)</option>
              <option value="TAROT">တာရော့ (Tarot)</option>
              <option value="ANALYSIS">ဗေဒင်ပညာရှင်စုံ (BPZ)</option>
              <option value="REMEDY">ယတြာ အစီအရင် (Remedy)</option>
            </select>

            <Button variant="ghost" onClick={loadConfigs} disabled={loading} style={{ padding: '9px 14px' }}>
              🔄 ဆွဲယူမည်
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="table-loading" style={{ padding: '50px 20px', textAlign: 'center' }}>
            <span className="spinner" aria-hidden="true" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              အမှတ်နှုန်းထား အချက်အလက်များ ဆွဲယူနေပါသည်...
            </p>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <span className="empty-icon" style={{ fontSize: '28px' }}>⚙️</span>
            <h3 style={{ margin: '10px 0 4px', fontSize: '16px', color: 'var(--text-main)' }}>
              ကိုက်ညီသော ဝန်ဆောင်မှု မရှိပါ
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
              ရှာဖွေထားသော အမည် သို့မဟုတ် အမျိုးအစားအတွက် နှုန်းထားများ မတွေ့ရှိပါ။
            </p>
          </div>
        ) : (
          <div className="table-responsive" style={{ marginTop: '14px' }}>
            <table className="custom-table" aria-label="Points config table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '38%' }}>ဝန်ဆောင်မှု အမည် (Feature Name)</th>
                  <th scope="col" style={{ width: '22%' }}>ကုဒ်အမည် (Feature Key)</th>
                  <th scope="col" style={{ width: '14%' }}>ဖြတ်တောက်မည့် အမှတ် (Cost)</th>
                  <th scope="col" style={{ width: '12%' }}>အခြေအနေ (Status)</th>
                  <th scope="col" className="text-right" style={{ width: '14%' }}>လုပ်ဆောင်ချက် (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {filteredConfigs.map((c) => (
                  <tr key={c.featureKey}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <b style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{c.featureName}</b>
                          {c.category && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: 'rgba(62, 207, 116, 0.08)',
                                border: '1px solid rgba(62, 207, 116, 0.2)',
                                color: 'var(--jade-primary, #3ecf74)',
                                fontWeight: 600,
                              }}
                            >
                              {c.category}
                            </span>
                          )}
                        </div>
                        {c.description && (
                          <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {c.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <code className="code-pill" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                        {c.featureKey}
                      </code>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(232, 181, 77, 0.12)',
                          border: '1px solid rgba(232, 181, 77, 0.3)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          color: 'var(--gold-primary, #e8b54d)',
                        }}
                      >
                        🪙 {c.costPoints} pts
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleFast(c)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'transform 0.15s ease',
                        }}
                        title="အဖွင့်/အပိတ် ပြောင်းလဲရန် နှိပ်ပါ"
                      >
                        {c.isEnabled ? (
                          <Status tone="jade">🟢 ဖွင့်ထားသည်</Status>
                        ) : (
                          <Status tone="danger">🔴 ပိတ်ထားသည်</Status>
                        )}
                      </button>
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => handleEditClick(c)} style={{ padding: '6px 12px' }}>
                        ✏️ ပြင်မည်
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Config Modal */}
      {editingConfig && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-config-title">
          <div className="modal-backdrop" onClick={() => !saving && setEditingConfig(null)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="edit-config-title">✏️ အမှတ်နှုန်းထား ပြင်ဆင်ခြင်း</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingConfig(null)}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label>ဝန်ဆောင်မှု အမည်</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`${editingConfig.featureName} (${editingConfig.featureKey})`}
                  className="form-input"
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cost-input">ဖြတ်တောက်မည့် အမှတ်ပမာဏ (Points Cost) *</label>
                <input
                  id="cost-input"
                  type="number"
                  min="0"
                  max="1000"
                  required
                  value={costInput}
                  onChange={(e) => setCostInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="form-input"
                />
                <small className="form-hint">
                  ပြင်ပလူများ သို့မဟုတ် Advanced Stage များတွက်ချက်ရာတွင် ဤအမှတ်ပမာဏကို ဖြတ်တောက်ပါမည်။
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="desc-input">ရှင်းလင်းချက် (Description)</label>
                <textarea
                  id="desc-input"
                  rows={3}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="form-input"
                  placeholder="ဝန်ဆောင်မှုဆိုင်ရာ ဖော်ပြချက်..."
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabledInput}
                    onChange={(e) => setEnabledInput(e.target.checked)}
                  />
                  <span>ဤဝန်ဆောင်မှုကို အသုံးပြုခွင့် ဖွင့်ထားမည် (Is Enabled)</span>
                </label>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setEditingConfig(null)} disabled={saving}>
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade" disabled={saving}>
                  {saving ? 'သိမ်းဆည်းနေပါသည်...' : '✓ သိမ်းဆည်းမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
