import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookDetails } from '../models/book.model';
import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, OnDestroy {

  book_id: string
  book_details: BookDetails
  favState: boolean = false
  btnTxt: string = 'Add to Bookmark'

  constructor(private dbSvc: DatabaseService, private activatedRoute: ActivatedRoute, private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.book_id = this.activatedRoute.snapshot.params['book_id']
    this.authSvc.getBookDetails(this.book_id)
      .then(r => {
        this.book_details = r
        console.info('fav? ', this.book_details.fav)
        this.favState = this.book_details.fav
        this.btnTxtState()
      })
      .catch(e => console.error(e))
  }

  toggleFavState(){
    this.btnTxtState()
    this.favState = !this.favState
  }

  btnTxtState() {
    if (this.favState) {
      this.btnTxt = 'Remove from Bookmark'
    } else {
      this.btnTxt = 'Add to Bookmark'
    }
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

  ngOnDestroy(){
    if (this.favState != this.book_details.fav) {
      if (this.favState) {
        this.authSvc.addToFav(this.book_id)
          .then(() => {console.info('added?')})
          .catch(e => console.error(e))
      } else {
        this.authSvc.RemoveFromFav(this.book_details.favId)
        .then(() => {console.info('removed?')})
        .catch(e => console.error(e))
      }
    }
  }
}
