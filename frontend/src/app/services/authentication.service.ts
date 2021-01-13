import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { BookPages, BookResult } from "../models/book.model";
import { Login } from "../models/login.model";

@Injectable()
export class AuthenticationService implements CanActivate {
    SERVER = 'http://localhost:3000'
    private token = ''
    errorMessage: string = ''
    url;

    constructor(private http: HttpClient, private router: Router) {}

    authentication(loginDetails: Login) {
        return this.http.post<any>(`${this.SERVER}/login`, loginDetails, {observe: 'response'})
                .toPromise()
                .then(resp => {
                    if (resp.status == 200) {
                        this.token = resp.body.token
                        this.errorMessage = ''
                    }
                    return true
                })
                .catch(err => {
                    if (err.status == 401) {
                        console.error('err: ', err.error.message)
                        this.errorMessage = err.error.message
                    }
                    return false
                })
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
        return this.http.post(`${this.SERVER}/protected/share`, formData, {headers})
                .toPromise()
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
        const results = await this.http.get<BookResult>(`${this.SERVER}/list/${param.toLowerCase()}`, {params: queryString, headers})
                        .toPromise()
        return {
            results: results,
            page: page
        }
    }
}