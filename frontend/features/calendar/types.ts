export type CalendarMeridiem = 'AM' | 'PM';

export interface CalendarTime {
  hour: number;
  meridiem: CalendarMeridiem;
  minute: number;
}

export interface CalendarCategory {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface CalendarEvent {
  id: string;
  category: string;
  categoryColor?: string;
  date: string;
  detail: string;
  endDate: string;
  endTime: CalendarTime;
  isAllDay: boolean;
  startTime: CalendarTime;
  title: string;
}

export interface CalendarEventOccurrence extends CalendarEvent {
  displayIsAllDay: boolean;
  displayTime: CalendarTime;
}

export type CalendarEventsByDate = Record<string, CalendarEvent[]>;

export type CalendarEventPayload = Omit<CalendarEvent, 'id'>;
