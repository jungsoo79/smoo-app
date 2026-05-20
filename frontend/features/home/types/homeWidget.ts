export type HomeWidgetType = 'calendar' | 'todo' | 'memo' | 'accountBook';

export type HomeWidget = {
  id: number;
  type: HomeWidgetType;
  title: string;
  order: number;
  isVisible: boolean;
};

export type AvailableWidget = {
  type: HomeWidgetType;
  name: string;
  description: string;
  isAdded: boolean;
};
