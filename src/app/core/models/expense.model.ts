export type Expenses = Expense[]

export interface Expense {
  _id: string
  user: string
  description: string
  amount: number
  date: string
  category: string
  __v: number
}
