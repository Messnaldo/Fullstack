import { Component } from '@angular/core';
import { RouterOutlet,RouterLink,RouterLinkActive } from '@angular/router';
import { AnalysisComponent } from './analysis/analysis.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {   constructor(private authService: AuthService, private router: Router) {}

  title = 'frontend';
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
