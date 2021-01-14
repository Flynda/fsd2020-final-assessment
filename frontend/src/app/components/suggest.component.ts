import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-suggest',
  templateUrl: './suggest.component.html',
  styleUrls: ['./suggest.component.css']
})
export class SuggestComponent implements OnInit {

  @ViewChild('imageFile') imageFile: ElementRef
  bookForm: FormGroup
  errorMessage: string
  formatList: string[] = [
    'Audible Audio',
    'Audio CD',
    'Audiobook',
    'Chapbook',
    'Hardcover',
    'Kindle Edition',
    'Mass Market Paperback',
    'Nook',
    'Paperback',
    'Trade Paperback',
    'ebook'
  ]

  constructor(private authSvc: AuthenticationService, private router: Router, private dbSvc: DatabaseService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.bookForm = this.mkForm()
  }

  private mkForm(img?):FormGroup {
		return this.fb.group({
			title: ['', Validators.required],
			authors: ['', Validators.required],
      'bookcover-img': [img],
      description: [''],
      edition: [''],
      format: [''],
      genres: [''],
      pages: ['']
		})
	}

  upload(){
    console.info('Pressed the button!')
    const bookData = new FormData()
    bookData.set('title', this.bookForm.get('title').value)
    bookData.set('authors', this.bookForm.get('authors').value)
    bookData.set('description', this.bookForm.get('description').value)
    bookData.set('edition', this.bookForm.get('edition').value)
    bookData.set('format', this.bookForm.get('format').value)
    bookData.set('genres', this.bookForm.get('genres').value)
    bookData.set('pages', this.bookForm.get('pages').value)
    bookData.set('bookcover-img', this.imageFile.nativeElement.files[0])
    this.authSvc.suggestABook(bookData)
      .then(() => {
        console.info('Book suggestion successful!')
        this.bookForm.reset()
        this.router.navigate(['/'])
      })
      .catch(err => {
        console.error('error: ', err);
      })
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

  canILeave() {
    return (!this.bookForm.dirty)
  }
}
