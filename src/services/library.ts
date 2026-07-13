import { IBook, ILibrary, SortOption } from "../types/interfaces.js";
import { getSortedBooks, filterItems } from "../utils/generics.js";
import { Log, ValidateBook } from "../decorators/decorators.js";

export class Library implements ILibrary {
  books: IBook[] = [];
  filteredBooks: IBook[] | null = null;

  @Log
  @ValidateBook
  addBook(book: IBook): void {
    this.books.push(book);
    this.filteredBooks = null;
  }

  @Log
  updateBook(index: number, book: IBook): void {
    this.books[index] = book;
    this.filteredBooks = null;
  }

  @Log
  deleteBook(index: number): void {
    this.books.splice(index, 1);
    this.filteredBooks = null;
  }

  isbnExists(isbn: string): boolean {
    return this.books.some((book) => book.isbn === isbn);
  }

  search(term: string): IBook[] {
    const lower = term.toLowerCase();
    //generics is used filterItems 
    this.filteredBooks = filterItems(this.books,(book) =>
        book.title.toLowerCase().includes(lower) || book.author.toLowerCase().includes(lower)
    );
    return this.filteredBooks;
  }

  clearSearch(): void {
    this.filteredBooks = null;
  }

  //generics is used here also 
  getSortedBooks(sortBy: SortOption): IBook[] {
    const list = this.filteredBooks !== null ? this.filteredBooks : this.books;
    return getSortedBooks(list, sortBy);
  }
}
