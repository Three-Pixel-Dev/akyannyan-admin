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
  const [saving, setSaving] = useState(false);

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

  const fillForm = (t: OracleTemplate) => {
    setTitleInput(t.title);
    setModelInput(t.model);
    setTempInput(t.temperature);
    setContentInput(t.content);
    setActiveInput(t.isActive);
  };

  const closeFormModal = () => {
    setEditingTemplate(null);
    setSaving(false);
  };

  const handleEditClick = (t: OracleTemplate) => {
    setEditingTemplate(t);
    fillForm(t);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || saving || !editingTemplate.id || editingTemplate.id < 0) return;
    setSaving(true);
    try {
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
      closeFormModal();
    } catch (err: any) {
      showToast(err?.message || 'သိမ်း၍ မရပါ', 'error');
      setSaving(false);
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

  const filtered = templates.filter(
    (t) => selectedCategory === 'ALL' || t.category === selectedCategory,
  );

  const activeCount = templates.filter((t) => t.isActive).length;

  return (
    <div className="page">
      <PageHeader
        title="🔮 Oracle AI စနစ် စီမံခန့်ခွဲမှု"
        description="Oracle system prompts ကို API မှ တိုက်ရိုက် ပြင်ဆင်ပါ။"
      />

      <div className="metrics">
        <Metric
          icon="📜"
          label="ACTIVE TEMPLATES"
          value={loading ? '…' : `${activeCount} ခု`}
          detail={`${templates.length} total prompts (API)`}
        />
        <Metric
          icon="📂"
          label="CATEGORIES"
          value={loading ? '…' : String(new Set(templates.map((t) => t.category)).size)}
          detail="Distinct prompt categories"
        />
      </div>

      <Card className="resource-card" style={{ marginBottom: '24px' }}>
        <div className="card-heading" style={{ marginBottom: '18px', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✦</span> ORACLE PROMPTS
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
          {!loading && filtered.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              No prompts in this category.
            </p>
          ) : null}
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
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="oracle-prompt-modal-title"
        >
          <div className="modal-backdrop" onClick={() => !saving && closeFormModal()} />
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2 id="oracle-prompt-modal-title">Prompt ပြင်ဆင်ခြင်း</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !saving && closeFormModal()}
                aria-label="Close dialog"
                disabled={saving}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                Title
                <input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  disabled={saving}
                />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                Model
                <input
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  disabled={saving}
                />
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
                  disabled={saving}
                />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                Content
                <textarea
                  rows={12}
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  required
                  disabled={saving}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5 }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={activeInput}
                  onChange={(e) => setActiveInput(e.target.checked)}
                  disabled={saving}
                />
                Active
              </label>
              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={closeFormModal} disabled={saving}>
                  ပယ်ဖျက်
                </Button>
                <Button type="submit" variant="jade" disabled={saving}>
                  {saving ? 'သိမ်းနေသည်…' : 'သိမ်းမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
