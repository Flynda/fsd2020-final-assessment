import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BookDetails, BookPages, BookResult, BookReviewDetails } from "../models/book.model";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class DatabaseService{

    SERVER: string = 'http://localhost:3000'

    constructor(private http: HttpClient) { }

    async getListStartingWith(param: string, pageNo?: number, totalBooks?: number): Promise<BookPages> {
        const page = pageNo || 1
        const total = totalBooks || 0
        const queryString = (new HttpParams())
                        .set('page', page.toString())
                        .set('total', total.toString())
        const results = await this.http.get<BookResult>(`${this.SERVER}/list/${param.toLowerCase()}`, {params: queryString})
                        .toPromise()
        return {
            results: results,
            page: page
        }
    }

    async getBookDetails(book_id: string): Promise<BookDetails> {
        return await this.http.get<BookDetails>(`${this.SERVER}/book/${book_id}`)
                        .toPromise()
    }

    async getBookReviews(title: string): Promise<BookReviewDetails> {
        return await this.http.get<BookReviewDetails>(`${this.SERVER}/review/${title}`).toPromise()
    }
}