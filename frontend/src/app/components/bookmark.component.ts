import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.css']
})
export class BookmarkComponent implements OnInit {

  constructor(private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.authSvc.logout()
    this.router.navigate(['/'])
  }

}
