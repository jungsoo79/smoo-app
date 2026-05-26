import type {
  AvailableWidget,
  HomeWidget,
  HomeWidgetType,
} from "../types/homeWidget";

export const homeWidgetCatalog: Omit<AvailableWidget, "isAdded">[] = [
  {
    type: "calendar",
    name: "일정",
    description: "다가오는 일정을 확인할 수 있어요.",
  },
  {
    type: "todo",
    name: "투두",
    description: "오늘 할 일을 확인할 수 있어요.",
  },
  {
    type: "memo",
    name: "메모",
    description: "최근 메모를 빠르게 확인할 수 있어요.",
  },
  {
    type: "accountBook",
    name: "자산",
    description: "월간 자산 현황을 확인할 수 있어요.",
  },
];

export const initialHomeWidgets: HomeWidget[] = [];

export function getWidgetTitle(type: HomeWidgetType) {
  return (
    homeWidgetCatalog.find((widget) => widget.type === type)?.name ?? "위젯"
  );
}
