import { useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';

/* ─── Types ─── */
interface ContentItem {
  id: number;
  title: string;
  type: 'GAHTAR' | 'ARTICLE' | 'VIDEO' | 'AUDIO';
  daySign: string;
  isPremium: boolean;
  isPublished: boolean;
  audioUrl?: string;
  videoUrl?: string;
  body: string;
  updatedAt: string;
}

/* ─── Mock Data ─── */
const DAY_SIGNS = ['အားလုံး', 'တနင်္ဂနွေသား', 'တနင်္လာသား', 'အင်္ဂါသား', 'ဗုဒ္ဓဟူးသား', 'ရာဟုသား', 'ကြာသပတေးသား', 'သောကြာသား', 'စနေသား'];

const INITIAL_CONTENT: ContentItem[] = [
  { id: 1, title: 'မေတ္တာပို့ ဂါထာ', type: 'GAHTAR', daySign: 'အားလုံး', isPremium: false, isPublished: true, audioUrl: 'https://audio.akyannyan.com/metta-sutta.mp3', body: 'သဗ္ဗေ သတ္တာ သုခီ ဟောန္တု...', updatedAt: '2026-09-10' },
  { id: 2, title: 'ပရိတ်ကြီး ၁၁ သုတ်', type: 'GAHTAR', daySign: 'အားလုံး', isPremium: false, isPublished: true, audioUrl: 'https://audio.akyannyan.com/parittas.mp3', body: 'မဂ္ဂလ သုတ်၊ ရတန သုတ်၊ ကရဏီယ မေတ္တ သုတ်...', updatedAt: '2026-09-09' },
  { id: 3, title: 'စနေသား နေ့စဉ် ကံဇာတာ', type: 'ARTICLE', daySign: 'စနေသား', isPremium: false, isPublished: true, body: 'ယနေ့ စနေသားများအတွက် ကံကောင်းချိန်မှာ နံနက် ၉ နာရီမှ ၁၁ နာရီ ဖြစ်ပြီး...', updatedAt: '2026-09-10' },
  { id: 4, title: 'တနင်္ဂနွေသား နေ့စဉ် ကံဇာတာ', type: 'ARTICLE', daySign: 'တနင်္ဂနွေသား', isPremium: false, isPublished: true, body: 'ယနေ့ တနင်္ဂနွေသားများအတွက် အထူးသတိထားရမည့် ကိစ္စမှာ...', updatedAt: '2026-09-10' },
  { id: 5, title: 'အိမ်ဝယ်ရန် ရက်ကောင်းရွေးနည်း', type: 'ARTICLE', daySign: 'အားလုံး', isPremium: true, isPublished: true, body: 'အိမ်ဝယ်ရန်အတွက် ရက်ကောင်း ရွေးချယ်ရာတွင် ရက်ရာဇာ နေ့နှင့်...', updatedAt: '2026-09-08' },
  { id: 6, title: 'မဟာဘုတ် အကြောင်းသိကောင်းစရာ', type: 'ARTICLE', daySign: 'အားလုံး', isPremium: false, isPublished: true, body: 'မဟာဘုတ် ဆိုသည်မှာ မြန်မာ့ရိုးရာ နက္ခတ်ဗေဒင်ပညာ၏ အခြေခံ...', updatedAt: '2026-09-07' },
  { id: 7, title: 'KP နက္ခတ် ပညာ အခြေခံ သင်ခန်းစာ', type: 'VIDEO', daySign: 'အားလုံး', isPremium: true, isPublished: true, videoUrl: 'https://youtu.be/kp-astrology-101', body: 'KP (Krishnamurti Paddhati) နက္ခတ်ပညာ၏ သမိုင်းနှင့် အခြေခံ...', updatedAt: '2026-09-06' },
  { id: 8, title: 'ဗုဒ္ဓဟူးသား အထူး ယတြာများ', type: 'ARTICLE', daySign: 'ဗုဒ္ဓဟူးသား', isPremium: false, isPublished: true, body: 'ဗုဒ္ဓဟူးသားများအတွက် အထူးထိရောက်သော ယတြာများမှာ...', updatedAt: '2026-09-05' },
  { id: 9, title: 'မင်္ဂလာဆောင် ရက်ကောင်းရွေးခြင်း', type: 'VIDEO', daySign: 'အားလုံး', isPremium: true, isPublished: false, videoUrl: 'https://youtu.be/wedding-day-pick', body: 'မင်္ဂလာဆောင် ရက်ကောင်းရွေးရာတွင် ရှောင်ကြဉ်ရမည့် ရက်ယုတ်မာ...', updatedAt: '2026-09-04' },
  { id: 10, title: 'နံနက်ခင်း မေတ္တာသုတ် ရွတ်ဆိုခြင်း', type: 'AUDIO', daySign: 'အားလုံး', isPremium: false, isPublished: true, audioUrl: 'https://audio.akyannyan.com/morning-metta.mp3', body: 'နံနက်တိုင်း မေတ္တာသုတ် ရွတ်ဆိုခြင်းဖြင့် စိတ်ငြိမ်းချမ်းမှု...', updatedAt: '2026-09-03' },
  { id: 11, title: 'ကံကြမ္မာ ဖြေရှင်းနည်း ယတြာခုနစ်မျိုး', type: 'ARTICLE', daySign: 'အားလုံး', isPremium: true, isPublished: true, body: 'ကံကြမ္မာကို ပြုပြင်ဖြေရှင်းနိုင်သော ယတြာ ခုနစ်မျိုးကို...', updatedAt: '2026-09-02' },
  { id: 12, title: 'သောကြာသား တစ်ပတ်စာ ဟောစာတမ်း', type: 'ARTICLE', daySign: 'သောကြာသား', isPremium: false, isPublished: true, body: 'ဤအပတ်အတွင်း သောကြာသားများ ငွေကြေးကံ ကောင်းမည်ဖြစ်ပြီး...', updatedAt: '2026-09-01' },
];

const TYPE_MAP: Record<ContentItem['type'], { label: string; tone: 'jade' | 'gold' | 'danger' }> = {
  GAHTAR: { label: '📿 ဂါထာ', tone: 'jade' },
  ARTICLE: { label: '📝 ဆောင်းပါး', tone: 'jade' },
  VIDEO: { label: '🎬 ဗီဒီယို', tone: 'gold' },
  AUDIO: { label: '🎵 အသံ', tone: 'gold' },
};

const TYPE_FILTER_TABS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'အားလုံး' },
  { key: 'GAHTAR', label: '📿 ဂါထာ' },
  { key: 'ARTICLE', label: '📝 ဆောင်းပါး' },
  { key: 'VIDEO', label: '🎬 ဗီဒီယို' },
  { key: 'AUDIO', label: '🎵 အသံ' },
];

/* ─── Component ─── */
export function ContentView() {
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [daySignFilter, setDaySignFilter] = useState('အားလုံး');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Form
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState<ContentItem['type']>('ARTICLE');
  const [fDaySign, setFDaySign] = useState('အားလုံး');
  const [fBody, setFBody] = useState('');
  const [fAudioUrl, setFAudioUrl] = useState('');
  const [fVideoUrl, setFVideoUrl] = useState('');
  const [fIsPremium, setFIsPremium] = useState(false);
  const [fIsPublished, setFIsPublished] = useState(true);

  // Stats
  const total = items.length;
  const published = items.filter((i) => i.isPublished).length;
  const audioVideo = items.filter((i) => i.type === 'AUDIO' || i.type === 'VIDEO').length;
  const premiumCount = items.filter((i) => i.isPremium).length;

  // Filtered list
  const filtered = items.filter((i) => {
    if (typeFilter !== 'ALL' && i.type !== typeFilter) return false;
    if (daySignFilter !== 'အားလုံး' && i.daySign !== daySignFilter && i.daySign !== 'အားလုံး') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !i.body.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFTitle('');
    setFType('ARTICLE');
    setFDaySign('အားလုံး');
    setFBody('');
    setFAudioUrl('');
    setFVideoUrl('');
    setFIsPremium(false);
    setFIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setFTitle(item.title);
    setFType(item.type);
    setFDaySign(item.daySign);
    setFBody(item.body);
    setFAudioUrl(item.audioUrl || '');
    setFVideoUrl(item.videoUrl || '');
    setFIsPremium(item.isPremium);
    setFIsPublished(item.isPublished);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) {
      showToast('ခေါင်းစဉ် ထည့်သွင်းပါ။', 'error');
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, title: fTitle, type: fType, daySign: fDaySign, body: fBody, audioUrl: fAudioUrl || undefined, videoUrl: fVideoUrl || undefined, isPremium: fIsPremium, isPublished: fIsPublished, updatedAt: now }
            : i
        )
      );
      showToast(`'${fTitle}' ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`, 'success');
    } else {
      const newItem: ContentItem = {
        id: Date.now(),
        title: fTitle,
        type: fType,
        daySign: fDaySign,
        body: fBody,
        audioUrl: fAudioUrl || undefined,
        videoUrl: fVideoUrl || undefined,
        isPremium: fIsPremium,
        isPublished: fIsPublished,
        updatedAt: now,
      };
      setItems((prev) => [newItem, ...prev]);
      showToast(`'${fTitle}' ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: ContentItem) => {
    if (!confirm(`'${item.title}' ကို ဖျက်ရန် သေချာပါသလား?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    showToast(`'${item.title}' ကို ဖျက်ပြီးပါပြီ။`, 'info');
  };

  const handleTogglePublish = (item: ContentItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
    );
    showToast(
      item.isPublished
        ? `'${item.title}' ကို ဖျုတ်ထားပြီးပါပြီ (Draft)။`
        : `'${item.title}' ကို ထုတ်ဝေပြီးပါပြီ (Published)။`,
      'info'
    );
  };

  return (
    <div className="page">
      <PageHeader
        title="အကြောင်းအရာ စီမံခန့်ခွဲမှု (Content)"
        description="ကံဇာတာ၊ ဂါထာ၊ ဗဟုသုတ ဆောင်းပါးများနှင့် ဗီဒီယို/အသံ အကြောင်းအရာများကို စီမံပါ။"
        action={
          <Button onClick={openCreateModal} variant="jade">
            ＋ အကြောင်းအရာ အသစ်
          </Button>
        }
      />

      {/* Metrics */}
      <div className="metrics">
        <Metric icon="📚" label="စုစုပေါင်း" value={String(total)} detail={`${published} ခု ထုတ်ဝေပြီး`} />
        <Metric icon="✅" label="ထုတ်ဝေပြီး" value={String(published)} detail={`${total - published} ခု Draft`} />
        <Metric icon="🎵" label="အသံ / ဗီဒီယို" value={String(audioVideo)} detail="ဂါထာနှင့် သင်ခန်းစာ" />
        <Metric icon="👑" label="Premium ကန့်သတ်" value={String(premiumCount)} detail={`${total - premiumCount} ခု အခမဲ့`} />
      </div>

      {/* Filter Tabs */}
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

        {/* Search + Day Sign Filter */}
        <div className="toolbar">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ရှာဖွေရန်..."
            aria-label="Search content"
          />
          <select
            value={daySignFilter}
            onChange={(e) => setDaySignFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              fontSize: '12.5px',
            }}
            aria-label="Filter by day sign"
          >
            {DAY_SIGNS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="resource-list">
          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              ရှာဖွေမှုနှင့် ကိုက်ညီသော အကြောင်းအရာ မရှိပါ။
            </div>
          )}
          {filtered.map((item) => (
            <div className="resource-row" key={item.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', marginBottom: '3px' }}>{item.title}</b>
                <small style={{ color: 'var(--text-muted)' }}>
                  {item.daySign !== 'အားလုံး' ? `🎯 ${item.daySign} · ` : ''}
                  {item.body.slice(0, 60)}…
                </small>
              </div>
              <Status tone={TYPE_MAP[item.type].tone}>{TYPE_MAP[item.type].label}</Status>
              <Status tone={item.isPremium ? 'gold' : 'jade'}>{item.isPremium ? '👑 Premium' : '🆓 Free'}</Status>
              <Status tone={item.isPublished ? 'jade' : 'gold'}>
                {item.isPublished ? '✅ Published' : '📝 Draft'}
              </Status>
              <time style={{ flexShrink: 0, fontSize: '12px', color: 'var(--text-muted)', minWidth: '90px' }}>{item.updatedAt}</time>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item)}
                  aria-label={item.isPublished ? 'Unpublish' : 'Publish'}
                  title={item.isPublished ? 'Draft သို့ ပြောင်းမည်' : 'ထုတ်ဝေမည်'}
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
                  {item.isPublished ? '📝' : '✅'}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 id="content-modal-title">
                {editingItem ? `✏️ '${editingItem.title}' ပြင်ဆင်မည်` : '＋ အကြောင်းအရာ အသစ် ထည့်မည်'}
              </h2>
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleSave}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="content-type">အမျိုးအစား</label>
                  <select
                    id="content-type"
                    className="form-input"
                    value={fType}
                    onChange={(e) => setFType(e.target.value as ContentItem['type'])}
                  >
                    <option value="ARTICLE">📝 ဆောင်းပါး</option>
                    <option value="GAHTAR">📿 ဂါထာ</option>
                    <option value="VIDEO">🎬 ဗီဒီယို</option>
                    <option value="AUDIO">🎵 အသံ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="content-daysign">နေ့နံ ပစ်မှတ်</label>
                  <select
                    id="content-daysign"
                    className="form-input"
                    value={fDaySign}
                    onChange={(e) => setFDaySign(e.target.value)}
                  >
                    {DAY_SIGNS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content-body">အကြောင်းအရာ</label>
                <textarea
                  id="content-body"
                  className="form-input"
                  value={fBody}
                  onChange={(e) => setFBody(e.target.value)}
                  placeholder="ဗမာစာဖြင့် အကြောင်းအရာ ရေးပါ..."
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {(fType === 'AUDIO' || fType === 'GAHTAR') && (
                <div className="form-group">
                  <label htmlFor="content-audio">🎵 အသံ URL</label>
                  <input
                    id="content-audio"
                    className="form-input"
                    value={fAudioUrl}
                    onChange={(e) => setFAudioUrl(e.target.value)}
                    placeholder="https://audio.akyannyan.com/..."
                  />
                </div>
              )}

              {fType === 'VIDEO' && (
                <div className="form-group">
                  <label htmlFor="content-video">🎬 ဗီဒီယို URL</label>
                  <input
                    id="content-video"
                    className="form-input"
                    value={fVideoUrl}
                    onChange={(e) => setFVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/..."
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={fIsPremium}
                      onChange={(e) => setFIsPremium(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)' }}
                    />
                    👑 Premium ကန့်သတ်
                  </label>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={fIsPublished}
                      onChange={(e) => setFIsPublished(e.target.checked)}
                      style={{ accentColor: 'var(--jade-primary)' }}
                    />
                    ✅ ချက်ချင်း ထုတ်ဝေမည်
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  မလုပ်တော့ပါ (Cancel)
                </Button>
                <Button type="submit" variant="jade">
                  {editingItem ? '✏️ ပြင်ဆင်မည်' : '＋ ထည့်သွင်းမည်'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
