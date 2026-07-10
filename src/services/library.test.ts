import { describe, it, expect, beforeEach } from "vitest";
import { Library } from "./library.js";
import { PrintedBook } from "../models/books.js";

describe("Library", () => {
  let library: Library;

  beforeEach(() => {
    library = new Library();
  });

  it("adds a book", () => {
    library.addBook(new PrintedBook("Harry Potter", "JK Rowling", "1", "2007-05-05", "Fiction", 400));
    expect(library.books.length).toBe(1);
  });

  it("deletes a book", () => {
    library.addBook(new PrintedBook("Harry Potter", "JK Rowling", "1", "2007-05-05", "Fiction", 400));
    library.deleteBook(0);
    expect(library.books.length).toBe(0);
  });

  it("finds a book by search term", () => {
    library.addBook(new PrintedBook("Harry Potter", "JK Rowling", "1", "2007-05-05", "Fiction", 400));
    const results = library.search("Harry");
    expect(results.length).toBe(1);
  });
});