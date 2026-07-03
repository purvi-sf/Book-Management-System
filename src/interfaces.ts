//type is the keyword which creates a named type in ts
export type BookType = "Printed" | "EBook";
export type SortOption = "none" | "title" | "author" | "age_asc" | "age_desc";
export type Genre = "Fiction" | "Non-Fiction" | "Fantasy" | "Science Fiction" | "Mystery" | "Thriller" | "Romance" | "Horror" | "History" | "Science" | "Biography" | "Other";

//for a general book, all these parameters are common
export interface IBook {
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  genre: Genre;
  type: BookType;
  calculateAge(): number;
  getEra(): string;
  getDiscount(): number;
  getSummary(): string;
  getExtraInfo(): string;
}

export interface IPrintedBook extends IBook {
  pageCount: number;
  getReadingTime(): string;
}

export interface IEBook extends IBook {
  fileSize: string;
  getFileInfo(): string;
}

//all the functions performed on a book
export interface ILibrary {
  books: IBook[];
  filteredBooks: IBook[] | null; //for searching books
  addBook(book: IBook): void;
  updateBook(index: number, book: IBook): void;
  deleteBook(index: number): void;
  isbnExists(isbn: string): boolean;
  search(term: string): IBook[];
  clearSearch(): void;
  getSortedBooks(sortBy: SortOption): IBook[];
}

//details of book from api
export interface IApiBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publish_date: string;
  genre: string;
  bookType: BookType;
  fileSize: string;
  pageCount: number;
}

//describes object returned by getFormValues()
export interface IFormValues {
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  genre: Genre | "";
  bookType: BookType | "";
  extra: string; //dynamic data field for file size and page count
}