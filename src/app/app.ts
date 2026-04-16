import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthFormComponent } from './auth-form/auth-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,AuthFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('quantity-frontend');
}
