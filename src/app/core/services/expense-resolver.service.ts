import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ExpenseService } from './expense.service';
import { Expense } from '../models/expense.model'

@Injectable({
  providedIn: 'root'
})
export class ExpenseResolverService implements Resolve<Expense> {
  constructor(private expenseService: ExpenseService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Expense>|Promise<Expense>|Expense {
    const id = route.paramMap.get('id') || '';
    return this.expenseService.getExpense(id);
  }
}