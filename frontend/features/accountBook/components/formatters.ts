export function formatWon(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function formatSignedWon(amount: number, type: 'expense' | 'income') {
  const sign = type === 'income' ? '+' : '-';

  return `${sign}${formatWon(amount)}`;
}

export function formatDatePill(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function formatMonthTitle(year: number, month: number) {
  return `${year}년 ${month}월`;
}

export function formatSelectedDateTitle(dateString: string) {
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const date = new Date(`${dateString}T00:00:00`);

  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}`;
}
