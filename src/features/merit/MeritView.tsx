import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { adminMeritService } from './services/merit.service';
import type { MeritCreditKind, MeritDeedDef, MeritMonthProgram, MeritWeekProgram } from './types/merit.types';

const WEEK_LABELS = ['ပထမပတ်', 'ဒုတိယပတ်', 'တတိယပတ်', 'စတုတ္ထပတ်', 'ပဉ္စမပတ်'];
const MONTHS = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'ဩဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];
const GLYPH_CHOICES = ['🤲', '🙏', '💬', '📖', '🏺', '🕊️', '✨'];
type ActivityKind = Exclude<MeritCreditKind, 'HONOR'>;
const ACTIVITY_KINDS: { id: ActivityKind; label: string; glyph: string; hint: string }[] = [
  { id: 'RITUAL', label: 'နံနက်ခင်း ဂါထာ', glyph: '📿', hint: 'CMS နံနက်ခင်း ဂါထာ — နေ့စဉ် ပြောင်းပြီး ရွတ်မှ အမှတ်' },
  { id: 'TAROT', label: 'နေ့စဉ် Tarot', glyph: '✦', hint: 'ကတ်ဖွင့် လုပ်ဆောင်ချက် — အမည် ရိုက်ရန် မလို' },
  { id: 'JOURNAL', label: 'နေ့စဉ်မှတ်တမ်း', glyph: '📓', hint: 'မှတ်တမ်း သိမ်းမှ အမှတ် — အမည် ရိုက်ရန် မလို' },
];

function weekRangeLabel(monday: string) {
  const start = new Date(`${monday}T00:00:00`);
  if (Number.isNaN(start.getTime())) return monday;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function yangonNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Yangon',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  return { year, month };
}

function previousMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function emptyDeed(sortOrder: number): MeritDeedDef {
  return {
    label: '',
    glyph: '🏺',
    points: 1,
    creditKind: 'HONOR',
    sortOrder,
  };
}

function activityDeed(kind: ActivityKind, sortOrder: number, points = 1): MeritDeedDef {
  const meta = ACTIVITY_KINDS.find((row) => row.id === kind)!;
  return {
    label: meta.label,
    glyph: meta.glyph,
    points,
    creditKind: kind,
    sortOrder,
  };
}

export function MeritView() {
  const now = useMemo(() => yangonNow(), []);
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);
  const [program, setProgram] = useState<MeritMonthProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async (nextYear = year, nextMonth = month) => {
    setLoading(true);
    try {
      const data = await adminMeritService.getMonth(nextYear, nextMonth);
      setProgram(data);
    } catch (err: any) {
      showToast(err?.message || 'ကံစုဘူး လအစီအစဉ် ရယူ၍ မရပါ', 'error');
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(year, month);
  }, [year, month]);

  const deedCount = program?.weeks.reduce((sum, week) => sum + (week.deeds?.length || 0), 0) ?? 0;

  const updateWeek = (weekIndex: number, updater: (week: MeritWeekProgram) => MeritWeekProgram) => {
    setProgram((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((week) => (week.weekIndex === weekIndex ? updater(week) : week)),
      };
    });
  };

  const addDeed = (weekIndex: number) => {
    updateWeek(weekIndex, (week) => ({
      ...week,
      deeds: [...week.deeds, emptyDeed(week.deeds.length)],
    }));
  };

  const toggleActivity = (weekIndex: number, kind: ActivityKind) => {
    updateWeek(weekIndex, (week) => {
      const existing = week.deeds.find((deed) => deed.creditKind === kind);
      if (existing) {
        return {
          ...week,
          deeds: week.deeds
            .filter((deed) => deed.creditKind !== kind)
            .map((deed, i) => ({ ...deed, sortOrder: i })),
        };
      }
      return {
        ...week,
        deeds: [...week.deeds, activityDeed(kind, week.deeds.length)],
      };
    });
  };

  const patchActivityPoints = (weekIndex: number, kind: ActivityKind, points: number) => {
    updateWeek(weekIndex, (week) => ({
      ...week,
      deeds: week.deeds.map((deed) =>
        deed.creditKind === kind ? { ...deed, points: Math.max(1, points || 1) } : deed,
      ),
    }));
  };

  const removeHonor = (weekIndex: number, honorIndex: number) => {
    updateWeek(weekIndex, (week) => {
      const honors = week.deeds.filter((deed) => deed.creditKind === 'HONOR');
      const drop = honors[honorIndex];
      if (!drop) return week;
      return {
        ...week,
        deeds: week.deeds
          .filter((deed) => deed !== drop)
          .map((deed, i) => ({ ...deed, sortOrder: i })),
      };
    });
  };

  const patchHonor = (weekIndex: number, honorIndex: number, patch: Partial<MeritDeedDef>) => {
    updateWeek(weekIndex, (week) => {
      const honors = week.deeds.filter((deed) => deed.creditKind === 'HONOR');
      const target = honors[honorIndex];
      if (!target) return week;
      return {
        ...week,
        deeds: week.deeds.map((deed) => (deed === target ? { ...deed, ...patch, creditKind: 'HONOR' } : deed)),
      };
    });
  };

  const persist = async (published?: boolean, silent = false) => {
    if (!program) return null;
    setSaving(true);
    try {
      const body: MeritMonthProgram = {
        ...program,
        published: published ?? program.published,
        weeks: program.weeks.map((week) => ({
          ...week,
          deeds: week.deeds
            .filter((deed) => deed.creditKind !== 'HONOR' || Boolean(deed.label?.trim()))
            .map((deed, i) => {
              const activity = ACTIVITY_KINDS.find((row) => row.id === deed.creditKind);
              return {
                ...deed,
                label: activity ? activity.label : deed.label.trim(),
                glyph: activity ? activity.glyph : deed.glyph,
                points: Math.max(1, Number(deed.points) || 1),
                sortOrder: i,
              };
            }),
        })),
      };
      const saved = await adminMeritService.saveMonth(year, month, body);
      setProgram(saved);
      if (!silent) {
        showToast(published ? 'ထုတ်ဝေပြီးပါပြီ' : 'မူကြမ်း သိမ်းပြီးပါပြီ', 'success');
      }
      return saved;
    } catch (err: any) {
      showToast(err?.message || 'သိမ်း၍ မရပါ', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (published: boolean) => {
    if (!program) return;
    const savedDraft = await persist(published, true);
    if (!savedDraft) return;
    setSaving(true);
    try {
      const saved = await adminMeritService.publish(year, month, published);
      setProgram(saved);
      showToast(published ? 'ထုတ်ဝေပြီးပါပြီ' : 'မူကြမ်းအဖြစ် ပြန်သိမ်းပါပြီ', 'success');
    } catch (err: any) {
      showToast(err?.message || 'ထုတ်ဝေ၍ မရပါ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLast = async () => {
    const from = previousMonth(year, month);
    setSaving(true);
    try {
      const copied = await adminMeritService.copyFrom(year, month, from.year, from.month);
      setProgram(copied);
      showToast(`${from.year}/${from.month} မှ ကူးယူပြီးပါပြီ`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'ကူးယူ၍ မရပါ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="ကံစုဘူး"
        description="အပတ်တိုင်း ဂါထာ / Tarot / မှတ်တမ်း ကို ဖွင့်ပိတ်ပါ။ ဂါထာသည် CMS နံနက်ခင်း ဂါထာနှင့် ချိတ်ပြီး နေ့စဉ် ပြောင်းသည်။ Tarot နှင့် မှတ်တမ်းသည် လုပ်ဆောင်ချက်သာ — စာသား မလိုပါ။"
        action={
          <div className="header-action-group merit-header-actions">
            <Button variant="ghost" onClick={handleCopyLast} disabled={saving || loading}>
              ယခင်လမှ ကူးယူ
            </Button>
            <Button variant="ghost" onClick={() => persist(false)} disabled={saving || loading || !program}>
              မူကြမ်း သိမ်းမည်
            </Button>
            <Button variant="jade" onClick={() => handlePublish(true)} disabled={saving || loading || !program}>
              ထုတ်ဝေမည်
            </Button>
          </div>
        }
      />

      <div className="metrics merit-metrics">
        <Metric
          icon="📅"
          label="ရွေးထားသော လ"
          value={`${year} / ${String(month).padStart(2, '0')}`}
          detail={program?.published ? 'ထုတ်ဝေပြီး' : 'မူကြမ်း'}
        />
        <Metric
          icon="🗓"
          label="တနင်္လာ အပတ်"
          value={String(program?.mondayCount ?? '—')}
          detail="ဤလ၏ တနင်္လာ ရေတွက်"
        />
        <Metric
          icon="🏺"
          label="ကုသိုလ် အရေအတွက်"
          value={String(deedCount)}
          detail="ရွေးထားသော လ တစ်ခုလုံး"
        />
      </div>

      <Card className="merit-toolbar-card">
        <div className="merit-toolbar">
          <label className="form-group merit-toolbar-field">
            <span>ခုနှစ်</span>
            <select
              className="form-input"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 6 }, (_, i) => now.year - 1 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="form-group merit-toolbar-field merit-toolbar-month">
            <span>လ</span>
            <select
              className="form-input"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((label, i) => (
                <option key={label} value={i + 1}>{i + 1} · {label}</option>
              ))}
            </select>
          </label>
          <div className="merit-toolbar-status">
            {program && (
              <Status tone={program.published ? 'jade' : 'gold'}>
                {program.published ? 'ထုတ်ဝေပြီး' : 'မူကြမ်း'}
              </Status>
            )}
            {program?.published ? (
              <Button variant="ghost" onClick={() => handlePublish(false)} disabled={saving}>
                မူကြမ်း ပြန်သိမ်း
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="merit-week-col"><p className="form-hint">ဖတ်နေပါသည်...</p></Card>
      ) : !program ? (
        <Card className="merit-week-col"><p className="form-hint">လအစီအစဉ် မရှိပါ</p></Card>
      ) : (
        <div className={`merit-weeks merit-weeks-${program.weeks.length}`}>
          {program.weeks.map((week) => (
            <Card key={week.weekIndex} className="merit-week-col">
              <div className="merit-week-head">
                <div className="merit-week-title">
                  <p className="eyebrow">WEEK {week.weekIndex}</p>
                  <h2>{WEEK_LABELS[week.weekIndex - 1] || `အပတ် ${week.weekIndex}`}</h2>
                  <small>{weekRangeLabel(week.monday)} · တနင်္လာ–တနင်္ဂနွေ</small>
                </div>
              </div>
              <p className="merit-section-label">လုပ်ဆောင်ချက်များ</p>
              <div className="merit-activity-list">
                {ACTIVITY_KINDS.map((activity) => {
                  const enabled = week.deeds.find((deed) => deed.creditKind === activity.id);
                  return (
                    <div
                      key={activity.id}
                      className={`merit-activity-row${enabled ? ' on' : ''}`}
                    >
                      <button
                        type="button"
                        className={`merit-toggle${enabled ? ' on' : ''}`}
                        onClick={() => toggleActivity(week.weekIndex, activity.id)}
                      >
                        {enabled ? 'ပါ' : 'မပါ'}
                      </button>
                      <div className="merit-activity-copy">
                        <strong>{activity.glyph} {activity.label}</strong>
                        <span className="merit-activity-hint">{activity.hint}</span>
                      </div>
                      {enabled ? (
                        <label className="merit-points-field">
                          <span>pts</span>
                          <input
                            className="form-input"
                            type="number"
                            min={1}
                            value={enabled.points}
                            onChange={(e) =>
                              patchActivityPoints(week.weekIndex, activity.id, Number(e.target.value))
                            }
                          />
                        </label>
                      ) : (
                        <span className="merit-activity-off">အမှတ် မပေး</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="merit-section-label">ကိုယ်တိုင် မှတ်သည့် အလေ့အကျင့်</p>
              {week.deeds.filter((deed) => deed.creditKind === 'HONOR').length === 0 ? (
                <div className="merit-empty">
                  {week.weekIndex === 5 && week.deeds.length === 0
                    ? 'ဗလာထားလျှင် စတုတ္ထပတ်ကို ကူးသုံးမည်'
                    : 'အမည် ရိုက်၍ မှတ်သည့် အလေ့အကျင့် ထည့်ပါ'}
                </div>
              ) : null}
              {week.deeds
                .filter((deed) => deed.creditKind === 'HONOR')
                .map((deed, honorIndex) => (
                  <div key={`${week.weekIndex}-honor-${honorIndex}-${deed.id ?? 'new'}`} className="merit-deed-row">
                    <div className="merit-glyph-row" role="group" aria-label="glyph">
                      {GLYPH_CHOICES.map((glyph) => (
                        <button
                          key={glyph}
                          type="button"
                          className={`merit-glyph-chip${deed.glyph === glyph ? ' active' : ''}`}
                          onClick={() => patchHonor(week.weekIndex, honorIndex, { glyph })}
                        >
                          {glyph}
                        </button>
                      ))}
                    </div>
                    <input
                      className="form-input"
                      value={deed.label}
                      placeholder="အလေ့အကျင့် အမည်"
                      onChange={(e) => patchHonor(week.weekIndex, honorIndex, { label: e.target.value })}
                    />
                    <div className="merit-deed-meta">
                      <label className="merit-points-field">
                        <span>pts</span>
                        <input
                          className="form-input"
                          type="number"
                          min={1}
                          value={deed.points}
                          onChange={(e) =>
                            patchHonor(week.weekIndex, honorIndex, { points: Number(e.target.value) })
                          }
                        />
                      </label>
                      <Button variant="ghost" onClick={() => removeHonor(week.weekIndex, honorIndex)}>
                        ဖျက်
                      </Button>
                    </div>
                  </div>
                ))}
              <Button variant="ghost" onClick={() => addDeed(week.weekIndex)}>
                + အလေ့အကျင့်
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
