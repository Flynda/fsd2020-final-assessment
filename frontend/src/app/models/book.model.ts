export interface BookList {
    book_id: string
    title: string
}

export interface BookResult {
    results: BookList[]
    limit: number
    total: number
}

export interface BookPages {
    results: BookResult
    page: number
}

export interface BookDetails {
    bookId: string
    title: string
    authors: string
    summary: string
    pages: number
    rating: number
    ratingCount: number
    genre: string
    image_url: string
    fav: boolean
    favId: number
}

export interface BookReview {
    title: string
    author: string
    reviewer: string
    review_date: string
    summary: string
    link: string
}

export interface BookReviewDetails {
    hasReview: boolean
    copyright: string
    reviews: BookReview[]
}

export interface UserFavBookList extends BookList {
    user_id: number
}