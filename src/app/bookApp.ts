import { ILibrary, IBookFactory, IApiService, IFormService, IDOMBuilder, IBookCallbacks, SortOption } from "../types/interfaces.js";
import { Log } from "../decorators/decorators.js";
import { getElement } from "../utils/generics.js";

// SRP — BookApp ONLY coordinates between services
// Every method is 2-5 lines — it just delegates to the right service
// DIP — depends entirely on interfaces, not concrete classes
export class BookApp {
  private fieldIds: string[] = ["title", "author", "isbn", "publishDate", "genre"];
  private errorIds: string[] = ["titleError", "authorError", "isbnError", "publishDateError", "genreError"];
  private edit: number | null = null;

  constructor(
    private library: ILibrary,
    private factory: IBookFactory,
    private apiService: IApiService,
    private formService: IFormService,
    private domBuilder: IDOMBuilder
  ) {
    this.attachEvents();
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  private attachEvents(): void {
    getElement<HTMLInputElement>("isbn").addEventListener("input", (e) => {
      (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
    });

    const clickEvents: Record<string, () => void> = {
      submitBtn: this.submitBook,
      cancelBtn: this.cancelEdit,
      fetchBtn: this.fetchBookFromApi,
      addFetchedBtn: this.addFetchedBook,
      searchBtn: this.searchBooks,
      clearBtn: this.clearSearch,
      closeDetailBtn: this.closeDetails,
    };

    const changeEvents: Record<string, () => void> = {
      bookType: this.toggleExtraField,
      sortSelect: this.displayBooks,
    };

    Object.entries(clickEvents).forEach(([id, handler]) => {
      getElement<HTMLElement>(id).addEventListener("click", handler);
    });
    Object.entries(changeEvents).forEach(([id, handler]) => {
      getElement<HTMLElement>(id).addEventListener("change", handler);
    });
  }

  // ─── Form UI ─────────────────────────────────────────────────────────────

  toggleExtraField = (): void => {
    const bookType = getElement<HTMLSelectElement>("bookType").value;
    const extraLabel = getElement<HTMLLabelElement>("extraLabel");
    const extraField = getElement<HTMLInputElement>("extraField");
    const extraWrap = getElement<HTMLElement>("extraWrap");

    const config: Record<string, { label: string; placeholder: string }> = {
      Printed: { label: "Page Count:",     placeholder: "e.g. 350" },
      EBook:   { label: "File Size (MB):", placeholder: "e.g. 5"   },
    };

    if (config[bookType]) {
      extraLabel.textContent = config[bookType].label;
      extraField.placeholder = config[bookType].placeholder;
      extraWrap.classList.remove("hidden");
    } else {
      extraWrap.classList.add("hidden");
      extraField.value = "";
    }
  };

  private formCheck(): boolean {
    const fieldsValid = this.formService.validate(this.fieldIds, this.errorIds);
    const bookTypeValid = this.formService.validateBookType();
    if (!fieldsValid || !bookTypeValid) return false;
    const isbn = getElement<HTMLInputElement>("isbn").value.trim();
    if (this.edit === null && this.library.isbnExists(isbn)) {
      alert("ISBN already exists");
      return false;
    }
    return true;
  }

  // ─── CRUD — each method is 2-4 lines ─────────────────────────────────────

  @Log
  private addBook(): void {
    const newBook = this.factory.createBook(this.formService.getValues());
    this.library.addBook(newBook);
    this.domBuilder.showSuccess("Book added successfully!");
    this.formService.clearForm(this.fieldIds, ["bookType", "extraField"]);
    this.displayBooks();
  }

  editBook(index: number): void {
    this.formService.fillForm(this.library.books[index]);
    this.toggleExtraField();
    this.edit = index;
    this.domBuilder.setFormMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  @Log
  private updateBook(): void {
    this.library.updateBook(this.edit as number, this.factory.createBook(this.formService.getValues()));
    this.domBuilder.showSuccess("Book updated successfully!");
    this.cancelEdit();
    this.displayBooks();
  }

  deleteBook = (index: number): void => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    this.library.deleteBook(index);
    this.displayBooks();
  };

  submitBook = (): void => {
    if (!this.formCheck()) return;
    if (this.edit !== null) this.updateBook();
    else this.addBook();
  };

  cancelEdit = (): void => {
    this.edit = null;
    this.formService.clearForm(this.fieldIds, ["bookType", "extraField"]);
    this.domBuilder.setFormMode("add");
  };

  // ─── Display ─────────────────────────────────────────────────────────────

  showDetails(realIndex: number): void {
    this.domBuilder.renderDetail(this.library.books[realIndex]);
  }

  closeDetails = (): void => {
    getElement<HTMLElement>("detailModal").classList.add("hidden");
  };

  displayBooks = (): void => {
    const sortBy = getElement<HTMLSelectElement>("sortSelect").value as SortOption;
    const booksToShow = this.library.getSortedBooks(sortBy);
    const callbacks: IBookCallbacks = {
      onView:   (i) => { this.showDetails(i); },
      onEdit:   (i) => { this.editBook(i); },
      onDelete: (i) => { this.deleteBook(i); },
    };
    this.domBuilder.renderBookList(booksToShow, this.library, callbacks);
  };

  // ─── Search ──────────────────────────────────────────────────────────────

  searchBooks = (): void => {
    const term = getElement<HTMLInputElement>("searchInput").value.trim().toLowerCase();
    const status = getElement<HTMLElement>("searchStatus");
    if (term === "") { status.textContent = "Please type something to search."; return; }
    const results = this.library.search(term);
    status.textContent = results.length === 0 ? `No books found for "${term}".` : `Found ${results.length} book(s) for "${term}".`;
    this.displayBooks();
  };

  clearSearch = (): void => {
    this.library.clearSearch();
    getElement<HTMLInputElement>("searchInput").value = "";
    getElement<HTMLElement>("searchStatus").textContent = "";
    this.displayBooks();
  };

  // ─── API Fetch ───────────────────────────────────────────────────────────

  fetchBookFromApi = async (): Promise<void> => {
    const id = getElement<HTMLInputElement>("fetchId").value;
    this.domBuilder.showFetchLoading();
    try {
      const result = await this.apiService.fetchBook(id);
      if (!result) {
        this.domBuilder.showFetchError("Please enter a number between 1 and 100.");
        return;
      }
      if (this.library.isbnExists(result.isbn)) {
        this.domBuilder.showFetchError("This book already exists in your list.");
        return;
      }
      this.domBuilder.hideFetchLoading();
      this.domBuilder.showFetchPreview(result);
      // Store result on element for addFetchedBook to use
      getElement<HTMLElement>("fetchResult").dataset["json"] = JSON.stringify(result);
    } catch (error) {
      this.domBuilder.showFetchError(`Failed to fetch: ${(error as Error).message}`);
    }
  };

  addFetchedBook = (): void => {
    const json = getElement<HTMLElement>("fetchResult").dataset["json"] ?? "{}";
    const result = JSON.parse(json);
    this.library.addBook(this.factory.createFromFetch(result));
    getElement<HTMLElement>("fetchResult").classList.add("hidden");
    getElement<HTMLInputElement>("fetchId").value = "";
    this.domBuilder.showSuccess(`${result.bookType} added to your list!`);
    this.displayBooks();
  };
}