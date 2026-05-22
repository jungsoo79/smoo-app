# 가계부 API 명세서

프론트 가계부 화면은 현재 mock 기반으로 동작하고 있으며, 실제 API 전환 시 아래 계약을 기준으로 연동합니다.

## 공통 규칙

- Base path: `/api/account-book`
- 날짜 형식: `YYYY-MM-DD`
- 금액 단위: 원화 정수. 소수점 없음.
- 카테고리에는 `type` 필드를 두지 않습니다.
- 지출/수입 구분은 반드시 `Transaction.type`으로만 관리합니다.
- 인증이 붙는 경우 모든 API는 현재 로그인한 사용자의 데이터만 반환합니다.
- 현재 코드 기준 auth API 호출 구현은 아직 없지만, 백엔드 설정에 Spring Security/JWT 환경 변수가 준비되어 있으므로 인증 적용 시 `Authorization: Bearer {accessToken}` 헤더 방식을 권장합니다.
- 응답의 `id`는 number 기준입니다.

## 타입

```ts
type TransactionType = 'expense' | 'income';
type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface Category {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface RepeatRule {
  id: number;
  frequency: RepeatFrequency;
  interval: number;
  startDate: string;
  endDate?: string | null;
}

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  title: string;
  memo?: string;
  date: string;
  categoryId: number;
  paymentMethodId?: number | null;
  repeatRuleId?: number | null;
}

interface TransactionWithMeta extends Transaction {
  category: Category;
  paymentMethod?: PaymentMethod | null;
}

interface DailySummary {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: TransactionWithMeta[];
}

interface MonthlyCategoryAnalysis {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percent: number;
}

interface MonthlyAnalysis {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  categoryAnalysis: MonthlyCategoryAnalysis[];
}

interface BalanceSummary {
  currentBalance: number;
  diffFromYesterday: number;
}
```

## 1. 현재 잔액 조회

`GET /api/account-book/balance-summary`

### Response 200

```json
{
  "currentBalance": 5958400,
  "diffFromYesterday": -35700
}
```

### 계산 기준

- `currentBalance`: 초기 자산 + 오늘까지의 총 수입 - 오늘까지의 총 지출
- `diffFromYesterday`: 오늘 기준 잔액 - 전날 기준 잔액
- 오늘 기준은 서버 날짜 또는 사용자 타임존 기준으로 통일이 필요합니다.

## 2. 월별 캘린더 요약 조회

`GET /api/account-book/calendar?year=2026&month=5`

### Query

| name | type | required | description |
| --- | --- | --- | --- |
| `year` | number | yes | 조회 연도 |
| `month` | number | yes | 조회 월. `1`부터 `12` |

### Response 200

```json
[
  {
    "date": "2026-05-18",
    "income": 0,
    "expense": 35700,
    "balance": 5958400,
    "transactions": [
      {
        "id": 29,
        "type": "expense",
        "amount": 31800,
        "title": "회사 근처 점심",
        "memo": "5월 18일 점심",
        "date": "2026-05-18",
        "categoryId": 1,
        "paymentMethodId": 1,
        "repeatRuleId": null,
        "category": {
          "id": 1,
          "name": "식비",
          "color": "#F97316",
          "isDefault": true
        },
        "paymentMethod": {
          "id": 1,
          "name": "카드"
        }
      }
    ]
  }
]
```

### 응답 규칙

- 해당 월의 모든 날짜를 반환하는 것을 권장합니다.
- 거래가 없는 날짜도 `income: 0`, `expense: 0`, `transactions: []`로 내려주세요.
- 프론트 캘린더는 `transactions` 중 최대 3개만 미리보기로 표시합니다.
- `balance`는 해당 날짜까지의 누적 잔액입니다.

## 3. 특정 날짜 거래 조회

`GET /api/account-book/transactions?date=2026-05-18`

### Query

| name | type | required | description |
| --- | --- | --- | --- |
| `date` | string | yes | 조회 날짜. `YYYY-MM-DD` |

### Response 200

```json
[
  {
    "id": 29,
    "type": "expense",
    "amount": 31800,
    "title": "회사 근처 점심",
    "memo": "5월 18일 점심",
    "date": "2026-05-18",
    "categoryId": 1,
    "paymentMethodId": 1,
    "repeatRuleId": null,
    "category": {
      "id": 1,
      "name": "식비",
      "color": "#F97316",
      "isDefault": true
    },
    "paymentMethod": {
      "id": 1,
      "name": "카드"
    }
  }
]
```

### 정렬

- 기본 정렬은 생성 순서 또는 시간 필드가 추가될 경우 시간 오름차순을 권장합니다.
- 현재 프론트 타입에는 거래 시간이 없으므로 날짜 내 순서는 서버 기본 순서를 따릅니다.

## 4. 월별 분석 조회

`GET /api/account-book/analysis/monthly?year=2026&month=5`

### Query

| name | type | required | description |
| --- | --- | --- | --- |
| `year` | number | yes | 분석 연도 |
| `month` | number | yes | 분석 월 |

### Response 200

```json
{
  "year": 2026,
  "month": 5,
  "totalIncome": 3400000,
  "totalExpense": 535400,
  "categoryAnalysis": [
    {
      "categoryId": 1,
      "categoryName": "식비",
      "color": "#F97316",
      "amount": 264300,
      "percent": 49
    },
    {
      "categoryId": 3,
      "categoryName": "쇼핑",
      "color": "#DB2777",
      "amount": 177600,
      "percent": 33
    }
  ]
}
```

### 계산 기준

- `totalIncome`: 해당 월 `type === 'income'` 합계
- `totalExpense`: 해당 월 `type === 'expense'` 합계
- `categoryAnalysis`: 지출만 기준으로 카테고리별 합계 계산
- `percent`: `amount / totalExpense * 100` 반올림 정수
- 카테고리 분석은 `amount` 내림차순을 권장합니다.

## 5. 거래 생성

`POST /api/account-book/transactions`

### Request Body

```json
{
  "type": "expense",
  "amount": 31800,
  "title": "회사 근처 점심",
  "memo": "5월 18일 점심",
  "date": "2026-05-18",
  "categoryId": 1,
  "paymentMethodId": 1,
  "repeatRuleId": null
}
```

### Response 201

```json
{
  "id": 31,
  "type": "expense",
  "amount": 31800,
  "title": "회사 근처 점심",
  "memo": "5월 18일 점심",
  "date": "2026-05-18",
  "categoryId": 1,
  "paymentMethodId": 1,
  "repeatRuleId": null
}
```

### Validation

- `type`: `expense` 또는 `income`
- `amount`: 1 이상의 정수
- `title`: 1자 이상
- `date`: 유효한 `YYYY-MM-DD`
- `categoryId`: 존재하는 카테고리 id
- `paymentMethodId`: `null` 또는 존재하는 결제수단 id
- `repeatRuleId`: `null` 또는 존재하는 반복 규칙 id

## 6. 카테고리 목록 조회

`GET /api/account-book/categories`

### Response 200

```json
[
  {
    "id": 1,
    "name": "식비",
    "color": "#F97316",
    "isDefault": true
  },
  {
    "id": 8,
    "name": "병원",
    "color": "#06B6D4",
    "isDefault": false
  }
]
```

## 7. 카테고리 생성

`POST /api/account-book/categories`

### Request Body

```json
{
  "name": "병원",
  "color": "#06B6D4"
}
```

### Response 201

```json
{
  "id": 8,
  "name": "병원",
  "color": "#06B6D4",
  "isDefault": false
}
```

### Validation

- `name`: 1자 이상, 사용자별 중복 금지 권장
- `color`: `#RRGGBB` 형식
- 요청/응답에 `type` 필드를 추가하지 않습니다.

## 8. 결제수단 목록 조회

`GET /api/account-book/payment-methods`

### Response 200

```json
[
  {
    "id": 1,
    "name": "카드"
  },
  {
    "id": 2,
    "name": "현금"
  },
  {
    "id": 3,
    "name": "계좌이체"
  }
]
```

## 9. 반복 규칙 생성

현재 프론트에는 반복 거래 선택 UI가 있으며, 반복을 선택하면 먼저 반복 규칙을 만들고 `repeatRuleId`를 거래 생성 요청에 포함하는 흐름을 기준으로 합니다.

`POST /api/account-book/repeat-rules`

### Request Body

```json
{
  "frequency": "monthly",
  "interval": 1,
  "startDate": "2026-05-18",
  "endDate": null
}
```

### Response 201

```json
{
  "id": 3,
  "frequency": "monthly",
  "interval": 1,
  "startDate": "2026-05-18",
  "endDate": null
}
```

### Validation

- `frequency`: `daily`, `weekly`, `monthly`, `yearly`
- `interval`: 1 이상의 정수
- `startDate`: 유효한 `YYYY-MM-DD`
- `endDate`: `null` 또는 `startDate` 이후 날짜

## 에러 응답 형식

```json
{
  "message": "categoryId does not exist",
  "code": "CATEGORY_NOT_FOUND"
}
```

권장 HTTP status:

- `400 Bad Request`: 형식 오류, validation 실패
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 타 사용자 리소스 접근
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 중복 카테고리 등 충돌
- `500 Internal Server Error`: 서버 오류

## 프론트 함수 매핑

| Frontend function | Backend API |
| --- | --- |
| `getBalanceSummary()` | `GET /api/account-book/balance-summary` |
| `getMonthlyCalendar(year, month)` | `GET /api/account-book/calendar?year={year}&month={month}` |
| `getTransactionsByDate(date)` | `GET /api/account-book/transactions?date={date}` |
| `getMonthlyAnalysis(year, month)` | `GET /api/account-book/analysis/monthly?year={year}&month={month}` |
| `createTransaction(payload)` | `POST /api/account-book/transactions` |
| `getCategories()` | `GET /api/account-book/categories` |
| `createCategory(payload)` | `POST /api/account-book/categories` |
| `getPaymentMethods()` | `GET /api/account-book/payment-methods` |
| `createRepeatRule(payload)` | `POST /api/account-book/repeat-rules` |

## 백엔드 구현 메모

- 초기 자산 설정 API는 현재 프론트 mock에는 없지만, 추후 별도 화면이 생길 가능성이 있습니다.
- 반복 거래는 실제 생성 시점에 개별 거래를 materialize할지, 조회 시 rule 기반으로 계산할지 백엔드에서 정책 결정이 필요합니다.
- 월별 캘린더와 월별 분석은 프론트가 매월 이동할 때 호출하므로, 월 단위 조회 성능을 고려해주세요.
- 타임존은 사용자 설정 또는 `Asia/Seoul` 기준으로 맞추는 것을 권장합니다.
