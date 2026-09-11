import { useState } from 'react';
import { Button, Card, Metric, PageHeader, Status } from '../../components/ui';
import { showToast } from '../../components/Toast';

/* ─── Types ─── */
type SettingsTab = 'astrology' | 'notifications' | 'quotas';

interface SettingEntry {
  icon: string;
  title: string;
  description: string;
  value: string;
  editable: boolean;
  type?: 'text' | 'toggle' | 'number';
}

/* ─── Tab Definitions ─── */
const TABS: { key: SettingsTab; icon: string; label: string }[] = [
  { key: 'astrology', icon: '🔮', label: 'ဗေဒင်ဆိုင်ရာ' },
  { key: 'notifications', icon: '🔔', label: 'သတိပေးချက်' },
  { key: 'quotas', icon: '⚙️', label: 'ကန့်သတ်ချက်' },
];

/* ─── Initial Settings Data ─── */
const ASTROLOGY_SETTINGS: SettingEntry[] = [
  { icon: '🏛️', title: 'မဟာဘုတ် တွက်ချက်မှု', description: 'Traditional Myanmar Mahabote Algorithm', value: 'Enabled', editable: true, type: 'toggle' },
  { icon: '🌟', title: 'KP Sub-Lord Ephemeris', description: 'Krishnamurti Paddhati planetary calculation engine', value: 'Swiss Ephemeris v2.10', editable: false },
  { icon: '🌙', title: 'မြန်မာ လပိုင်းပြက္ခဒိန်', description: 'Lunisolar Myanmar Calendar Engine', value: 'Active ✅', editable: false },
  { icon: '📊', title: 'ရက်ရာဇာ Tables', description: 'ရက်ရာဇာ၊ ပြဿဒါး၊ ရက်ယုတ်မာ deterministic lookup', value: '12 Months Loaded', editable: false },
  { icon: '🕐', title: 'ရာဟု Cutoff Time', description: 'ဗုဒ္ဓဟူးနေ့ ရာဟု/ဗုဒ္ဓဟူး ခွဲခြားသည့် အချိန်', value: '12:00 PM (Noon)', editable: true, type: 'text' },
  { icon: '🎴', title: 'Tarot Card Deck', description: 'RWS (Rider-Waite-Smith) International Deck', value: '78 Cards Loaded', editable: false },
];

const NOTIFICATION_SETTINGS: SettingEntry[] = [
  { icon: '📘', title: 'Facebook Page ID', description: 'Connected Facebook page for Messenger', value: 'akyannyan.astrology', editable: true, type: 'text' },
  { icon: '💬', title: 'Messenger Deep Link', description: 'Direct customer contact link', value: 'm.me/akyannyan.astrology', editable: true, type: 'text' },
  { icon: '🌅', title: 'မနက်ခင်း Push Notification', description: 'Daily fortune reminder push time', value: '7:00 AM (Myanmar Time)', editable: true, type: 'text' },
  { icon: '🌌', title: 'Transit Alert', description: 'Vimshottari Dasha planetary shift notifications', value: 'Enabled', editable: true, type: 'toggle' },
  { icon: '📧', title: 'Support Email', description: 'Customer support contact email', value: 'support@akyannyan.com', editable: true, type: 'text' },
  { icon: '📱', title: 'Support Phone', description: 'Customer support hotline', value: '+95 9 XXX XXX XXX', editable: true, type: 'text' },
];

const QUOTA_SETTINGS: SettingEntry[] = [
  { icon: '✦', title: 'Oracle Daily Quota (Free)', description: 'Free user daily question limit', value: '3', editable: true, type: 'number' },
  { icon: '⏱️', title: 'Request Cooldown', description: 'Seconds between Oracle requests', value: '10', editable: true, type: 'number' },
  { icon: '🪙', title: 'Extra Question Cost', description: 'Points per question after free quota', value: '5', editable: true, type: 'number' },
  { icon: '👑', title: 'Premium Tier 1 Bonus', description: 'Additional questions per day for Tier 1', value: '+5', editable: false },
  { icon: '💎', title: 'Premium Tier 2 Limit', description: 'Premium Tier 2 question limit', value: 'UNLIMITED', editable: false },
  { icon: '🔧', title: 'Maintenance Mode', description: 'Temporarily disable all client connections', value: 'OFF', editable: true, type: 'toggle' },
];

const SETTINGS_MAP: Record<SettingsTab, SettingEntry[]> = {
  astrology: ASTROLOGY_SETTINGS,
  notifications: NOTIFICATION_SETTINGS,
  quotas: QUOTA_SETTINGS,
};

/* ─── Component ─── */
export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('astrology');
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const currentSettings = SETTINGS_MAP[activeTab];

  const handleEdit = (entry: SettingEntry) => {
    setEditingKey(entry.title);
    setEditValues((prev) => ({ ...prev, [entry.title]: entry.value }));
  };

  const handleSave = (entry: SettingEntry) => {
    const newValue = editValues[entry.title] ?? entry.value;

    if (entry.type === 'toggle') {
      const toggled = entry.value === 'Enabled' ? 'Disabled' : entry.value === 'OFF' ? 'ON' : 'Enabled';
      showToast(`'${entry.title}' ကို ${toggled} သို့ ပြောင်းပြီးပါပြီ။`, 'success');
    } else {
      showToast(`'${entry.title}' ကို '${newValue}' သို့ ပြောင်းပြီးပါပြီ။`, 'success');
    }
    setEditingKey(null);
  };

  return (
    <div className="page">
      <PageHeader
        title="ဆက်တင်များ (Settings)"
        description="Akyannyan platform ၏ စနစ်ဆက်တင်များ၊ ဗေဒင်တွက်ချက်မှု ယန္တရားများနှင့် အသိပေးချက် ပြင်ဆင်ခြင်းများကို စီမံပါ။"
        action={
          <Button
            variant="jade"
            onClick={() => showToast('ဆက်တင်အားလုံး အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။', 'success')}
          >
            💾 ပြောင်းလဲမှု သိမ်းမည်
          </Button>
        }
      />

      {/* Summary Metrics */}
      <div className="metrics">
        <Metric icon="✦" label="Oracle Quota" value="3/day" detail="Free users · 5pts extra" />
        <Metric icon="🔔" label="Push Time" value="7:00 AM" detail="Daily fortune reminder" />
        <Metric icon="🔧" label="Maintenance" value="OFF" detail="All systems operational" />
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setEditingKey(null);
            }}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              border: `1.5px solid ${activeTab === tab.key ? 'var(--jade-primary)' : 'var(--border-color)'}`,
              background: activeTab === tab.key ? 'var(--jade-glow)' : 'var(--bg-secondary)',
              color: activeTab === tab.key ? 'var(--jade-primary)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Cards */}
      <div className="setting-list">
        {currentSettings.map((entry) => {
          const isEditing = editingKey === entry.title;
          return (
            <Card key={entry.title} className="admin-setting">
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{entry.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', marginBottom: '2px' }}>{entry.title}</b>
                <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {entry.description}
                </small>
                {isEditing && entry.type !== 'toggle' ? (
                  <input
                    className="form-input"
                    type={entry.type === 'number' ? 'number' : 'text'}
                    value={editValues[entry.title] ?? entry.value}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [entry.title]: e.target.value }))}
                    autoFocus
                    style={{
                      marginTop: '6px',
                      padding: '6px 10px',
                      fontSize: '12.5px',
                      maxWidth: '300px',
                    }}
                  />
                ) : (
                  <Status tone={entry.value.includes('✅') || entry.value === 'Enabled' || entry.value === 'Active ✅' ? 'jade' : entry.value === 'OFF' || entry.value === 'Disabled' ? 'danger' : 'gold'}>
                    {entry.value}
                  </Status>
                )}
              </div>
              {entry.editable && (
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="jade"
                        onClick={() => handleSave(entry)}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        ✅ သိမ်းမည်
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingKey(null)}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        ✕
                      </Button>
                    </>
                  ) : entry.type === 'toggle' ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSave(entry)}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      🔄 Toggle
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(entry)}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      ✏️ ပြင်မည်
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
