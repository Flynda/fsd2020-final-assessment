import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookDetails } from '../models/book.model';
import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  book_id: string
  book_details: BookDetails

  constructor(private dbSvc: DatabaseService, private activatedRoute: ActivatedRoute, private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.book_id = this.activatedRoute.snapshot.params['book_id']
    this.dbSvc.getBookDetails(this.book_id)
      .then(r => {
        this.book_details = r
      })
      .catch(e => console.error(e))
  }

  fav(book_id: string){
    console.info('book_id: ', book_id)
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }
}
