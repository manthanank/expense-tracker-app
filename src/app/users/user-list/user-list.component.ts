import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  @Input() users: any[] = [];
  @Input() loading: boolean = false;
  @Input() formatDate: (date: string) => string = (date) => date;
  @Output() userSelected = new EventEmitter<any>();
  
  viewUserDetails(user: any): void {
    this.userSelected.emit(user);
  }
}
