import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-form.html',
  styleUrls: ['./auth-form.css']
})
export class AuthFormComponent implements OnInit {

  isLogin = true;

  username = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 🔥 Google OAuth Token Handle
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        console.log("Google Login Success");

        this.auth.saveToken(token); // store token

        this.router.navigate(['/']); // redirect
      }

      if (params['error']) {
        alert("Google login failed");
      }
    });
  }

  handleLogin() {
    const data = {
      username: this.username,
      password: this.password
    };

    this.auth.login(data).subscribe({
      next: (res: any) => {
        console.log("Login Response:", res);

        this.auth.saveToken(res.token);

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

  // 🔥 Google Login Trigger
  loginWithGoogle() {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  }
}