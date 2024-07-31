import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule ,RouterLink, RouterOutlet, RouterLinkActive ,CommonModule, NgFor],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  fullName: string = '';

  constructor(private authService: AuthService, private router: Router) {}
  isValidEmail(email: string): boolean {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  signup() {
    // Check if all required fields are filled
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }
  
    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      alert("Password does not match");
      return;
    }
    if (!this.isValidEmail(this.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    const user = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      isAdmin: false, // Default to regular user
    };
  
    this.authService.signup(user).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Signup failed', error);
        if (error.status === 500) {
          alert("Email is already exist");
        }
      }
    );
  }
}
