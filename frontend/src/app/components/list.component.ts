import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookList, BookPages, BookResult } from '../models/book.model';
import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  startingWith: string = null
  bookList: BookList[] = []
  listCount: number
  page: number
  totalPages: number

  constructor(private dbSvc: DatabaseService, private activatedRoute: ActivatedRoute, private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.startingWith = this.activatedRoute.snapshot.params['id']
    this.authSvc.getListStartingWith(this.startingWith)
      .then(r => {
        this.renderResults(r)
      })
      .catch(e => console.error(e))
  }

  renderResults(r:BookPages) {
    this.bookList = r['results']['results']
    this.listCount = r['results']['total']
    this.page = r['page']
    this.totalPages = Math.ceil(this.listCount / r['results']['limit'])
  }

  prev() {
    this.authSvc.getListStartingWith(this.startingWith, this.page - 1, this.listCount)
      .then(r => {
        this.renderResults(r)
      })
      .catch(e => console.error(e))
  }

  next() {
    console.info(this.listCount)
    this.authSvc.getListStartingWith(this.startingWith, this.page + 1, this.listCount)
      .then(r => {
        this.renderResults(r)
      })
      .catch(e => console.error(e))
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

}
