var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Log } from "./decorators.js";
export class BaseBook {
    title;
    author;
    isbn;
    publishDate;
    genre;
    constructor(title, author, isbn, publishDate, genre) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.publishDate = publishDate;
        this.genre = genre;
    }
    calculateAge() {
        return 2026 - new Date(this.publishDate).getFullYear();
    }
    getEra() {
        const age = this.calculateAge();
        if (age <= 26)
            return "Contemporary Classics";
        else if (age <= 126)
            return "Modernism";
        else if (age <= 189)
            return "Victorian";
        else if (age <= 228)
            return "Romanticism";
        else if (age <= 426)
            return "The Enlightenment";
        else if (age <= 526)
            return "The Renaissance";
        else if (age <= 1526)
            return "Medieval";
        else
            return "Classical";
    }
    getDiscount() {
        const age = this.calculateAge();
        if (age > 100)
            return 30;
        if (age > 50)
            return 20;
        if (age > 25)
            return 10;
        return 0;
    }
    getSummary() {
        return `${this.title} by ${this.author} (${this.publishDate})`;
    }
}
__decorate([
    Log,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], BaseBook.prototype, "getSummary", null);
export class PrintedBook extends BaseBook {
    type = "Printed";
    pageCount;
    constructor(title, author, isbn, publishDate, genre, pageCount) {
        super(title, author, isbn, publishDate, genre);
        this.pageCount = pageCount;
    }
    getReadingTime() {
        return Math.ceil(this.pageCount / 30) + " hrs";
    }
}
export class EBook extends BaseBook {
    type = "EBook";
    fileSize;
    constructor(title, author, isbn, publishDate, genre, fileSize) {
        super(title, author, isbn, publishDate, genre);
        this.fileSize = fileSize;
    }
    getFileInfo() {
        return `${this.fileSize} MB`;
    }
}
//# sourceMappingURL=books.js.map