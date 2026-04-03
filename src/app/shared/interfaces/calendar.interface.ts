export interface CalendarBlock {
  id: string;
  clientId: string;
  startMs: number;
  endMs: number;
}

export interface WeekDay {
  date: Date;
  isoKey: string;
  dayNum: number;
  weekdayShort: string;
  isToday: boolean;
}
