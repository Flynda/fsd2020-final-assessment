import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }
}
