import { IBook, IPrintedBook, IEBook, BookType, Genre } from "../types/interfaces.js";
import { Log } from "../decorators/decorators.js";

//general properties for both printed and ebook
export abstract class BaseBook implements IBook {
  abstract type: BookType;

  constructor (public title: string, public author: string, public isbn: string, public publishDate: string, public genre: Genre) 
  {}

  calculateAge(): number {
    return new Date().getFullYear() - new Date(this.publishDate).getFullYear();
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

  abstract getExtraInfo(): string;
}

export class PrintedBook extends BaseBook implements IPrintedBook {
  type: BookType = "Printed";

  constructor(
    title: string,
    author: string,
    isbn: string,
    publishDate: string,
    genre: Genre,
    public pageCount: number
  ) {
    super(title, author, isbn, publishDate, genre);
  }

  getReadingTime(): string {
    return Math.ceil(this.pageCount / 30) + " hrs";
  } 
  getExtraInfo(): string {
    return `Reading Time: ${this.getReadingTime()}`;
  }
}

export class EBook extends BaseBook implements IEBook {
  type: BookType = "EBook";

  constructor(
    title: string,
    author: string,
    isbn: string,
    publishDate: string,
    genre: Genre,
    public fileSize: string
  ) {
    super(title, author, isbn, publishDate, genre);
  }

  getFileInfo(): string {
    return `${this.fileSize} MB`;
  }
  getExtraInfo(): string {
    return `File Size: ${this.getFileInfo()}`;
  }
}
