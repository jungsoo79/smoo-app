import { deleteJson, getJson, patchJson, postJson } from '@/lib/api-client';

import type {
  CalendarCategory,
  CalendarEvent,
  CalendarEventPayload,
  CalendarEventsByDate,
  CalendarTime,
} from './types';

type ScheduleResponse = {
  categoryColor: string | null;
  categoryName: string | null;
  createdAt: string;
  description: string | null;
  endAt: string | null;
  id: number;
  isAllDay: boolean | null;
  location: string | null;
  startAt: string;
  title: string;
  updatedAt: string;
};

const defaultCalendarCategory: CalendarCategory = {
  color: '#E7E8E9',
  id: 1,
  isDefault: true,
  name: '일정',
};

function toDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function toCalendarTime(date: Date): CalendarTime {
  const hour = date.getHours();

  return {
    hour: hour % 12 || 12,
    meridiem: hour >= 12 ? 'PM' : 'AM',
    minute: date.getMinutes(),
  };
}

function toDateTime(date: string, time: CalendarTime, isAllDay: boolean) {
  const hourBase = time.hour % 12;
  const hour = isAllDay ? 0 : hourBase + (time.meridiem === 'PM' ? 12 : 0);

  return new Date(`${date}T${String(hour).padStart(2, '0')}:${String(isAllDay ? 0 : time.minute).padStart(2, '0')}:00`).toISOString();
}

function createEventsByDate(sourceEvents: CalendarEvent[]): CalendarEventsByDate {
  return sourceEvents.reduce<CalendarEventsByDate>((eventsByDate, event) => {
    let currentDate = event.date;

    while (currentDate <= event.endDate) {
      eventsByDate[currentDate] = [...(eventsByDate[currentDate] ?? []), event];

      const nextDate = new Date(`${currentDate}T00:00:00`);
      nextDate.setDate(nextDate.getDate() + 1);
      currentDate = toDateString(nextDate);
    }

    return eventsByDate;
  }, {});
}

function toCalendarEvent(response: ScheduleResponse): CalendarEvent {
  const startAt = new Date(response.startAt);
  const endAt = response.endAt ? new Date(response.endAt) : startAt;

  return {
    category: response.categoryName ?? response.location ?? defaultCalendarCategory.name,
    categoryColor: response.categoryColor ?? defaultCalendarCategory.color,
    date: toDateString(startAt),
    detail: response.description ?? '',
    endDate: toDateString(endAt),
    endTime: toCalendarTime(endAt),
    id: String(response.id),
    isAllDay: response.isAllDay ?? false,
    startTime: toCalendarTime(startAt),
    title: response.title,
  };
}

function toScheduleRequest(payload: CalendarEventPayload) {
  return {
    description: payload.detail,
    endAt: toDateTime(payload.endDate, payload.endTime, payload.isAllDay),
    categoryColor: payload.categoryColor ?? defaultCalendarCategory.color,
    categoryName: payload.category,
    isAllDay: payload.isAllDay,
    location: null,
    startAt: toDateTime(payload.date, payload.startTime, payload.isAllDay),
    title: payload.title,
  };
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return (await getJson<ScheduleResponse[]>('/api/v1/schedules')).map(toCalendarEvent);
}

export async function getCalendarEventsByDateMap(): Promise<CalendarEventsByDate> {
  return createEventsByDate(await getCalendarEvents());
}

export async function getCalendarEventsByDate(date: string): Promise<CalendarEvent[]> {
  return (await getCalendarEventsByDateMap())[date] ?? [];
}

export async function createCalendarEvent(payload: CalendarEventPayload): Promise<CalendarEvent> {
  const event = await postJson<ScheduleResponse>('/api/v1/schedules', toScheduleRequest(payload));

  return toCalendarEvent(event);
}

export async function updateCalendarEvent(eventId: string, payload: CalendarEventPayload): Promise<CalendarEvent> {
  const event = await patchJson<ScheduleResponse>(`/api/v1/schedules/${eventId}`, toScheduleRequest(payload));

  return toCalendarEvent(event);
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await deleteJson<void>(`/api/v1/schedules/${eventId}`);
}

export async function getCalendarCategories(): Promise<CalendarCategory[]> {
  return [defaultCalendarCategory];
}

export async function createCalendarCategory(payload: Omit<CalendarCategory, 'id' | 'isDefault'>): Promise<CalendarCategory> {
  return {
    ...payload,
    id: Date.now(),
    isDefault: false,
  };
}
