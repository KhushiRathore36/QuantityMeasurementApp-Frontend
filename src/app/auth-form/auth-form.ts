import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-form.html',
  styleUrls: ['./auth-form.css']
})
export class AuthFormComponent {

  isLogin = true;

  username = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  handleLogin() {
    const data = {
      username: this.username,
      password: this.password
    };

    this.auth.login(data).subscribe({
       next: (res: any) => {
         console.log("Login Response:", res);

        this.auth.saveToken(res.token); // ✅ store token

        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert("Login failed");
      }
    });
  }

  handleSignup() {
    const data = {
      username: this.username,
      password: this.password
    };

    this.auth.signup(data).subscribe(() => {
      alert('Signup successful');
      this.isLogin = true;
    });
  }
  
}