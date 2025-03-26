import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  @Input() user: any;
  @Input() expenses: any[] = [];
  @Input() loading: boolean = false;
  @Input() formatDate: (date: string) => string = (date) => date;
  @Input() formatCurrency: (amount: number) => string = (amount) => amount.toString();
  @Output() closeModal = new EventEmitter<void>();
  
  onCloseModal(): void {
    this.closeModal.emit();
  }
}
