import { IBook, IPrintedBook, IEBook, BookType } from "./interfaces.js";
import { Log } from "./decorators.js";

//general properties for both printed and ebook
export abstract class BaseBook implements IBook {
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  genre: string;
  abstract type: BookType;

  constructor (title: string, author: string, isbn: string, publishDate: string, genre: string) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.publishDate = publishDate;
    this.genre = genre;
  }

  calculateAge(): number {
    return 2026 - new Date(this.publishDate).getFullYear();
  }

  getEra(): string {
    const age = this.calculateAge();
    if (age <= 26) return "Contemporary Classics";
    else if (age <= 126) return "Modernism";
    else if (age <= 189) return "Victorian";
    else if (age <= 228) return "Romanticism";
    else if (age <= 426) return "The Enlightenment";
    else if (age <= 526) return "The Renaissance";
    else if (age <= 1526) return "Medieval";
    else return "Classical";
  }

  getDiscount(): number {
    const age = this.calculateAge();
    if (age > 100) return 30;
    else if (age > 50) return 20;
    else if (age > 25) return 10;
    else return 0;
  }

  @Log
  getSummary(): string {
    return `${this.title} by ${this.author} (${this.publishDate})`;
  }
}

export class PrintedBook extends BaseBook implements IPrintedBook {
  type: BookType = "Printed";
  pageCount: number;

  constructor(
    title: string,
    author: string,
    isbn: string,
    publishDate: string,
    genre: string,
    pageCount: number
  ) {
    super(title, author, isbn, publishDate, genre);
    this.pageCount = pageCount;
  }

  getReadingTime(): string {
    return Math.ceil(this.pageCount / 30) + " hrs";
  }
}

export class EBook extends BaseBook implements IEBook {
  type: BookType = "EBook";
  fileSize: string;

  constructor(
    title: string,
    author: string,
    isbn: string,
    publishDate: string,
    genre: string,
    fileSize: string
  ) {
    super(title, author, isbn, publishDate, genre);
    this.fileSize = fileSize;
  }

  getFileInfo(): string {
    return `${this.fileSize} MB`;
  }
}
