import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, CreateUserInput, UpdateUserInput } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/users';

  readonly users = signal<User[]>([]);
  readonly isLoading = signal<boolean>(false);

  fetchUsers(): Observable<User[]> {
    this.isLoading.set(true);
    return this.http.get<User[]>(this.baseUrl).pipe(
      tap({
        next: (users) => {
          this.users.set(users);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  createUser(input: CreateUserInput): Observable<User> {
    return this.http.post<User>(this.baseUrl, input).pipe(
      tap((user) => {
        this.users.update(users => [user, ...users]);
      })
    );
  }

  updateUser(id: number, input: UpdateUserInput): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, input).pipe(
      tap((updated) => {
        this.users.update(users =>
          users.map(u => u.id === id ? updated : u)
        );
      })
    );
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.users.update(users => users.filter(u => u.id !== id));
      })
    );
  }
}
