import { describe, it, expect } from "vitest";
import { BookFactory } from "./bookFactory.js";
import { PrintedBook, EBook } from "../models/books.js";
import { IFormValues } from "../types/interfaces.js";

describe("BookFactory", () => {
  const factory = new BookFactory();

  it("creates a PrintedBook when bookType is Printed", () => {
    const values: IFormValues = {
      title: "Harry Potter",
      author: "JK Rowling",
      isbn: "123",
      publishDate: "2007-05-05",
      genre: "Fiction",
      bookType: "Printed",
      extra: "412",
    };
    const book = factory.createBook(values);
    expect(book).toBeInstanceOf(PrintedBook);
  });

  it("creates an EBook when bookType is EBook", () => {
    const values: IFormValues = {
      title: "Harry Potter",
      author: "JK Rowling",
      isbn: "123",
      publishDate: "2007-05-05",
      genre: "Fiction",
      bookType: "EBook",
      extra: "10",
    };
    const book = factory.createBook(values);
    expect(book).toBeInstanceOf(EBook);
  });
});