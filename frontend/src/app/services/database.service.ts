import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BookDetails, BookPages, BookResult, BookReviewDetails } from "../models/book.model";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class DatabaseService{

    // SERVER: string = 'http://localhost:3000'
    SERVER: string = '/'

    constructor(private http: HttpClient) { }

    // async getListStartingWith(param: string, pageNo?: number, totalBooks?: number): Promise<BookPages> {
    //     const page = pageNo || 1
    //     const total = totalBooks || 0
    //     const queryString = (new HttpParams())
    //                     .set('page', page.toString())
    //                     .set('total', total.toString())
    //     try {
    //         const results = await this.http.get<BookResult>(`${this.SERVER}/list/${param.toLowerCase()}`, {params: queryString})
    //                     .toPromise()
    //         return {
    //             results: results,
    //             page: page
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }

    // }

    // async getBookDetails(book_id: string): Promise<BookDetails> {
    //     try {
    //         return await this.http.get<BookDetails>(`${this.SERVER}/book/${book_id}`)
    //                 .toPromise()    
    //     } catch (err) {
    //         console.error(err)    
    //     }
    // }

    async getBookReviews(title: string): Promise<BookReviewDetails> {
        try {
            return await this.http.get<BookReviewDetails>(`${this.SERVER}/review/${title}`)
                    .toPromise()        
        } catch (err) {
            console.error(err)
        }
    }
}