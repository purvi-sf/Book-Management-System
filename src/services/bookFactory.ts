import { IBook, IBookFactory, IFormValues, IFetchResult } from "../types/interfaces.js";
import { PrintedBook, EBook } from "../models/books.js";
import { toSafeGenre } from "../utils/generics.js";

// SRP — BookFactory only creates book objects
// OCP — to add AudioBook, add class and one line here. Nothing else changes.
export class BookFactory implements IBookFactory {
  createBook(values: IFormValues): IBook {
    const { title, author, isbn, publishDate, genre, bookType, extra } = values;
    const safeGenre = toSafeGenre(genre);
    if (bookType === "EBook") {
      return new EBook(title, author, isbn, publishDate, safeGenre, extra || "0");
    }
    return new PrintedBook(title, author, isbn, publishDate, safeGenre, Number(extra) || 0);
  }

  // Creates a book from a fetched API result
  createFromFetch(result: IFetchResult): IBook {
    const safeGenre = toSafeGenre(result.genre);
    if (result.bookType === "Printed") {
      return new PrintedBook(result.title, result.author, result.isbn, result.publishDate, safeGenre, result.pageCount);
    }
    return new EBook(result.title, result.author, result.isbn, result.publishDate, safeGenre, result.fileSize);
  }
}