export type HomeWidgetType = 'calendar' | 'todo' | 'memo' | 'accountBook';

export type HomeWidgetData = Record<string, unknown>;

export type HomeWidget = {
  id: number;
  type: HomeWidgetType;
  title: string;
  order: number;
  isVisible: boolean;
  data?: HomeWidgetData;
};

export type AvailableWidget = {
  type: HomeWidgetType;
  name: string;
  description: string;
  isAdded: boolean;
};
