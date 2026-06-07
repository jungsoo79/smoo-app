import { deleteJson, getJson, patchJson, postJson } from '@/lib/api-client';

import type { AvailableWidget, HomeWidget, HomeWidgetData, HomeWidgetType } from '../types/homeWidget';

type BackendWidgetType = 'CALENDAR' | 'TODO' | 'MEMO' | 'LEDGER' | 'SCHEDULE';

type DashboardWidgetResponse = {
  displayName: string;
  displayOrder: number;
  enabled: boolean;
  id: number;
  widgetType: BackendWidgetType;
};

type HomeDashboardWidgetResponse = {
  data: HomeWidgetData;
  displayName: string;
  displayOrder: number;
  widgetId: number;
  widgetType: BackendWidgetType;
};

type BackendHomeDashboardResponse = {
  date: string;
  todayText: string;
  userName: string;
  widgets: HomeDashboardWidgetResponse[];
};

type HomeDashboard = {
  date: string;
  todayText: string;
  userName: string;
  widgets: HomeWidget[];
};

type AvailableWidgetResponse = {
  added: boolean;
  displayName: string;
  widgetType: BackendWidgetType;
};

const backendTypeByFrontendType: Record<HomeWidgetType, BackendWidgetType> = {
  accountBook: 'LEDGER',
  calendar: 'CALENDAR',
  memo: 'MEMO',
  todo: 'TODO',
};

const frontendTypeByBackendType: Record<BackendWidgetType, HomeWidgetType> = {
  CALENDAR: 'calendar',
  LEDGER: 'accountBook',
  MEMO: 'memo',
  SCHEDULE: 'calendar',
  TODO: 'todo',
};

const descriptionsByType: Record<HomeWidgetType, string> = {
  accountBook: '월간 자산 현황을 빠르게 확인할 수 있어요.',
  calendar: '다가오는 일정을 확인할 수 있어요.',
  memo: '최근 메모를 빠르게 확인할 수 있어요.',
  todo: '오늘 할 일을 확인할 수 있어요.',
};

function toHomeWidget(response: DashboardWidgetResponse): HomeWidget {
  const type = frontendTypeByBackendType[response.widgetType];

  return {
    id: response.id,
    isVisible: response.enabled,
    order: response.displayOrder,
    title: response.displayName,
    type,
  };
}

function toHomeDashboardWidget(response: HomeDashboardWidgetResponse): HomeWidget {
  const type = frontendTypeByBackendType[response.widgetType];

  return {
    data: response.data,
    id: response.widgetId,
    isVisible: true,
    order: response.displayOrder,
    title: response.displayName,
    type,
  };
}

function toAvailableWidget(response: AvailableWidgetResponse): AvailableWidget {
  const type = frontendTypeByBackendType[response.widgetType];

  return {
    description: descriptionsByType[type],
    isAdded: response.added,
    name: response.displayName,
    type,
  };
}

export async function getHomeWidgets(): Promise<HomeWidget[]> {
  return (await getJson<DashboardWidgetResponse[]>('/api/home/widgets')).map(toHomeWidget);
}

export async function getHomeDashboard(date: string): Promise<HomeDashboard> {
  const dashboard = await getJson<BackendHomeDashboardResponse>(`/api/home/dashboard?date=${encodeURIComponent(date)}`);

  return {
    ...dashboard,
    widgets: dashboard.widgets.map(toHomeDashboardWidget),
  };
}

export async function getAvailableWidgets(): Promise<AvailableWidget[]> {
  return (await getJson<AvailableWidgetResponse[]>('/api/home/widgets/available'))
    .filter((widget) => widget.widgetType !== 'SCHEDULE')
    .map(toAvailableWidget);
}

export async function addHomeWidget(type: HomeWidgetType): Promise<HomeWidget> {
  const widget = await postJson<DashboardWidgetResponse>('/api/home/widgets', {
    widgetType: backendTypeByFrontendType[type],
  });

  return toHomeWidget(widget);
}

export async function removeHomeWidget(widgetId: number): Promise<void> {
  await deleteJson<void>(`/api/home/widgets/${widgetId}`);
}

export async function updateHomeWidgetOrder(widgets: HomeWidget[]): Promise<HomeWidget[]> {
  const response = await patchJson<DashboardWidgetResponse[]>('/api/home/widgets/reorder', {
    orders: widgets.map((widget, index) => ({
      displayOrder: index + 1,
      widgetId: widget.id,
    })),
  });

  return response.map(toHomeWidget);
}
