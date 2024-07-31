
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { SearchService } from './search.service';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { WebSocketService } from '../websocket.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule, NgFor, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  text: string = '';
  latestMessage: any = null;
  isLoading: boolean = false;
  isAdmin: boolean = false; // เพิ่มตัวแปรนี้

  constructor(
    private searchService: SearchService,
    private webSocketService: WebSocketService,
    private ngZone: NgZone,
    private authService:AuthService,
    private router:Router
  ) {}

  getRandomLabel(): number {
    const labels = [-1, 0, 1];
    return labels[Math.floor(Math.random() * labels.length)];
  }

  ngOnInit() {
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';

    this.webSocketService.listen('connect').subscribe(() => {
      console.log('Connected to WebSocket server');
    });

    this.webSocketService.listen('message').subscribe((message: any) => {
      this.ngZone.run(() => {
        console.log('Received message from WebSocket:', message);

        // Parse the value and timestamp from the message
        const parsedMessage = JSON.parse(message.value);
        const parsedTimestamp = message.timestamp;

        // Assuming message.value is an array of objects
       
          this.latestMessage = {
            text: parsedMessage[0].text,
            label: parsedMessage[0].label ,
            timestamp: parsedTimestamp,
          };
        
        
        
        console.log('Latest message:', this.latestMessage);
        this.isLoading = false;
      });
    });

    this.webSocketService.listen('disconnect').subscribe(() => {
      console.log('Disconnected from WebSocket server');
    });
  }

  ngOnDestroy() {}

 
  searchCsvData() {
    if (!this.text.trim()) {
        // ถ้า textarea ว่าง
        alert("Please enter text in the textarea!");
        return;
    }

    this.isLoading = true; // Start loading
    document.getElementById('exampleFormControlTextarea1')!.style.border = ""; // Reset border

    this.searchService.searchKafka(this.text).subscribe(response => {
        console.log('Search response:', response); // Check response
        console.log('Latest Message WA:', this.latestMessage);
        this.isLoading = false; // Stop loading when search completes
    });
}
  getSentimentText(label: number): string {
    if (label === 1) {
      return 'Positive';
    } else if (label === 0) {
      return 'Neutral';
    } else {
      return 'Negative';
    }
  }

  getSentimentColor(label: number): string {
    if (label === 1) {
      return '#FFFFFF';
    } else if (label === 0) {
      return '#FFFFFF';
    } else {
      return '#FFFFFF';
    }
  }

  getSentimentImage(label: number): string {
    if (label === 1) {
      return 'Smile.png';
    } else if (label === 0) {
      return 'Neutral.png';
    } else {
      return 'Angry.png';
    }
  }
  logout()
  {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
