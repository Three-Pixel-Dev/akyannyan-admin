import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { adminOracleService } from './services/oracle.service';
import { toOracleTemplate, type OracleTemplate } from './types/oracle.types';

export type { OracleTemplate };

export function OracleView() {
  const [templates, setTemplates] = useState<OracleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingTemplate, setEditingTemplate] = useState<OracleTemplate | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [modelInput, setModelInput] = useState('gemini-flash-lite-latest');
  const [tempInput, setTempInput] = useState(0.7);
  const [contentInput, setContentInput] = useState('');
  const [activeInput, setActiveInput] = useState(true);
  const [creating, setCreating] = useState(false);

  const [testQuery, setTestQuery] = useState('');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const rows = await adminOracleService.list();
      setTemplates(rows.map(toOracleTemplate));
    } catch (e: any) {
      showToast(e?.message || 'Oracle prompts ရယူ၍ မရပါ', 'error');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleEditClick = (t: OracleTemplate) => {
    setCreating(false);
    setEditingTemplate(t);
    setTitleInput(t.title);
    setModelInput(t.model);
    setTempInput(t.temperature);
    setContentInput(t.content);
    setActiveInput(t.isActive);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      if (creating || !editingTemplate.id || editingTemplate.id < 0) {
        const created = await adminOracleService.create({
          code: `template_${Date.now()}`,
          category: editingTemplate.category,
          icon: editingTemplate.icon || '📝',
          title: titleInput,
          model: modelInput,
          temperature: tempInput,
          maxTokens: editingTemplate.maxTokens || 2048,
          description: editingTemplate.description,
          content: contentInput,
          active: activeInput,
        });
        showToast(`'${titleInput}' ကို ဖန်တီးပြီးပါပြီ။`, 'success');
        setTemplates((prev) => [toOracleTemplate(created), ...prev.filter((t) => t.id !== editingTemplate.id)]);
      } else {
        const updated = await adminOracleService.update(editingTemplate.id, {
          category: editingTemplate.category,
          icon: editingTemplate.icon,
          title: titleInput,
          model: modelInput,
          temperature: tempInput,
          maxTokens: editingTemplate.maxTokens,
          description: editingTemplate.description,
          content: contentInput,
          active: activeInput,
        });
        showToast(`'${titleInput}' ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။`, 'success');
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplate.id ? toOracleTemplate(updated) : t)),
        );
      }
      setEditingTemplate(null);
      setCreating(false);
    } catch (err: any) {
      showToast(err?.message || 'သိမ်း၍ မရပါ', 'error');
    }
  };

  const handleToggleActive = async (id: number) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;
    try {
      const updated = await adminOracleService.update(id, {
        category: target.category,
        icon: target.icon,
        title: target.title,
        model: target.model,
        temperature: target.temperature,
        maxTokens: target.maxTokens,
        description: target.description,
        content: target.content,
        active: !target.isActive,
      });
      setTemplates((prev) => prev.map((t) => (t.id === id ? toOracleTemplate(updated) : t)));
      showToast(`'${target.title}' ကို ${updated.active ? 'ဖွင့်လိုက်ပါပြီ' : 'ပိတ်လိုက်ပါပြီ'}။`, 'info');
    } catch (err: any) {
      showToast(err?.message || 'ပြင်၍ မရပါ', 'error');
    }
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
        `[Oracle AI တုံ့ပြန်ချက် — Model: ${modelInput || 'gemini-flash-lite-latest'}]\n\n` +
          `မင်္ဂလာပါရှင်။ သင်၏ မေးမြန်းချက် ("${testQuery}") အတွက် မဟာဘုတ်နှင့် နက္ခတ်အခြေအနေများကို လေ့လာဆန်းစစ်ရာတွင် ယခုကာလသည် ကြိုးစားအားထုတ်မှုများ အောင်မြင်လွယ်သော အချိန်အခါဖြစ်ကြောင်း တွေ့ရှိရပါသည်။\n\n` +
          `အကြံပြုချက်: ကြီးမားသော ဆုံးဖြတ်ချက်များ မချမီ စိတ်အေးချမ်းစွာ သုံးသပ်ပြီး သောကြာ/တနင်္ဂနွေ ရက်များတွင် သက်ကြီးရွယ်အိုများကို ကူညီကုသိုလ်ပြုခြင်းဖြင့် ကံဇာတာ ပိုမိုအားကောင်းလာနိုင်ပါသည်။`,
      );
    }, 700);
  };

  const filtered = templates.filter(
    (t) => selectedCategory === 'ALL' || t.category === selectedCategory,
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
                id: -Date.now(),
                code: '',
                icon: '📝',
                title: 'Template အသစ်',
                category: 'SYSTEM',
                model: 'gemini-flash-lite-latest',
                temperature: 0.7,
                maxTokens: 1024,
                description: 'အသစ်ဖန်တီးထားသော ပုံစံခွက်',
                content: 'အသစ်ထည့်သွင်းမည့် စနစ် Prompt သို့မဟုတ် စည်းမျဉ်း...',
                active: true,
                isActive: true,
                updatedAt: new Date().toISOString(),
              };
              setCreating(true);
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
          value="Gemini"
          detail="Google Generative AI ပင်မအင်ဂျင်"
        />
        <Metric
          icon="📜"
          label="ACTIVE TEMPLATES"
          value={`${templates.filter((t) => t.isActive).length} ခု`}
          detail="စနစ်တွင်း အသုံးပြုနေသော Prompts"
        />
        <Metric icon="💬" label="DAILY QUOTA" value="3 / 50" detail="Free / Premium (server)" />
        <Metric
          icon="🛡️"
          label="SAFETY RULES"
          value="တင်းကြပ်စွာ (Active)"
          detail="ကျန်းမာရေးနှင့် လောင်းကစား ကန့်သတ်"
        />
      </div>

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
              {loading ? 'Loading…' : 'အောက်ပါ ကဏ္ဍတစ်ခုချင်းစီ၏ စည်းမျဉ်းများကို စစ်ဆေးပြင်ဆင်နိုင်ပါသည်။'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['ALL', 'SYSTEM', 'QUOTA', 'SAFETY', 'DIVINATION'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                border:
                  selectedCategory === cat ? '1px solid var(--jade)' : '1px solid var(--border)',
                background: selectedCategory === cat ? 'rgba(22, 160, 133, 0.12)' : 'transparent',
                color: 'var(--text-main)',
                borderRadius: 999,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span>{t.icon}</span>
                  <strong>{t.title}</strong>
                  <Status tone={t.isActive ? 'jade' : 'danger'}>
                    {t.isActive ? 'ACTIVE' : 'OFF'}
                  </Status>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
                  {t.category} · {t.model} · temp {t.temperature}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-main)' }}>
                  {(t.description || t.content || '').slice(0, 160)}
                  {(t.description || t.content || '').length > 160 ? '…' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Button variant="ghost" onClick={() => handleToggleActive(t.id)}>
                  {t.isActive ? 'ပိတ်' : 'ဖွင့်'}
                </Button>
                <Button variant="jade" onClick={() => handleEditClick(t)}>
                  ပြင်မည်
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {editingTemplate ? (
        <Card className="resource-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Prompt ပြင်ဆင်ခြင်း</h3>
          <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              Title
              <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} required />
            </label>
            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              Model
              <input value={modelInput} onChange={(e) => setModelInput(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              Temperature
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={tempInput}
                onChange={(e) => setTempInput(Number(e.target.value))}
              />
            </label>
            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              Content
              <textarea
                rows={10}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                required
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={activeInput}
                onChange={(e) => setActiveInput(e.target.checked)}
              />
              Active
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" variant="jade">
                သိမ်းမည်
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingTemplate(null);
                  setCreating(false);
                  loadTemplates();
                }}
              >
                ပယ်ဖျက်
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="resource-card">
        <h3 style={{ marginTop: 0 }}>Playground (local simulate)</h3>
        <textarea
          rows={3}
          value={testQuery}
          onChange={(e) => setTestQuery(e.target.value)}
          placeholder="စမ်းသပ်မေးခွန်း..."
          style={{ width: '100%', marginBottom: 8 }}
        />
        <Button variant="jade" onClick={handleRunSimulation} disabled={simulating}>
          {simulating ? 'စမ်းသပ်နေသည်…' : 'Simulate'}
        </Button>
        {testOutput ? (
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 13 }}>{testOutput}</pre>
        ) : null}
      </Card>
    </div>
  );
}
