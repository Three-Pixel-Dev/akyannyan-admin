import { useEffect, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { notificationsService } from './services/notifications.service';
import type {
  CampaignAudience,
  CampaignScheduleMode,
  NotificationCampaign,
} from './types/notifications.types';

const TITLE_MAX = 50;
const BODY_MAX = 150;

function formatDate(iso?: string | null) {
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
    return iso.slice(0, 16);
  }
}

function statusTone(status: string): 'jade' | 'gold' | 'danger' {
  if (status === 'sent') return 'jade';
  if (status === 'scheduled') return 'gold';
  return 'danger';
}

function statusLabel(status: string) {
  if (status === 'sent') return 'ပို့ပြီး';
  if (status === 'scheduled') return 'စီစဉ်ထား';
  return 'ပယ်ဖျက်';
}

function audienceLabel(a: string) {
  return a === 'INACTIVE' ? '၇ ရက် မလှုပ်ရှား' : 'အားလုံး (token ရှိ)';
}

function toLocalParts(iso?: string | null) {
  if (!iso) return { date: '', time: '19:00' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '19:00' };
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function fromLocalDateTime(date: string, time: string): string | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function NotificationsView() {
  const [items, setItems] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<CampaignAudience>('ALL');
  const [scheduleMode, setScheduleMode] = useState<CampaignScheduleMode>('NOW');
  const [laterDate, setLaterDate] = useState('');
  const [laterTime, setLaterTime] = useState('19:00');

  const sent = items.filter((i) => i.status === 'sent').length;
  const scheduled = items.filter((i) => i.status === 'scheduled').length;
  const totalSentCount = items.reduce((sum, i) => sum + (i.sentCount || 0), 0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await notificationsService.list(0, 50);
      setItems(data.content || []);
    } catch (err: any) {
      showToast(err?.message || 'အသိပေးချက်များ ရယူ၍ မရပါ', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setTitle('');
    setBody('');
    setAudience('ALL');
    setScheduleMode('NOW');
    const parts = toLocalParts(new Date(Date.now() + 3600000).toISOString());
    setLaterDate(parts.date);
    setLaterTime(parts.time);
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) {
      showToast('ခေါင်းစဉ်နှင့် စာသား လိုအပ်ပါသည်', 'error');
      return;
    }
    if (scheduleMode === 'LATER' && !fromLocalDateTime(laterDate, laterTime)) {
      showToast('နောက်မှ ပို့မည့် ရက်နှင့် အချိန် ရွေးပါ', 'error');
      return;
    }
    setSaving(true);
    try {
      const created = await notificationsService.create({
        title: title.trim(),
        body: body.trim(),
        audienceType: audience,
        scheduleMode,
        scheduledAt: scheduleMode === 'LATER' ? fromLocalDateTime(laterDate, laterTime) : null,
        deepLink: '/(tabs)/index',
      });
      showToast(
        created.status === 'sent' ? 'အသိပေးချက် ပို့ပြီးပါပြီ' : 'အသိပေးချက် စီစဉ်ပြီးပါပြီ',
        'success',
      );
      setModalOpen(false);
      await fetchItems();
    } catch (err: any) {
      showToast(err?.message || 'ပို့၍ မရပါ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await notificationsService.cancel(id);
      showToast('စီစဉ်ထားမှု ပယ်ဖျက်ပြီး', 'success');
      await fetchItems();
    } catch (err: any) {
      showToast(err?.message || 'ပယ်ဖျက်၍ မရပါ', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="အသိပေးချက်များ"
        description="အသုံးပြုသူများထံ push + inbox အသိပေးချက် ပို့ရန် / စီစဉ်ရန်"
        action={
          <Button variant="jade" onClick={openCreate}>
            ＋ အသစ်ပို့မည်
          </Button>
        }
      />

      <div className="metrics">
        <Metric icon="🔔" label="စုစုပေါင်း" value={String(items.length)} detail="campaigns" />
        <Metric icon="✓" label="ပို့ပြီး" value={String(sent)} detail="sent" />
        <Metric icon="⏱" label="စီစဉ်ထား" value={String(scheduled)} detail="scheduled" />
        <Metric icon="📬" label="Inbox အရေအတွက်" value={String(totalSentCount)} detail="fan-out rows" />
      </div>

      <Card className="wide-card table-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">CAMPAIGNS</p>
            <h2>ပို့ထားသော / စီစဉ်ထားသော အသိပေးချက်များ</h2>
          </div>
          <Button variant="ghost" onClick={fetchItems} disabled={loading}>
            ပြန်စစ်မည်
          </Button>
        </div>

        {loading ? (
          <p style={{ padding: '1.5rem', opacity: 0.7 }}>ဖွင့်နေသည်…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: '1.5rem', opacity: 0.7 }}>အသိပေးချက် မရှိသေးပါ။</p>
        ) : (
          <div className="table">
            {items.map((item) => (
              <div className="table-row" key={item.id} style={{ alignItems: 'flex-start', gap: 12 }}>
                <span className="person-avatar">🔔</span>
                <div className="user-detail" style={{ flex: 1 }}>
                  <b>{item.title}</b>
                  <small>{item.body}</small>
                  <small style={{ display: 'block', marginTop: 4 }}>
                    {audienceLabel(item.audienceType)} · {item.scheduleMode}
                    {item.scheduleMode === 'LATER' ? ` · ${formatDate(item.scheduledAt)}` : ''}
                    {' · '}ပို့ပြီး {item.sentCount} ဦး · {formatDate(item.createdAt)}
                  </small>
                </div>
                <Status tone={statusTone(item.status)}>{statusLabel(item.status)}</Status>
                {item.status === 'scheduled' && (
                  <Button
                    variant="ghost"
                    disabled={cancellingId === item.id}
                    onClick={() => handleCancel(item.id)}
                  >
                    ပယ်ဖျက်
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 80,
            padding: 16,
          }}
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: 'min(520px, 100%)', maxHeight: '90vh', overflow: 'auto', padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">NEW CAMPAIGN</p>
            <h2 style={{ marginTop: 4, marginBottom: 16 }}>အသိပေးချက် ရေးသားရန်</h2>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>ခေါင်းစဉ် ({title.length}/{TITLE_MAX})</span>
              <input
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ဥပမာ — ဒီည ဂါထာ မမေ့နဲ့"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>စာသား ({body.length}/{BODY_MAX})</span>
              <textarea
                value={body}
                maxLength={BODY_MAX}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="တိုတောင်းပြီး ရှင်းလင်းစွာ ရေးပါ"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', resize: 'vertical' }}
              />
            </label>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>ပစ်မှတ်</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {(
                  [
                    ['ALL', 'အားလုံး'],
                    ['INACTIVE', '၇ ရက် မလှုပ်ရှား'],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={audience === key ? 'jade' : 'ghost'}
                    onClick={() => setAudience(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>အချိန်</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {(
                  [
                    ['NOW', 'ယခုပို့'],
                    ['LATER', 'နောက်မှ'],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={scheduleMode === key ? 'gold' : 'ghost'}
                    onClick={() => setScheduleMode(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {scheduleMode === 'LATER' && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, opacity: 0.75 }}>ရက်</span>
                  <input
                    type="date"
                    value={laterDate}
                    onChange={(e) => setLaterDate(e.target.value)}
                    style={{ width: '100%', marginTop: 6, padding: '10px 12px' }}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, opacity: 0.75 }}>အချိန်</span>
                  <input
                    type="time"
                    value={laterTime}
                    onChange={(e) => setLaterTime(e.target.value)}
                    style={{ width: '100%', marginTop: 6, padding: '10px 12px' }}
                  />
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" disabled={saving} onClick={() => setModalOpen(false)}>
                ပယ်ဖျက်
              </Button>
              <Button variant="jade" disabled={saving} onClick={handleCreate}>
                {saving ? 'လုပ်ဆောင်နေ…' : scheduleMode === 'NOW' ? 'ယခုပို့မည်' : 'စီစဉ်မည်'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
