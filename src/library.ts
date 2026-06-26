import { IBook, ILibrary, SortOption } from "./interfaces.js";
import { getSortedBooks, filterItems } from "./generics.js";
import { Log, Validate } from "./decorators.js";

export class Library implements ILibrary {
  books: IBook[] = [];
  filteredBooks: IBook[] | null = null;

  @Log
  @Validate
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

  //called by class name only since static
  static validateForm(fieldIds: string[], errorIds: string[]): boolean {
    let isValid = true;
    for (let i = 0; i < fieldIds.length; i++) {
      const input = document.getElementById(fieldIds[i]) as HTMLInputElement;
      const error = document.getElementById(errorIds[i]) as HTMLElement;
      error.classList.add("hidden");
      input.classList.remove("invalid");
      if (input.value.trim() === "") {
        error.classList.remove("hidden");
        input.classList.add("invalid");
        isValid = false;
      }
    }
    return isValid;
  }
}
