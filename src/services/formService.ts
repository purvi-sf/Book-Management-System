import { IFormValues, IFormService, IBook, BookType, Genre } from "../types/interfaces.js";
import { PrintedBook, EBook } from "../models/books.js";
import { getElement } from "../utils/generics.js";

export class FormService implements IFormService {
  private getValue(id: string): string {
    return getElement<HTMLInputElement>(id).value.trim();
  }

  getValues(): IFormValues {
    return {
      title: this.getValue("title"),
      author: this.getValue("author"),
      isbn: this.getValue("isbn"),
      publishDate: getElement<HTMLInputElement>("publishDate").value,
      genre: getElement<HTMLSelectElement>("genre").value as Genre | "",
      bookType: getElement<HTMLSelectElement>("bookType").value as BookType | "",
      extra: this.getValue("extraField"),
    };
  }

  // Fills the form with an existing book's data — used in editBook
  fillForm(book: IBook): void {
    const fields: Record<string, string> = {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishDate: book.publishDate,
      genre: book.genre,
    };
    Object.entries(fields).forEach(([id, value]) => {
      getElement<HTMLInputElement>(id).value = value;
    });
    getElement<HTMLSelectElement>("bookType").value = book.type;

    // Fill extra field based on book type
    const extraField = getElement<HTMLInputElement>("extraField");
    if (book instanceof PrintedBook) {
      extraField.value = String(book.pageCount);
    } else if (book instanceof EBook) {
      extraField.value = book.fileSize;
    }
  }

  // Clears all form fields 
  clearForm(fieldIds: string[], extraIds: string[]): void {
    [...fieldIds, ...extraIds].forEach((id) => {
      getElement<HTMLInputElement>(id).value = "";
    });
    getElement<HTMLElement>("extraWrap").classList.add("hidden");
    getElement<HTMLElement>("bookTypeError").classList.add("hidden");
    getElement<HTMLSelectElement>("bookType").classList.remove("invalid");
  }

  validate(fieldIds: string[], errorIds: string[]): boolean {
    let isValid = true;
    for (let i = 0; i < fieldIds.length; i++) {
      const input = getElement<HTMLInputElement>(fieldIds[i]);
      const error = getElement<HTMLElement>(errorIds[i]);
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

  validateBookType(): boolean {
    const select = getElement<HTMLSelectElement>("bookType");
    const error = getElement<HTMLElement>("bookTypeError");
    const valid = select.value !== "";
    error.classList.toggle("hidden", valid);
    select.classList.toggle("invalid", !valid);
    return valid;
  }
}