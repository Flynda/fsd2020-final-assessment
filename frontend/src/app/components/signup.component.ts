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
      this.errorMessage = 'Please check your password is entered correctly. Password and Repeat password must be the same'
      console.error(this.errorMessage)
    }
    const signupDetails: SignUp = {
      username: this.signupForm.get('username').value,
      password: this.signupForm.get('password').value,
      email: this.signupForm.get('email').value
    }

    // const loginDetails: Login = {
    //   username: this.loginForm.get('username').value,
    //   password: this.loginForm.get('password').value
    // }
    // this.authSvc.authentication(loginDetails)
    //   .then(result => {
    //     console.info('login result: ', result)
    //     if (result) {
    //       this.router.navigate(['/'])
    //     } else {
    //       this.errorMessage = this.authSvc.errorMessage
    //     }
        
    //   })
    //   .catch(err => {
    //     console.error('There is an error: ', err)
    //   })

  }

}
