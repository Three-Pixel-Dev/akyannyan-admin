export type CampaignAudience = 'ALL' | 'INACTIVE';
export type CampaignScheduleMode = 'NOW' | 'LATER';
export type CampaignStatus = 'scheduled' | 'sent' | 'cancelled';

export interface NotificationCampaign {
  id: number;
  title: string;
  body: string;
  audienceType: CampaignAudience;
  scheduleMode: CampaignScheduleMode;
  scheduledAt: string | null;
  status: CampaignStatus;
  sentCount: number;
  deepLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  title: string;
  body: string;
  audienceType: CampaignAudience;
  scheduleMode: CampaignScheduleMode;
  scheduledAt?: string | null;
  deepLink?: string | null;
}
