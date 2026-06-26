var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { getSortedBooks, filterItems } from "./generics.js";
import { Log, Validate } from "./decorators.js";
export class Library {
    books = [];
    filteredBooks = null;
    addBook(book) {
        this.books.push(book);
        this.filteredBooks = null;
    }
    updateBook(index, book) {
        this.books[index] = book;
        this.filteredBooks = null;
    }
    deleteBook(index) {
        this.books.splice(index, 1);
        this.filteredBooks = null;
    }
    isbnExists(isbn) {
        return this.books.some((book) => book.isbn === isbn);
    }
    search(term) {
        const lower = term.toLowerCase();
        this.filteredBooks = filterItems(this.books, (book) => book.title.toLowerCase().includes(lower) || book.author.toLowerCase().includes(lower));
        return this.filteredBooks;
    }
    clearSearch() {
        this.filteredBooks = null;
    }
    getSortedBooks(sortBy) {
        const list = this.filteredBooks !== null ? this.filteredBooks : this.books;
        return getSortedBooks(list, sortBy);
    }
    static validateForm(fieldIds, errorIds) {
        let isValid = true;
        for (let i = 0; i < fieldIds.length; i++) {
            const input = document.getElementById(fieldIds[i]);
            const error = document.getElementById(errorIds[i]);
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
__decorate([
    Log,
    Validate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Library.prototype, "addBook", null);
__decorate([
    Log,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], Library.prototype, "updateBook", null);
__decorate([
    Log,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], Library.prototype, "deleteBook", null);
//# sourceMappingURL=library.js.map