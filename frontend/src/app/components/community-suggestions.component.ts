import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookList } from '../models/book.model';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-community-suggestions',
  templateUrl: './community-suggestions.component.html',
  styleUrls: ['./community-suggestions.component.css']
})
export class CommunitySuggestionsComponent implements OnInit {

  bookList: BookList[] = []

  constructor(private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.authSvc.getOthersSuggestions()
      .then(r => {
        this.bookList = r
      })
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

}
