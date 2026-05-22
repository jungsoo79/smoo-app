import { calendarCategories, calendarEvents } from './mock';
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarEventPayload,
  CalendarEventsByDate,
  CalendarTime,
} from './types';

let categories = [...calendarCategories];
let events = [...calendarEvents];

function addDays(dateString: string, count: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + count);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getDatesBetween(startDate: string, endDate: string) {
  const dates: string[] = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

function getTimeOrder(time: CalendarTime) {
  const hour = time.hour % 12;
  const meridiemOffset = time.meridiem === 'PM' ? 12 : 0;

  return (hour + meridiemOffset) * 60 + time.minute;
}

function sortEvents(first: CalendarEvent, second: CalendarEvent) {
  if (first.isAllDay !== second.isAllDay) {
    return first.isAllDay ? -1 : 1;
  }

  return getTimeOrder(first.startTime) - getTimeOrder(second.startTime);
}

function createEventsByDate(sourceEvents: CalendarEvent[]): CalendarEventsByDate {
  return sourceEvents.reduce<CalendarEventsByDate>((eventsByDate, event) => {
    getDatesBetween(event.date, event.endDate).forEach((date) => {
      eventsByDate[date] = [...(eventsByDate[date] ?? []), event].sort(sortEvents);
    });

    return eventsByDate;
  }, {});
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return [...events].sort((first, second) => {
    if (first.date !== second.date) {
      return first.date.localeCompare(second.date);
    }

    return sortEvents(first, second);
  });
}

export async function getCalendarEventsByDateMap(): Promise<CalendarEventsByDate> {
  return createEventsByDate(events);
}

export async function getCalendarEventsByDate(date: string): Promise<CalendarEvent[]> {
  return (await getCalendarEventsByDateMap())[date] ?? [];
}

export async function createCalendarEvent(payload: CalendarEventPayload): Promise<CalendarEvent> {
  const event: CalendarEvent = {
    ...payload,
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  events = [...events, event];

  return event;
}

export async function updateCalendarEvent(eventId: string, payload: CalendarEventPayload): Promise<CalendarEvent> {
  const event: CalendarEvent = {
    ...payload,
    id: eventId,
  };

  events = events.map((item) => (item.id === eventId ? event : item));

  return event;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  events = events.filter((event) => event.id !== eventId);
}

export async function getCalendarCategories(): Promise<CalendarCategory[]> {
  return [...categories];
}

export async function createCalendarCategory(payload: Omit<CalendarCategory, 'id' | 'isDefault'>): Promise<CalendarCategory> {
  const category: CalendarCategory = {
    ...payload,
    id: Math.max(0, ...categories.map((item) => item.id)) + 1,
    isDefault: false,
  };

  categories = [...categories, category];

  return category;
}
