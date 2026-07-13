import { describe, it, expect } from "vitest";
import { PrintedBook } from "./books.js";

describe("Book age Calculations", () => {
    it("calculates age correctly based on the publish date", () => {
        const book = new PrintedBook("Test Book", "Author", "123", "2007-05-05", "Fiction", 300);
        const expectedAge = new Date().getFullYear() - 2007;
        expect(book.calculateAge()).toBe(expectedAge);
    });

    it("returns 0% discount for a recent aged book", () => {
        const currentYear = new Date().getFullYear();
        const book = new PrintedBook("New Book", "Author", "123", `${currentYear}-05-05`, "Fiction", 300);
        expect(book.getDiscount()).toBe(0);
    });

    it("returns a discount for an old book", () => {
        const book = new PrintedBook("Old Book", "Author", "123", "1900-05-05", "Fiction", 300);
        expect(book.getDiscount()).toBeGreaterThan(0);
    });
})