import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule ,RouterLink, RouterOutlet, RouterLinkActive ,CommonModule, NgFor],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    // Check if all required fields are filled
    if (!this.email || !this.password) {
      alert("Please fill in all required fields.");
      return;
    }
  
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('isAdmin', response.isAdmin);
          if (response.isAdmin) {
            this.router.navigate(['/analysis']);
          } else {
            this.router.navigate(['/analysis']);
          }
        }
      },
      (error) => {
        console.error('Login failed', error);
        if (error.status === 401) {
          alert("Login Failed");
        }
      }
    );
  }
  
}
