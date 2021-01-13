import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookReview } from '../models/book.model';
import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {

  title: string
  book_review: BookReview[] = []
  copyright: string
  hasReview: boolean

  constructor(private dbSvc: DatabaseService, private activatedRoute: ActivatedRoute, private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.title = this.activatedRoute.snapshot.params['title']
    this.dbSvc.getBookReviews(this.title)
      .then(r => {
        this.book_review = r['reviews']
        this.copyright = r['copyright']
        this.hasReview = r['hasReview']
      })
      .catch(e => console.error(e))
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

}
