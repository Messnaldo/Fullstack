
import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { LabelService } from './label.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, FormsModule, NgFor, CommonModule],
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  @ViewChild('searchNotificationModal') searchNotificationModal!: ElementRef;
  notificationMessage: string = '';  // เพิ่มตัวแปรนี้

  csvData: any[] = [];
  searchTerm: string = '';
  hashtagSearchTerm: string = '';
  contextSearchTerm: string = '';
  selectedHashtag: string = '';
  hasSearched = false;
  searchResults: any[] = [];
  filteredResults: any[] = [];
  predefinedHashtags: string[] = ['sunset', 'weekend', 'show', 'grateful'];
  filteredHashtags: string[] = [...this.predefinedHashtags];
  showNotification: boolean = false;
  labelFilters: Set<string> = new Set();
  editMode: boolean = false;
  sentimentFilters: Set<number> = new Set();
  hashtags: string[] = [];
  isDropdown1Open = false;
  isDropdown2Open = false;
  constructor(private csvDataService: LabelService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.csvDataService.getAllHashtags().subscribe((data) => {
      this.hashtags = data.map(item => item.hashtag);
      this.filteredHashtags = [...this.hashtags];
    });
    console.log(this.hashtags);
  }
 
  toggleDropdown(dropdown: string) {
    if (dropdown === 'dropdown1') {
      this.isDropdown1Open = !this.isDropdown1Open;
    } else if (dropdown === 'dropdown2') {
      this.isDropdown2Open = !this.isDropdown2Open;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  
  

  toggleLabel(result: any, label: number) {
    if (this.editMode) {
      if (result.label === label) {
        result.label = null;
        result.label_type = 'No Label';
      } else {
        result.label = label;
        result.label_type = 'Custom-labeled';
      }
    }
  }

  validateConfidence(result: any): string {
    if (result.label_type === 'No Label' || result.label_type === 'Custom-labeled') {
      console.log("ผ่านเงื่อนไขแรก")
      return '-';
    }
    const num = parseFloat(result.confident_level);
    if (isNaN(num) || num < 0 || num > 1) {
      console.log("ผ่านเงื่อนไขสอง")
      return '-';
    }
    return result.confident_level.toString();
  }

  isValidConfidentLevel(level: any): boolean {
    return typeof level === 'number' && level >= 0 && level <= 1;
  }

  toggleLabelFilter(labelType: string) {
    if (this.labelFilters.has(labelType)) {
      this.labelFilters.delete(labelType);
    } else {
      this.labelFilters.add(labelType);
    }
    this.applyFilters();
  }
  isLabelFilterActive(labelType: string): boolean {
    return this.labelFilters.has(labelType);
  }
  isSentimentFilterActive(sentiment: number): boolean {
    return this.sentimentFilters.has(sentiment);
  }

  toggleSentimentFilter(sentiment: number) {
    if (this.sentimentFilters.has(sentiment)) {
      this.sentimentFilters.delete(sentiment);
    } else {
      this.sentimentFilters.add(sentiment);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredResults = this.searchResults.filter(result => 
      (this.labelFilters.size === 0 || this.labelFilters.has(result.label_type)) &&
      (this.sentimentFilters.size === 0 || (result.label_type !== 'No Label' && this.sentimentFilters.has(result.label)))
    );
  }

  filterContext() {
    this.filteredResults = this.searchResults.filter(result =>
      result.text.toLowerCase().includes(this.contextSearchTerm.toLowerCase())
    );
  }

  filterHashtags() {
    this.filteredHashtags = this.hashtags.filter(hashtag =>
      hashtag.toLowerCase().includes(this.hashtagSearchTerm.toLowerCase())
    );
    this.hasSearched = true;  // Ensure that hasSearched is false while typing

  }
 closeModal() {
    this.hasSearched = true;
  }
  selectHashtag(hashtag: string) {
    this.selectedHashtag = hashtag;
    this.hashtagSearchTerm = hashtag;
    this.filterHashtags();
    this.searchHashtag();
  }


  
  searchHashtag() {
    this.hasSearched = true;
    this.showNotification = false;
    const searchTerm = this.selectedHashtag || this.hashtagSearchTerm; // Use hashtagSearchTerm if selectedHashtag is not set
    this.csvDataService.getCsvData(searchTerm).subscribe(
      (data) => {
        this.csvData = data;
        this.searchResults = this.csvData;
        this.filteredResults = this.csvData;
        this.filterContext();
        if (this.csvData.length === 0) {
          this.notificationMessage = 'There is no search history for this tag. Please try another tag or check spelling.';
          this.showNotification = true;
        }
      },
      (error) => {
        if (error.status === 404) {
          this.notificationMessage = 'There is no search history for this tag. Please try another tag or check spelling.';
        } else {
          this.notificationMessage = 'An error occurred while searching. Please try again later.';
        }
        this.showNotification = true;
      }
    );
  }

  
  toggleEditMode() {
    if (this.editMode) {
      // Save changes
      // The modal will be shown via the data-bs-* attributes in the HTML
    } else {
      this.editMode = true;
    }
  }

  confirmSave() {
    this.csvDataService.updateCsvData(this.selectedHashtag, this.csvData).subscribe(() => {
      this.editMode = false;
    });
    console.log("asdasdasdasdasd",this.selectedHashtag)
  }

  cancelSave() {
    this.editMode = true; // Keep edit mode active
  }
  closeNotification() {
    this.showNotification = false;
  }
}
