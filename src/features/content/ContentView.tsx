import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { adminContentService } from './services/content.service';
import type { ContentItem, ContentKind } from './types/content.types';

const TYPE_MAP: Record<ContentKind, { label: string; tone: 'jade' | 'gold' | 'danger' }> = {
  GAHTAR: { label: 'ဂါထာ', tone: 'jade' },
  VIDEO: { label: 'ဗီဒီယို', tone: 'gold' },
  ARTICLE: { label: 'ဆောင်းပါး', tone: 'jade' },
};

const TYPE_FILTER_TABS: { key: 'ALL' | ContentKind; label: string }[] = [
  { key: 'ALL', label: 'အားလုံး' },
  { key: 'GAHTAR', label: 'ဂါထာ' },
  { key: 'VIDEO', label: 'ဗီဒီယို' },
  { key: 'ARTICLE', label: 'ဆောင်းပါး' },
];

const KIND_OPTIONS: ContentKind[] = ['ARTICLE', 'GAHTAR', 'VIDEO'];

const DEFAULT_GLYPH: Record<ContentKind, string> = {
  GAHTAR: '📿',
  VIDEO: '🎬',
  ARTICLE: '📰',
};

const GLYPH_CHOICES = ['📰', '📿', '🎬', '📖', '🕊️', '✨', '🌙', '🙏'];

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('my-MM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function ContentView() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | ContentKind>('ALL');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [fTitle, setFTitle] = useState('');
  const [fKind, setFKind] = useState<ContentKind>('ARTICLE');
  const [fGlyph, setFGlyph] = useState(DEFAULT_GLYPH.ARTICLE);
  const [fBody, setFBody] = useState('');
  const [fCoverUrl, setFCoverUrl] = useState('');
  const [fAudioUrl, setFAudioUrl] = useState('');
  const [fVideoUrl, setFVideoUrl] = useState('');
  const [fIsFree, setFIsFree] = useState(true);
  const [fIsPublished, setFIsPublished] = useState(true);
  const [fMorning, setFMorning] = useState(false);
  const [fMeaning, setFMeaning] = useState('');

  const total = items.length;
  const published = items.filter((i) => i.published).length;
  const videoCount = items.filter((i) => i.kind === 'VIDEO').length;
  const premiumCount = items.filter((i) => !i.isFree).length;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await adminContentService.list({
        kind: typeFilter,
        search,
        page: 0,
        size: 50,
      });
      setItems(data.content || []);
    } catch (err: any) {
      showToast(err?.message || 'အကြောင်းအရာ ရယူ၍ မရပါ', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFTitle('');
    setFKind('ARTICLE');
    setFGlyph(DEFAULT_GLYPH.ARTICLE);
    setFBody('');
    setFCoverUrl('');
    setFAudioUrl('');
    setFVideoUrl('');
    setFIsFree(true);
    setFIsPublished(true);
    setFMorning(false);
    setFMeaning('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setFTitle(item.title);
    setFKind(item.kind);
    setFGlyph(item.glyph || DEFAULT_GLYPH[item.kind]);
    setFBody(item.body || '');
    setFCoverUrl(item.coverImageUrl || '');
    setFAudioUrl(item.audioUrl || '');
    setFVideoUrl(item.videoUrl || '');
    setFIsFree(item.isFree);
    setFIsPublished(item.published);
    setFMorning(!!item.isMorningRitual);
    setFMeaning(item.meaning || '');
    setIsModalOpen(true);
  };

  const handleKindChange = (kind: ContentKind) => {
    setFKind(kind);
    if (!fGlyph || Object.values(DEFAULT_GLYPH).includes(fGlyph)) {
      setFGlyph(DEFAULT_GLYPH[kind]);
    }
    if (kind !== 'GAHTAR') {
      setFMorning(false);
    }
  };

  const handleUpload = async (purpose: 'cover' | 'video' | 'audio', file?: File) => {
    if (!file) return;
    setUploading(purpose);
    try {
      const result = await adminContentService.upload(file, purpose);
      if (purpose === 'cover') setFCoverUrl(result.url);
      if (purpose === 'video') setFVideoUrl(result.url);
      if (purpose === 'audio') setFAudioUrl(result.url);
      showToast('ဖိုင် တင်ပြီးပါပြီ', 'success');
    } catch (err: any) {
      showToast(err?.message || 'ဖိုင် တင်၍ မရပါ', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) {
      showToast('ခေါင်းစဉ် ထည့်သွင်းပါ။', 'error');
      return;
    }
    if (fKind === 'VIDEO' && !fVideoUrl.trim() && fIsPublished) {
      showToast('ဗီဒီယို ဖိုင် (သို့) URL လိုအပ်ပါသည်။', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      kind: fKind,
      title: fTitle.trim(),
      body: fBody,
      glyph: fGlyph || DEFAULT_GLYPH[fKind],
      isFree: fIsFree,
      coverImageUrl: fCoverUrl.trim() || null,
      videoUrl: fKind === 'VIDEO' ? fVideoUrl.trim() || null : null,
      audioUrl: fKind === 'GAHTAR' ? fAudioUrl.trim() || null : null,
      isMorningRitual: fKind === 'GAHTAR' && fMorning,
      meaning: fKind === 'GAHTAR' ? fMeaning.trim() || null : null,
      published: fIsPublished,
    };
    try {
      if (editingItem) {
        await adminContentService.update(editingItem.id, payload);
        showToast(`'${fTitle}' ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`, 'success');
      } else {
        await adminContentService.create(payload);
        showToast(`'${fTitle}' ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။`, 'success');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showToast(err?.message || 'သိမ်း၍ မရပါ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`'${item.title}' ကို ဖျက်ရန် သေချာပါသလား?`)) return;
    try {
      await adminContentService.delete(item.id);
      showToast(`'${item.title}' ကို ဖျက်ပြီးပါပြီ။`, 'info');
      fetchItems();
    } catch (err: any) {
      showToast(err?.message || 'ဖျက်၍ မရပါ', 'error');
    }
  };

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      await adminContentService.publish(item.id, !item.published);
      showToast(
        item.published
          ? `'${item.title}' ကို Draft သို့ ပြောင်းပြီးပါပြီ။`
          : `'${item.title}' ကို ထုတ်ဝေပြီးပါပြီ။`,
        'info',
      );
      fetchItems();
    } catch (err: any) {
      showToast(err?.message || 'အခြေအနေ ပြောင်း၍ မရပါ', 'error');
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="ဗဟုသုတ စီမံခန့်ခွဲမှု"
        description="ဂါထာ၊ ဗီဒီယိုနှင့် ဆောင်းပါးများကို ထည့်သွင်း၊ ပြင်ဆင်၊ ထုတ်ဝေပါ။"
        action={
          <div className="header-action-group">
            <Button variant="ghost" onClick={fetchItems} disabled={loading}>
              ပြန်စစ်မည်
            </Button>
            <Button onClick={openCreateModal} variant="jade">
              ＋ အကြောင်းအရာ အသစ်
            </Button>
          </div>
        }
      />

      <div className="metrics">
        <Metric icon="📚" label="စုစုပေါင်း" value={String(total)} detail={`${published} ခု ထုတ်ဝေပြီး`} />
        <Metric icon="✅" label="ထုတ်ဝေပြီး" value={String(published)} detail={`${total - published} ခု Draft`} />
        <Metric icon="🎬" label="ဗီဒီယို" value={String(videoCount)} detail="ဗဟုသုတ သင်ခန်းစာ" />
        <Metric icon="👑" label="Premium ကန့်သတ်" value={String(premiumCount)} detail={`${total - premiumCount} ခု အခမဲ့`} />
      </div>

      <Card className="resource-card">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {TYPE_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTypeFilter(tab.key)}
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                border: `1px solid ${typeFilter === tab.key ? 'var(--jade-primary)' : 'var(--border-color)'}`,
                background: typeFilter === tab.key ? 'var(--jade-glow)' : 'var(--bg-tertiary)',
                color: typeFilter === tab.key ? 'var(--jade-primary)' : 'var(--text-muted)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchItems();
            }}
            placeholder="ရှာဖွေရန်..."
            aria-label="Search content"
          />
          <Button variant="ghost" onClick={fetchItems} disabled={loading}>
            ရှာမည်
          </Button>
        </div>

        <div className="resource-list">
          {loading && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              အကြောင်းအရာ ရယူနေပါသည်...
            </div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              အကြောင်းအရာ မရှိသေးပါ။
            </div>
          )}
          {!loading &&
            items.map((item) => (
              <div className="resource-row" key={item.id}>
                <div className="content-row-thumb" aria-hidden="true">
                  <RowThumb url={item.coverImageUrl} glyph={item.glyph || DEFAULT_GLYPH[item.kind]} />
                </div>
                <div className="content-row-info">
                  <b>
                    {item.glyph ? `${item.glyph} ` : ''}
                    {item.title}
                  </b>
                  <small>{item.category}</small>
                </div>
                <div className="content-row-meta">
                  <Status tone={TYPE_MAP[item.kind].tone}>{TYPE_MAP[item.kind].label}</Status>
                  <Status tone={item.isFree ? 'jade' : 'gold'}>{item.isFree ? 'အခမဲ့' : 'PREMIUM'}</Status>
                  <Status tone={item.published ? 'jade' : 'gold'}>
                    {item.published ? 'Published' : 'Draft'}
                  </Status>
                  {item.isMorningRitual ? <Status tone="gold">နံနက်</Status> : null}
                </div>
                <time style={{ flexShrink: 0, fontSize: '12px', color: 'var(--text-muted)', minWidth: '90px' }}>
                  {formatDate(item.updatedAt)}
                </time>
                <div className="content-row-actions">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    aria-label={item.published ? 'Unpublish' : 'Publish'}
                    title={item.published ? 'Draft သို့ ပြောင်းမည်' : 'ထုတ်ဝေမည်'}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {item.published ? '📝' : '✅'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    aria-label={`Edit ${item.title}`}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    aria-label={`Delete ${item.title}`}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1px solid var(--danger-primary)',
                      background: 'var(--danger-bg)',
                      color: 'var(--danger-primary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
          <div className="modal-backdrop" onClick={() => !saving && setIsModalOpen(false)} />
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2 id="content-modal-title">
                {editingItem ? `'${editingItem.title}' ပြင်ဆင်မည်` : 'အကြောင်းအရာ အသစ် ထည့်မည်'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label htmlFor="content-title">ခေါင်းစဉ်</label>
                <input
                  id="content-title"
                  className="form-input"
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  placeholder="ဥပမာ - မေတ္တာပို့ ဂါထာ"
                  required
                />
              </div>

              <div className="form-group">
                <label>အမျိုးအစား</label>
                <div className="content-kind-grid" role="group" aria-label="အမျိုးအစား">
                  {KIND_OPTIONS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className={`content-kind-chip${fKind === kind ? ' active' : ''}`}
                      onClick={() => handleKindChange(kind)}
                    >
                      {DEFAULT_GLYPH[kind]} {TYPE_MAP[kind].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content-glyph">အမှတ်အသား</label>
                <div className="content-glyph-row">
                  {GLYPH_CHOICES.map((glyph) => (
                    <button
                      key={glyph}
                      type="button"
                      className={`content-glyph-chip${fGlyph === glyph ? ' active' : ''}`}
                      onClick={() => setFGlyph(glyph)}
                      aria-label={glyph}
                    >
                      {glyph}
                    </button>
                  ))}
                </div>
                <input
                  id="content-glyph"
                  className="form-input"
                  value={fGlyph}
                  onChange={(e) => setFGlyph(e.target.value)}
                  placeholder="သို့မဟုတ် စိတ်ကြိုက် ထည့်ပါ"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content-body">အကြောင်းအရာ</label>
                <textarea
                  id="content-body"
                  className="form-input"
                  value={fBody}
                  onChange={(e) => setFBody(e.target.value)}
                  placeholder={fKind === 'GAHTAR' ? 'ဂါထာ စာသား...' : 'ဗမာစာဖြင့် အကြောင်းအရာ ရေးပါ...'}
                  rows={5}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              {fKind === 'GAHTAR' && (
                <div className="form-group">
                  <label htmlFor="content-meaning">အနက် (နံနက်ခင်း ဂါထာတွင် ပြမည်)</label>
                  <textarea
                    id="content-meaning"
                    className="form-input"
                    value={fMeaning}
                    onChange={(e) => setFMeaning(e.target.value)}
                    placeholder="သတ္တဝါအားလုံး ရန်မရှိကြပါစေ..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              <MediaField
                id="content-cover"
                label="ကာဗာ ပုံ"
                accept="image/*"
                uploading={uploading === 'cover'}
                value={fCoverUrl}
                onChange={setFCoverUrl}
                onFile={(file) => handleUpload('cover', file)}
                preview
              />

              {fKind === 'GAHTAR' && (
                <MediaField
                  id="content-audio"
                  label="အသံဖိုင် (optional)"
                  accept="audio/*"
                  uploading={uploading === 'audio'}
                  value={fAudioUrl}
                  onChange={setFAudioUrl}
                  onFile={(file) => handleUpload('audio', file)}
                />
              )}

              {fKind === 'VIDEO' && (
                <MediaField
                  id="content-video"
                  label="ဗီဒီယို"
                  accept="video/*"
                  uploading={uploading === 'video'}
                  value={fVideoUrl}
                  onChange={setFVideoUrl}
                  onFile={(file) => handleUpload('video', file)}
                />
              )}

              {uploading && (
                <p className="form-hint">ဖိုင် တင်နေပါသည် ({uploading})...</p>
              )}

              <div className="content-check-grid">
                <label className="content-check">
                  <input
                    type="checkbox"
                    checked={!fIsFree}
                    onChange={(e) => setFIsFree(!e.target.checked)}
                  />
                  Premium ကန့်သတ်
                </label>
                <label className="content-check">
                  <input
                    type="checkbox"
                    checked={fIsPublished}
                    onChange={(e) => setFIsPublished(e.target.checked)}
                  />
                  ချက်ချင်း ထုတ်ဝေမည်
                </label>
                {fKind === 'GAHTAR' ? (
                  <label className="content-check">
                    <input
                      type="checkbox"
                      checked={fMorning}
                      onChange={(e) => setFMorning(e.target.checked)}
                    />
                    နံနက်ခင်း ဂါထာ
                  </label>
                ) : null}
              </div>

              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade" disabled={saving || !!uploading}>
                  {saving ? 'သိမ်းနေပါသည်...' : editingItem ? 'ပြင်ဆင်မည်' : 'ထည့်သွင်းမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RowThumb({ url, glyph }: { url?: string | null; glyph: string }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return <img src={url} alt="" onError={() => setBroken(true)} />;
  }
  return <span>{glyph}</span>;
}

function MediaField({
  id,
  label,
  accept,
  uploading,
  value,
  onChange,
  onFile,
  preview = false,
}: {
  id: string;
  label: string;
  accept: string;
  uploading: boolean;
  value: string;
  onChange: (value: string) => void;
  onFile: (file?: File) => void;
  preview?: boolean;
}) {
  const [dragging, setDragging] = useState(false);

  const pick = (file?: File) => {
    if (!file || uploading) return;
    onFile(file);
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {preview && value ? (
        <div className="content-cover-preview">
          <img src={value} alt="" />
          <button type="button" className="content-cover-remove" onClick={() => onChange('')}>
            ဖယ်ရှားမည်
          </button>
        </div>
      ) : (
        <label
          className={`content-file-drop${dragging ? ' dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            id={id}
            type="file"
            accept={accept}
            disabled={uploading}
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.currentTarget.value = '';
            }}
          />
          {uploading ? 'ဖိုင် တင်နေပါသည်...' : 'ဖိုင် ရွေးမည် သို့ ဤနေရာသို့ ချပါ'}
        </label>
      )}
      <input
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="သို့မဟုတ် URL ကူးထည့်ပါ"
        aria-label={`${label} URL`}
      />
    </div>
  );
}
