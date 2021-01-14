import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  btnTxt: string = "Login"
  loginStatus: boolean = false

  alphabetArray = [
    ['A', 'B', 'C', 'D', 'E',],
    ['F', 'G', 'H', 'I', 'J',],
    ['K', 'L', 'M', 'N', 'O',],
    ['P', 'Q', 'R', 'S', 'T',],
    ['U', 'V', 'W', 'X', 'Y',],
    ['Z']
  ]
  numArray = [
    ['0', '1', '2', '3', '4',],
    ['5', '6', '7', '8', '9']
  ]

  constructor(private router: Router, private authSvc: AuthenticationService) { }

  ngOnInit(): void {
    this.loginStatus = this.authSvc.isLogin()
    if (this.loginStatus) {
      this.btnTxt = "Logout"
    } else {
      this.btnTxt = "Login"
    }
  }

  toggleBtn(){
    if (this.btnTxt == 'Login') {
      this.router.navigate(['/login'])
    } else {
      this.btnTxt = "Login"
      this.authSvc.logout()
      this.router.navigate(['/'])
    }
  }

}
