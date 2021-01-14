import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignUp } from '../models/login.model';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup
  errorMessage: string = ''
  constructor(private fb: FormBuilder, private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    })
  }

  signup(){
    if (this.signupForm.get('password').value != this.signupForm.get('password2').value) {
      this.errorMessage = 'Please check your password is repeated correctly.'
      console.error(this.errorMessage)
    }
    this.errorMessage = ''
    const signupDetails: SignUp = {
      username: this.signupForm.get('username').value.toLowerCase(),
      password: this.signupForm.get('password').value,
      email: this.signupForm.get('email').value
    }
    this.authSvc.signUp(signupDetails)
      .then(result => {
        if (result) {
          this.router.navigate(['/newsignup'])
        } else {
          this.errorMessage = this.authSvc.errorMessage
          console.error('Did this error message work?: ', this.errorMessage)
        }
      })
      .catch(err => {
        console.error('There is an error: ', err)
      })

  }

}
