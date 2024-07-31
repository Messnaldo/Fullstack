import { Component, OnInit } from '@angular/core';
import { AnalysisService } from './analysis.service';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [FormsModule, CommonModule, NgFor, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
  posts: any[] = [];
  hashtag: string = '#HASHTAG';
  sentimentCounts: any = { Positive: 0, Neutral: 0, Negative: 0 };  
  postsToShow: { [key: string]: number } = { Positive: 5, Neutral: 5, Negative: 5 };
  hasSearched: boolean = false;
  expanded: { [key: string]: boolean } = { Positive: false, Neutral: false, Negative: false };
  sample_data: any[] = [];
  noPostsFound: boolean = false;
  isOverLimit: boolean = false;
  fontSize: string = '120px';
  formattedHashtag: string = '';
  isAdmin: boolean = false; // เพิ่มตัวแปรนี้
  maxLength: number = 50;

  constructor(private hashtagAnalysisService: AnalysisService,private authService:AuthService,private router:Router) {}
  get displayHashtag(): string {
    return this.hashtag.startsWith('#') ? this.hashtag : `#${this.hashtag}`;
  }

  set displayHashtag(value: string) {
    this.hashtag = value.replace(/^#/, '');
  }
  
  ngOnInit(): void {
    // Initial code to run when component is initialized
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    console.log("chekc:",this.isAdmin);
    console.log(this.formattedHashtag)

  }

  onkeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.displayHashtag = this.hashtag;
      this.hashtag = this.hashtag.replace(/^#/, ''); // Remove the leading hashtag
      console.log('Hashtag after removing #: ', this.hashtag);
      this.searchHashtag();
    }
    if (this.hashtag.length >= 50 && !this.isOverLimit) {
      event.preventDefault(); // Stop further input
    }
  }

  onInput(event: any) {
    if (this.hashtag.length >= 50) {
      this.isOverLimit = true;
      this.hashtag = this.hashtag.substring(0, 50);
    } else {
      this.isOverLimit = false;
    }

    const characters = this.hashtag.length;
    if (characters > 38) {
      this.fontSize = '40px'; // Reduce font size to one-third
    } else if (characters > 19) {
      this.fontSize = '60px'; // Reduce font size by half
    } else {
      this.fontSize = '120px'; // Reset font size
    }

    this.updateFormattedHashtag();
  }

  updateFormattedHashtag() {
    const breakPoint1 = 19;
    const breakPoint2 = 38;

    if (this.hashtag.length > breakPoint2) {
      this.formattedHashtag = this.hashtag.substring(0, breakPoint1) + '\n' + this.hashtag.substring(breakPoint1, breakPoint2) + '\n' + this.hashtag.substring(breakPoint2);
    } else if (this.hashtag.length > breakPoint1) {
      this.formattedHashtag = this.hashtag.substring(0, breakPoint1) + '\n' + this.hashtag.substring(breakPoint1);
    } else {
      this.formattedHashtag = this.hashtag;
    }
  }

  searchHashtag(): void {
    this.hashtagAnalysisService.searchByHashtag(this.hashtag).subscribe((data) => {
      if (data.bucketName && data.fileName) {
        this.hashtagAnalysisService.getAllCsvData(data.bucketName, data.fileName).subscribe((anotherData) => {
          this.sample_data = anotherData.filter(post => post.label_type !== 'No Label');
          console.log("OK");
          console.log(this.sample_data);
          this.calculateSentimentCounts();
          this.expanded = { Positive: false, Neutral: false, Negative: false }; // Reset expanded state on new search
        });
      } else {
        this.sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
        this.sample_data = [];
        this.noPostsFound = true;
      }
    });
  }

  countWords(value: string): number {
    return value.trim().split(/\s+/).length;
  }
  
  addLineBreaks(value: string): string {
    const words = value.trim().split(/\s+/);
    if (words.length > 19) {
      // Add \n after the 19th word
      return words.slice(0, 19).join(' ') + '\n' + words.slice(19).join(' ');
    }
    return value;
  }
  getStyleForSentiment(sentiment: string): { [key: string]: string } {
    switch (sentiment) {
      case 'Positive':
        return { width: '80px', height: '80px' };
      case 'Neutral':
        return { width: '80px', height: '80px' };
      case 'Negative':
        return { width: '80px', height: '80px' };
      default:
        return { width: '40px', height: '40px' };
    }
  }
  calculateSentimentCounts(): void {
    this.sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    console.log(this.sample_data)
    this.sample_data.forEach(post => {
      
      // post = JSON.parse(post)
      if (post.label === 1) {
        this.sentimentCounts.Positive++;
      } else if (post.label === 0) {
        this.sentimentCounts.Neutral++;
      } else if (post.label === -1) {
        this.sentimentCounts.Negative++;
      }
    });
  }

  getEmojiUrl(sentiment: string): string {
    switch (sentiment) {
      case 'Positive':
        return 'Smile.png';
      case 'Neutral':
        return 'Neutral.png';
      case 'Negative':
        return 'Angry.png';
      default:
        return '';
    }
  }

  getSentimentPercentage(sentiment: string): number {
    const total = this.sentimentCounts.Positive + this.sentimentCounts.Neutral + this.sentimentCounts.Negative;
    if (total === 0) {
      return 0;
    }
    return Math.round((this.sentimentCounts[sentiment] / total) * 100);
  }

  getFilteredPosts(label: number): any[] {
    return this.sample_data.filter(post => post.label === label);
  }
 
 
  toggleExpand(sentiment: string): void {
    this.expanded[sentiment] = !this.expanded[sentiment];
  }
  logout()
  {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
