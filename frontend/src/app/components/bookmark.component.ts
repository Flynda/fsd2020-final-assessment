import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserFavBookList } from '../models/book.model';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.css']
})
export class BookmarkComponent implements OnInit {

  bookList: UserFavBookList[] = []

  constructor(private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.authSvc.getUserFavorites()
      .then(r => {
        this.bookList = r
      })
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

}
