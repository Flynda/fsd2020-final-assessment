import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { BookDetails, BookPages, BookResult } from "../models/book.model";
import { Login, SignUp } from "../models/login.model";

@Injectable()
export class AuthenticationService implements CanActivate {
    SERVER = 'http://localhost:3000'
    private token = ''
    errorMessage: string = ''
    url;

    constructor(private http: HttpClient, private router: Router) {}

    async authentication(loginDetails: Login): Promise<boolean> {
        try {
            const resp = await this.http.post<any>(`${this.SERVER}/login`, loginDetails, { observe: 'response' })
                .toPromise();
            if (resp.status == 200) {
                this.token = resp.body.token;
                this.errorMessage = '';
            }
            return true;
        } catch (err) {
            if (err.status == 401) {
                console.error('err: ', err.error.message);
                this.errorMessage = err.error.message;
            }
            return false;
        }
    }

    async signUp(userDetails: SignUp): Promise<boolean> {
        try {
            const resp = await this.http.post<any>(`${this.SERVER}/signup`, userDetails, { observe: 'response' })
                .toPromise();
            if (resp.status == 202) {
                this.errorMessage = '';
            }
            return true;
        } catch (err) {
            if (err.status == 409) {
                this.errorMessage = err.error.message;
            }
            return false;
        }
    }

    authGoogle(login) {
        
    }

    isLogin(){
        return this.token != ''
    }

    logout() {
        this.token = ''
        return
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.isLogin()) {
            return true
        }
        return this.router.parseUrl('/login')
    }

    suggestABook(formData: FormData): Promise<any> {
        const headers = (new HttpHeaders())
                        .set('Accept', 'application/json')
                        .set('Authorization', `Bearer ${this.token}`)
        try {
            return this.http.post(`${this.SERVER}/protected/share`, formData, {headers})
                .toPromise()
        } catch (err) {
            console.error(err)    
        }
    }

    async getListStartingWith(param: string, pageNo?: number, totalBooks?: number): Promise<BookPages> {
        const page = pageNo || 1
        const total = totalBooks || 0
        const queryString = (new HttpParams())
                        .set('page', page.toString())
                        .set('total', total.toString())
        const headers = (new HttpHeaders())
                        .set('Accept', 'application/json')
                        .set('Authorization', `Bearer ${this.token}`)
        try {
            const results = await this.http.get<BookResult>(`${this.SERVER}/list/${param.toLowerCase()}`, {params: queryString, headers})
                        .toPromise()
            return {
                results: results,
                page: page
            }
        } catch (err) {
            console.error(err)
        }
                        
    }

    async getBookDetails(book_id: string): Promise<BookDetails> {
        const headers = (new HttpHeaders())
                        .set('Accept', 'application/json')
                        .set('Authorization', `Bearer ${this.token}`)
        try {
            return await this.http.get<BookDetails>(`${this.SERVER}/book/${book_id}`, {headers})
                    .toPromise()    
        } catch (err) {
            console.error(err)    
        }
    }

    async addToFav(bookId: string):Promise<any> {
        const headers = (new HttpHeaders())
                        .set('Accept', 'application/json')
                        .set('Authorization', `Bearer ${this.token}`)
        try {
            return await this.http.post(`${this.SERVER}/protected/fav`, {bookId: bookId}, {headers})
                    .toPromise()
        } catch (err) {
            console.error(err)
        }
    }

    async RemoveFromFav(favId: number):Promise<any> {
        const params = (new HttpParams())
                        .set('favId', favId.toString())
        const headers = (new HttpHeaders())
                        .set('Accept', 'application/json')
                        .set('Authorization', `Bearer ${this.token}`)
        try {
            return await this.http.delete(`${this.SERVER}/protected/removeFav`, {headers, params})
                    .toPromise()
        } catch (err) {
            console.error(err)
        }
    }
}