import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.css']
})
export class UserReviewsComponent implements OnInit {

  reviewForm: FormGroup
  constructor(private authSvc: AuthenticationService, private router: Router, private fb: FormBuilder, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      review: ['', Validators.required]
    })
  }

  review(){
    this.authSvc.reviewABook({review: this.reviewForm.get('review').value, bookId: this.activatedRoute.snapshot.params['book_id']})
      .then(() => {
        this.reviewForm.reset()
        this.router.navigate(['/'])
      })
      .catch(err => {
        console.error('There is an error: ', err)
      })
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

}
