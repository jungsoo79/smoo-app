import { getWidgetTitle, homeWidgetCatalog, initialHomeWidgets } from '../mocks/homeWidgetMock';
import type { AvailableWidget, HomeWidget, HomeWidgetType } from '../types/homeWidget';

let nextWidgetId = 1;
let homeWidgets: HomeWidget[] = [...initialHomeWidgets];
const storageKey = 'smoo.homeWidgets';

function getStorage() {
  return (globalThis as { localStorage?: Storage }).localStorage;
}

function loadWidgetsFromStorage() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const savedValue = storage.getItem(storageKey);

  if (!savedValue) {
    return;
  }

  try {
    const parsedWidgets = JSON.parse(savedValue) as HomeWidget[];

    homeWidgets = parsedWidgets;
    nextWidgetId = parsedWidgets.reduce((maxId, widget) => Math.max(maxId, widget.id), 0) + 1;
  } catch {
    storage.removeItem(storageKey);
  }
}

function persistWidgets() {
  getStorage()?.setItem(storageKey, JSON.stringify(homeWidgets));
}

loadWidgetsFromStorage();

function sortWidgets(widgets: HomeWidget[]) {
  return [...widgets].filter((widget) => widget.isVisible).sort((first, second) => first.order - second.order);
}

function getNextOrder() {
  return homeWidgets.reduce((maxOrder, widget) => Math.max(maxOrder, widget.order), 0) + 1;
}

export async function getHomeWidgets(): Promise<HomeWidget[]> {
  return sortWidgets(homeWidgets);
}

export async function getAvailableWidgets(): Promise<AvailableWidget[]> {
  const addedTypes = new Set(homeWidgets.filter((widget) => widget.isVisible).map((widget) => widget.type));

  return homeWidgetCatalog.map((widget) => ({
    ...widget,
    isAdded: addedTypes.has(widget.type),
  }));
}

export async function addHomeWidget(type: HomeWidgetType): Promise<HomeWidget> {
  const existingWidget = homeWidgets.find((widget) => widget.type === type && widget.isVisible);

  if (existingWidget) {
    return existingWidget;
  }

  const nextWidget = {
    id: nextWidgetId,
    type,
    title: getWidgetTitle(type),
    order: getNextOrder(),
    isVisible: true,
  };

  nextWidgetId += 1;
  homeWidgets = [...homeWidgets, nextWidget];
  persistWidgets();

  return nextWidget;
}

export async function removeHomeWidget(widgetId: number): Promise<void> {
  homeWidgets = homeWidgets
    .filter((widget) => widget.id !== widgetId)
    .map((widget, index) => ({
      ...widget,
      order: index + 1,
    }));
  persistWidgets();
}

export async function updateHomeWidgetOrder(widgets: HomeWidget[]): Promise<HomeWidget[]> {
  homeWidgets = widgets.map((widget, index) => ({
    ...widget,
    order: index + 1,
  }));
  persistWidgets();

  return sortWidgets(homeWidgets);
}
