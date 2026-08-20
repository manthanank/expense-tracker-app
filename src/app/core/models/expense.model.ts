export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Expenses {
  totalAmount: number;
  expenses: Expense[];
  pagination?: Pagination;
}

export interface Expense {
  _id: string;
  user: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  deletedAt?: string | null;
  __v?: number;
}
