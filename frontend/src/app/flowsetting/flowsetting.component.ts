import { Component, AfterViewInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
@Component({
  selector: 'app-flowsetting',
  standalone: true,
  imports: [FormsModule,RouterLink, RouterOutlet, RouterLinkActive, CommonModule, NgFor  ],
  templateUrl: './flowsetting.component.html',
  styleUrl: './flowsetting.component.scss'
})
export class FlowsettingComponent {
  title = 'angular-datepicker';
  


}