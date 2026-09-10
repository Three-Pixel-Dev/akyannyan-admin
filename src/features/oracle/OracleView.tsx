import { useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';

export interface OracleTemplate {
  id: string;
  icon: string;
  title: string;
  category: 'SYSTEM' | 'QUOTA' | 'SAFETY' | 'DIVINATION';
  model: string;
  temperature: number;
  maxTokens: number;
  description: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

const INITIAL_TEMPLATES: OracleTemplate[] = [
  {
    id: 'system_core',
    icon: '🔮',
    title: 'Oracle System Prompt (အကြံဉာဏ် ပင်မ ဉာဏ်တော်)',
    category: 'SYSTEM',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 2048,
    description: 'အသုံးပြုသူ၏ မဟာဘုတ်၊ နက္ခတ်နှင့် သုတေသနအချက်အလက်များကို အခြေခံ၍ လမ်းညွှန်ချက်ပေးသော ပင်မ AI စနစ် စည်းမျဉ်း',
    content: `သင်သည် Akyannyan (အကြံဉာဏ်) မြန်မာ့ရိုးရာနှင့် နက္ခတ်ဗေဒင်ဆိုင်ရာ ဘဝလမ်းညွှန် AI ဖြစ်သည်။
မေးမြန်းသူ၏ မွေးသက္ကရာဇ်၊ နေ့နံ၊ မဟာဘုတ် သက်ရောက်နှင့် လက်ရှိ ဂြိုဟ်အသွားအလာများကို ထည့်သွင်းတွက်ချက်၍ အဖြေပေးပါ။
စည်းမျဉ်းများ:
၁။ ရိုသေလေးစားမှုရှိသော၊ နွေးထွေးအားပေးသော စကားအသုံးအနှုန်းကို အသုံးပြုပါ။
၂။ အစွဲအလမ်းလွန်ကဲစေခြင်း မပြုဘဲ စိတ်အေးချမ်းမှုနှင့် လက်တွေ့ကျသော ကောင်းမှုကုသိုလ် (ယတြာ) လမ်းညွှန်ချက်များကို ပေးပါ။
၃။ ရှင်းလင်းပြတ်သားပြီး ဖတ်ရှုရလွယ်ကူသော မြန်မာစာအရေးအသားဖြင့် ဖွဲ့စည်းပါ။`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'daily_quota',
    icon: '🪙',
    title: 'Daily Usage Quota (နေ့စဉ် အမေးပုစ္ဆာ ကန့်သတ်ချက်)',
    category: 'QUOTA',
    model: 'rule-engine',
    temperature: 0.0,
    maxTokens: 512,
    description: 'အခမဲ့ အသုံးပြုသူများအတွက် တစ်နေ့လျှင် ၃ ကြိမ် မေးမြန်းခွင့်၊ ကျော်လွန်ပါက Points ၅ မှတ် ဖြတ်တောက်ရန်',
    content: `FREE_USERS_LIMIT: 3 questions / day
ADDITIONAL_QUESTION_COST: 5 points
PREMIUM_TIER_1_BONUS: +5 questions / day
PREMIUM_TIER_2_LIMIT: UNLIMITED
COOLDOWN_SECONDS: 10 seconds between requests
NOTIFICATION: "ယနေ့အတွက် အခမဲ့ ၃ ကြိမ် မေးမြန်းမှု ပြည့်သွားပါပြီ။ Points ၅ မှတ်ဖြင့် ဆက်လက်မေးမြန်းနိုင်ပါသည် သို့မဟုတ် အသင်းဝင်အဆင့် မြှင့်တင်ပါ။"`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'safety_policy',
    icon: '🛡️',
    title: 'Safety & Content Boundary (အကာအကွယ် စည်းမျဉ်းများ)',
    category: 'SAFETY',
    model: 'guardrails-v2',
    temperature: 0.2,
    maxTokens: 1024,
    description: 'ကျန်းမာရေး၊ ဆေးကုသမှု၊ အသက်အန္တရာယ် သေဆုံးမှုနှင့် လောင်းကစားဂဏန်းများကို တင်းကြပ်စွာ တားမြစ်သော မူဝါဒ',
    content: `တားမြစ်ထားသော ကဏ္ဍများ:
၁။ အသက်အန္တရာယ်နှင့် သေဆုံးနိုင်သည့် ရက်စွဲ/အချိန် ဟောကိန်းများ (လုံးဝတားမြစ်သည်)
၂။ ဆေးဝါးကုသမှု၊ ရောဂါရှာဖွေမှုနှင့် ကျန်းမာရေး အန္တရာယ်များအတွက် ဆရာဝန်အစား ဟောကြားခြင်း (တားမြစ်သည်)
၃။ ထီဂဏန်း၊ ၂ လုံး/၃ လုံး လောင်းကစား တိုက်ရိုက်ဂဏန်းပေးခြင်း (တားမြစ်သည်)
Fallback တုံ့ပြန်စာ: "ဤမေးခွန်းသည် Akyannyan ၏ အကာအကွယ်မူဝါဒအရ တိုက်ရိုက်ဟောကြားရန် မသင့်လျော်ပါ။ ကျန်းမာရေးအတွက် သက်ဆိုင်ရာ ဆရာဝန်နှင့် လည်းကောင်း၊ အရေးကြီးဆုံးဖြတ်ချက်များအတွက် လက်တွေ့အခြေအနေများကို လည်းကောင်း အလေးထား စဉ်းစားပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။"`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tarot_context',
    icon: '🎴',
    title: 'Tarot Divination Prompt (တာရော့ ၃ ကတ် ဖြန့်ကြက်ခြင်း)',
    category: 'DIVINATION',
    model: 'gemini-1.5-pro',
    temperature: 0.8,
    maxTokens: 2048,
    description: 'အတိတ်၊ ပစ္စုပ္ပန်၊ အနာဂတ် ၃ ကတ်တွဲ တာရော့နိမိတ်ဖတ်ကြားချက်အတွက် AI လမ်းညွှန်ချက်',
    content: `မေးမြန်းသူရွေးချယ်ထားသော တာရော့ ၃ ကတ် (ကတ်အမည်၊ ပုံစံ၊ ဓမ္မသဘော) အပေါ် အခြေခံ၍:
- အတိတ် (Past): လက်ရှိအခြေအနေကို ဖြစ်စေခဲ့သော အကြောင်းရင်း
- ပစ္စုပ္ပန် (Present): ယခုရင်ဆိုင်နေရသော စိန်ခေါ်မှုနှင့် အခွင့်အလမ်း
- အနာဂတ် (Future): အကောင်းဆုံး ရွေးချယ်မှုပြုလုပ်ပါက ရရှိနိုင်မည့် အလားအလာ
အပြုသဘောဆောင်ပြီး စိတ်ခွန်အားဖြစ်စေသော အနက်ဖွင့်ဆိုချက်ကို ပေးပါ။`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export function OracleView() {
  const [templates, setTemplates] = useState<OracleTemplate[]>(INITIAL_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingTemplate, setEditingTemplate] = useState<OracleTemplate | null>(null);

  // Form states
  const [titleInput, setTitleInput] = useState('');
  const [modelInput, setModelInput] = useState('gemini-1.5-pro');
  const [tempInput, setTempInput] = useState(0.7);
  const [contentInput, setContentInput] = useState('');
  const [activeInput, setActiveInput] = useState(true);

  // Playground state
  const [testQuery, setTestQuery] = useState('');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleEditClick = (t: OracleTemplate) => {
    setEditingTemplate(t);
    setTitleInput(t.title);
    setModelInput(t.model);
    setTempInput(t.temperature);
    setContentInput(t.content);
    setActiveInput(t.isActive);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              title: titleInput,
              model: modelInput,
              temperature: tempInput,
              content: contentInput,
              isActive: activeInput,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    showToast(`'${titleInput}' ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။`, 'success');
    setEditingTemplate(null);
  };

  const handleToggleActive = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.isActive;
          showToast(`'${t.title}' ကို ${next ? 'ဖွင့်လိုက်ပါပြီ' : 'ပိတ်လိုက်ပါပြီ'}။`, 'info');
          return { ...t, isActive: next };
        }
        return t;
      })
    );
  };

  const handleRunSimulation = () => {
    if (!testQuery.trim()) {
      showToast('စမ်းသပ်ရန် မေးခွန်းတစ်ခု ရိုက်ထည့်ပါ', 'error');
      return;
    }
    setSimulating(true);
    setTestOutput(null);

    setTimeout(() => {
      setSimulating(false);
      setTestOutput(
        `[Oracle AI တုံ့ပြန်ချက် — Model: ${modelInput || 'gemini-1.5-pro'}]\n\n` +
          `မင်္ဂလာပါရှင်။ သင်၏ မေးမြန်းချက် ("${testQuery}") အတွက် မဟာဘုတ်နှင့် နက္ခတ်အခြေအနေများကို လေ့လာဆန်းစစ်ရာတွင် ယခုကာလသည် ကြိုးစားအားထုတ်မှုများ အောင်မြင်လွယ်သော အချိန်အခါဖြစ်ကြောင်း တွေ့ရှိရပါသည်။\n\n` +
          `အကြံပြုချက်: ကြီးမားသော ဆုံးဖြတ်ချက်များ မချမီ စိတ်အေးချမ်းစွာ သုံးသပ်ပြီး သောကြာ/တနင်္ဂနွေ ရက်များတွင် သက်ကြီးရွယ်အိုများကို ကူညီကုသိုလ်ပြုခြင်းဖြင့် ကံဇာတာ ပိုမိုအားကောင်းလာနိုင်ပါသည်။`
      );
    }, 700);
  };

  const filtered = templates.filter(
    (t) => selectedCategory === 'ALL' || t.category === selectedCategory
  );

  return (
    <div className="page">
      <PageHeader
        title="🔮 Oracle AI စနစ် စီမံခန့်ခွဲမှု (Oracle AI Engine)"
        description="Oracle တုံ့ပြန်မှု စည်းမျဉ်းများ (System Prompts)၊ နေ့စဉ် အမေးပုစ္ဆာ ကန့်သတ်ချက် (Quotas) နှင့် အကာအကွယ် စည်းမျဉ်းများ (Safety Boundaries) ကို ပြင်ဆင်ပါ။"
        action={
          <Button
            variant="jade"
            onClick={() => {
              const newT: OracleTemplate = {
                id: `template_${Date.now()}`,
                icon: '📝',
                title: 'Template အသစ်',
                category: 'SYSTEM',
                model: 'gemini-1.5-pro',
                temperature: 0.7,
                maxTokens: 1024,
                description: 'အသစ်ဖန်တီးထားသော ပုံစံခွက်',
                content: 'အသစ်ထည့်သွင်းမည့် စနစ် Prompt သို့မဟုတ် စည်းမျဉ်း...',
                isActive: true,
                updatedAt: new Date().toISOString(),
              };
              setTemplates((prev) => [newT, ...prev]);
              handleEditClick(newT);
            }}
          >
            ＋ Template အသစ်
          </Button>
        }
      />

      <div className="metrics">
        <Metric
          icon="🤖"
          label="AI ENGINE"
          value="Gemini 1.5 Pro"
          detail="Google Generative AI ပင်မအင်ဂျင်"
        />
        <Metric
          icon="📜"
          label="ACTIVE TEMPLATES"
          value={`${templates.filter((t) => t.isActive).length} ခု`}
          detail="စနစ်တွင်း အသုံးပြုနေသော Prompts"
        />
        <Metric
          icon="💬"
          label="DAILY QUOTA"
          value="3 qns / day"
          detail="Free Users (အပိုမေးမြန်းမှု 5 pts)"
        />
        <Metric
          icon="🛡️"
          label="SAFETY RULES"
          value="တင်းကြပ်စွာ (Active)"
          detail="ကျန်းမာရေးနှင့် လောင်းကစား ကန့်သတ်"
        />
      </div>

      {/* Main Settings Card */}
      <Card className="resource-card" style={{ marginBottom: '24px' }}>
        <div className="card-heading" style={{ marginBottom: '18px', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✦</span> ORACLE CONFIGURATION MATRIX
            </p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 4px', color: 'var(--text-main)' }}>
              တုံ့ပြန်မှု ပုံစံခွက်များနှင့် လမ်းညွှန်ချက် စည်းမျဉ်းများ
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
              အောက်ပါ ကဏ္ဍတစ်ခုချင်းစီ၏ စည်းမျဉ်းများကို စစ်ဆေးပြင်ဆင်နိုင်ပါသည်။
            </p>
          </div>
        </div>

        <div className="toolbar" style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              ['ALL', 'အားလုံးပြမည်'],
              ['SYSTEM', 'စနစ် Prompt (System)'],
              ['QUOTA', 'ကန့်သတ်ချက် (Quotas)'],
              ['SAFETY', 'အကာအကွယ် (Safety)'],
              ['DIVINATION', 'တာရော့ (Divination)'],
            ].map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '9px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    selectedCategory === cat
                      ? '1px solid var(--jade-primary, #3ecf74)'
                      : '1px solid var(--border-color, #1e3328)',
                  background:
                    selectedCategory === cat
                      ? 'rgba(62, 207, 116, 0.14)'
                      : 'var(--bg-primary, #0d1511)',
                  color:
                    selectedCategory === cat
                      ? 'var(--jade-primary, #3ecf74)'
                      : 'var(--text-muted, #859e92)',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-list">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="admin-setting"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '18px',
                padding: '20px 22px',
                background: 'var(--bg-primary, #0d1511)',
                border: '1px solid var(--border-color, #1e3328)',
                borderRadius: '14px',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(62, 207, 116, 0.1)',
                  border: '1px solid rgba(62, 207, 116, 0.25)',
                  fontSize: '22px',
                  color: 'var(--jade-primary, #3ecf74)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {item.icon}
              </span>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <b style={{ fontSize: '15px', color: 'var(--text-main, #e3ede8)' }}>{item.title}</b>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: 'rgba(62, 207, 116, 0.1)',
                      border: '1px solid rgba(62, 207, 116, 0.25)',
                      color: 'var(--jade-primary, #3ecf74)',
                      fontWeight: 700,
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: 'rgba(232, 181, 77, 0.1)',
                      border: '1px solid rgba(232, 181, 77, 0.25)',
                      color: 'var(--gold-primary, #e8b54d)',
                      fontWeight: 600,
                    }}
                  >
                    {item.model} · temp {item.temperature}
                  </span>
                </div>

                <small style={{ fontSize: '12.5px', color: 'var(--text-muted, #859e92)', lineHeight: '1.45' }}>
                  {item.description}
                </small>

                <div
                  style={{
                    marginTop: '6px',
                    padding: '10px 14px',
                    borderRadius: '9px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    color: 'rgba(227, 237, 232, 0.85)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.content}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleToggleActive(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title="အဖွင့်/အပိတ် ပြောင်းရန်"
                >
                  {item.isActive ? (
                    <Status tone="jade">🟢 ဖွင့်ထားသည်</Status>
                  ) : (
                    <Status tone="danger">🔴 ပိတ်ထားသည်</Status>
                  )}
                </button>

                <Button variant="ghost" onClick={() => handleEditClick(item)} style={{ padding: '7px 14px' }}>
                  ✏️ ပြင်ဆင်မည်
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Playground / Simulation Sandbox */}
      <Card className="resource-card">
        <div className="card-heading" style={{ marginBottom: '14px' }}>
          <div>
            <p className="eyebrow">🧪 SIMULATION SANDBOX</p>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '2px 0 4px', color: 'var(--text-main)' }}>
              Oracle AI စမ်းသပ်ခန်း
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
              လက်ရှိသတ်မှတ်ထားသော System Prompt နှင့် စည်းမျဉ်းများဖြင့် မေးခွန်းများကို အစမ်းသဘော မေးမြန်းစစ်ဆေးပါ။
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
            placeholder="မေးခွန်း စမ်းသပ်ရန် (ဥပမာ- ဒီနှစ် စီးပွားရေး အခြေအနေ ဘယ်လိုရှိနိုင်မလဲ?)..."
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '10px',
              background: 'var(--bg-primary, #0d1511)',
              border: '1px solid var(--border-color, #1e3328)',
              color: 'var(--text-main, #e3ede8)',
              fontSize: '13.5px',
            }}
          />
          <Button variant="jade" onClick={handleRunSimulation} disabled={simulating}>
            {simulating ? 'တွက်ချက်နေသည်...' : '⚡ စမ်းသပ်မေးမည်'}
          </Button>
        </div>

        {testOutput && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(62, 207, 116, 0.05)',
              border: '1px solid rgba(62, 207, 116, 0.25)',
              color: 'var(--text-main, #e3ede8)',
              fontSize: '13.5px',
              lineHeight: '1.65',
              whiteSpace: 'pre-wrap',
            }}
          >
            {testOutput}
          </div>
        )}
      </Card>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="oracle-edit-title">
          <div className="modal-backdrop" onClick={() => setEditingTemplate(null)} />
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 id="oracle-edit-title">✏️ Oracle ပုံစံခွက် ပြင်ဆင်ခြင်း</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingTemplate(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label>ခေါင်းစဉ် (Title)</label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>AI Model</label>
                  <select
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    className="form-input"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (အသေးစိတ်)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (လျင်မြန်)</option>
                    <option value="guardrails-v2">Safety Guardrails Engine</option>
                    <option value="rule-engine">Quotas Rule Engine</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Temperature ({tempInput})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempInput}
                    onChange={(e) => setTempInput(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--jade-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>တိကျသည် (0.0)</span>
                    <span>တီထွင်ဖန်တီးသည် (1.0)</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Prompt / Policy အသေးစိတ်</label>
                <textarea
                  rows={8}
                  required
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '12.5px', lineHeight: '1.5' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activeInput}
                    onChange={(e) => setActiveInput(e.target.checked)}
                  />
                  <span>ဤ ပုံစံခွက်/စည်းမျဉ်းကို စနစ်တွင်း အသက်သွင်းထားမည် (Is Active)</span>
                </label>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setEditingTemplate(null)}>
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade">
                  ✓ သိမ်းဆည်းမည်
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
