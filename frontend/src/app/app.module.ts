import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { ListComponent } from './components/list.component';
import { BookComponent } from './components/book.component';
import { ReviewComponent } from './components/review.component';
import { IndexComponent } from './components/index.component';
import { BookmarkComponent } from './components/bookmark.component';
import { DatabaseService } from './services/database.service';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './components/error.component';
import { AuthenticationService } from './services/authentication.service';
import { SuggestComponent } from './components/suggest.component';
import { CanLeaveService } from './services/can-leave.service';
import { SignupComponent } from './components/signup.component';
import { ProfileComponent } from './components/profile.component';
import { CommunitySuggestionsComponent } from './components/community-suggestions.component';
import { NewSignupComponent } from './components/new-signup.component';



const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'newsignup', component: NewSignupComponent },
  { path: 'list/:id', component: ListComponent,
    canActivate: [AuthenticationService]
  },
  { path: 'book/:book_id', component: BookComponent,
    canActivate: [AuthenticationService]
  },
  { path: 'review/:title', component: ReviewComponent,
    canActivate: [AuthenticationService]
  },
  { path: 'favorites', component: BookmarkComponent,
    canActivate: [AuthenticationService]
  },
  {
    path: 'suggest', component: SuggestComponent,
    canActivate: [AuthenticationService],
    canDeactivate: [CanLeaveService]
  },
  {
    path: 'shares', component: CommunitySuggestionsComponent,
    canActivate: [AuthenticationService]
  },
  { path: 'forbidden', component: ErrorComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ListComponent,
    BookComponent,
    ReviewComponent,
    IndexComponent,
    BookmarkComponent,
    ErrorComponent,
    SuggestComponent,
    SignupComponent,
    ProfileComponent,
    CommunitySuggestionsComponent,
    NewSignupComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule, ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    AuthenticationService,
    DatabaseService,
    CanLeaveService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
