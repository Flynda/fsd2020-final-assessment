import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../models/login.model';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup
  errorMessage: string = ''

  constructor(private fb: FormBuilder, private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  login() {
    const loginDetails: Login = {
      username: this.loginForm.get('username').value,
      password: this.loginForm.get('password').value
    }
    this.authSvc.authentication(loginDetails)
      .then(result => {
        console.info('login result: ', result)
        if (result) {
          this.router.navigate(['/'])
        } else {
          this.errorMessage = this.authSvc.errorMessage
        }
        
      })
      .catch(err => {
        console.error('There is an error: ', err)
      })
  }

  socialSignIn(socialProvider: string){
    
  }

}
