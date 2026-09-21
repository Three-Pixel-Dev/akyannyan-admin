export type MeritCreditKind = 'HONOR' | 'RITUAL' | 'JOURNAL' | 'TAROT';

export interface MeritDeedDef {
  id?: number | null;
  label: string;
  glyph: string;
  points: number;
  creditKind: MeritCreditKind;
  sortOrder: number;
  done?: boolean;
  source?: string;
}

export interface MeritWeekProgram {
  id?: number | null;
  weekIndex: number;
  monday: string;
  deeds: MeritDeedDef[];
}

export interface MeritMonthProgram {
  id?: number | null;
  year: number;
  month: number;
  published: boolean;
  mondayCount: number;
  weeks: MeritWeekProgram[];
}
