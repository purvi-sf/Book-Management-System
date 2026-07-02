import { Library } from "./library.js";
import { PrintedBook, EBook } from "./books.js";
import { IBook, IApiBook, IFormValues, SortOption, BookType, Genre} from "./interfaces.js";
import { Log } from "./decorators.js";
import { getElement, toSafeGenre } from "./generics.js";

export class BookApp {
  private fieldIds: string[] = ["title", "author", "isbn", "publishDate", "genre"];
  private errorIds: string[] = ["titleError", "authorError", "isbnError", "publishDateError", "genreError"];
  private edit: number | null = null;

  constructor(private library: Library) {
    this.attachEvents();
  }

  private attachEvents(): void {
     getElement<HTMLInputElement>("isbn").addEventListener("input", (e) => { //"input" fires everytime the input value changes in form
      (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, ""); //replaces every non digit with empty string
    });

    const clickEvents: Record<string, () => void> = { //Record<a,b> where a is key and b is value so here key is string and value is function with no return type
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

    Object.entries(clickEvents).forEach(([id, handler]) => { //converting object to array of pairs 
      getElement<HTMLElement>(id).addEventListener("click", handler); //for each id fires the click button
    });

    Object.entries(changeEvents).forEach(([id, handler]) => {
      getElement<HTMLElement>(id).addEventListener("change", handler);
    });
  }

  private getFormValues(): IFormValues {
    const getValue = (id: string): string => getElement<HTMLInputElement>(id).value.trim();
    return {
      title: getValue("title"),
      author: getValue("author"),
      isbn: getValue("isbn"),
      publishDate: getElement<HTMLInputElement>("publishDate").value,
      genre: getElement<HTMLSelectElement>("genre").value as Genre | "",
      bookType: getElement<HTMLSelectElement>("bookType").value as BookType | "",
      extra: getValue("extraField"),
    };
  }

  //for file size and printed page 
  toggleExtraField = (): void => {
    const bookType = getElement<HTMLSelectElement>("bookType").value;
    const extraLabel = getElement<HTMLLabelElement>("extraLabel");
    const extraField = getElement<HTMLInputElement>("extraField");
    const extraWrap = getElement<HTMLElement>("extraWrap");

    const config: Record<string, { label: string; placeholder: string }> = {
      Printed: { label: "Page Count:", placeholder: "e.g. 350" },
      EBook: { label: "File Size (MB):", placeholder: "e.g. 5" },
    };
 
    if (config[bookType]) {
      extraLabel.textContent = config[bookType].label;
      extraField.placeholder = config[bookType].placeholder;
      extraWrap.classList.remove("hidden");
    } 
    else {
      extraWrap.classList.add("hidden");
      extraField.value = "";
    }
  }

  private validateBookType(): boolean {
    const bookTypeSelect = getElement<HTMLSelectElement>("bookType");
    const bookTypeError = getElement<HTMLElement>("bookTypeError");
    const valid = bookTypeSelect.value !== "";
    bookTypeError.classList.toggle("hidden", valid);
    bookTypeSelect.classList.toggle("invalid", !valid);
    return valid;
  }

  private formCheck(): boolean {
    const fieldsValid = Library.validateForm(this.fieldIds, this.errorIds);
    const bookTypeValid = this.validateBookType();
    if (!fieldsValid || !bookTypeValid) return false;
    const isbn = getElement<HTMLInputElement>("isbn").value.trim();
    if (this.edit === null && this.library.isbnExists(isbn)) {
      alert("ISBN already exists");
      return false;
    }
    return true;
  }

  private makeBook(values: IFormValues): IBook {
    const { title, author, isbn, publishDate, genre, bookType, extra } = values;
    const safeGenre = toSafeGenre(genre);
    if (bookType === "EBook") return new EBook(title, author, isbn, publishDate, safeGenre, extra || "0");
    return new PrintedBook(title, author, isbn, publishDate, safeGenre, Number(extra) || 0);
  }

  @Log
  private addBook(): void {
    const values  = this.getFormValues();
    const newBook = this.makeBook(values);
    this.library.addBook(newBook);
    this.showSuccess("Book added successfully!");
    this.clearForm();
    this.displayBooks();
  }

  editBook(index: number): void {
    const book = this.library.books[index];
    const bookRecord = book as unknown as Record<string, string>;
 
    for (const id of this.fieldIds) {
      getElement<HTMLInputElement>(id).value = bookRecord[id] ?? "";
    }
 
    getElement<HTMLSelectElement>("bookType").value = book.type;
    this.toggleExtraField();
 
    const extraField = getElement<HTMLInputElement>("extraField");
    if (book instanceof PrintedBook) 
        extraField.value = String(book.pageCount);
    else if (book instanceof EBook) 
        extraField.value = book.fileSize;
    
 
    this.edit = index;
    getElement<HTMLElement>("formHeading").textContent = "Edit Book";
    getElement<HTMLElement>("submitBtn").textContent = "Update Book";
    getElement<HTMLElement>("cancelBtn").classList.remove("hidden");
    getElement<HTMLElement>("successMsg").classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  @Log
  private updateBook(): void {
    const values = this.getFormValues();
    const updatedBook = this.makeBook(values);
    this.library.updateBook(this.edit as number, updatedBook);
    this.showSuccess("Book updated successfully!");
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
  }

  cancelEdit = (): void => {
    this.edit = null;
    this.clearForm();
    getElement<HTMLElement>("formHeading").textContent = "Add a New Book";
    getElement<HTMLElement>("submitBtn").textContent = "Add Book";
    getElement<HTMLElement>("cancelBtn").classList.add("hidden");
  }

  private clearForm(): void {
    const toClear = [...this.fieldIds, "bookType", "extraField"];
    toClear.forEach(id => (document.getElementById(id) as HTMLInputElement).value = "");
    getElement<HTMLElement>("extraWrap").classList.add("hidden");
    getElement<HTMLElement>("bookTypeError").classList.add("hidden");
    getElement<HTMLSelectElement>("bookType").classList.remove("invalid");
  }

  private showSuccess(message: string): void {
    const msg = getElement<HTMLElement>("successMsg");
    msg.textContent = message;
    msg.classList.remove("hidden");
  }

  private createRow(labelText: string, value: string): HTMLElement {
    const p = document.createElement("p");
    p.className = "text-[var(--text-light)] text-sm mb-2";
    const span = document.createElement("span");
    span.className = "text-[var(--blue-light)] font-bold";
    span.textContent = labelText + ": ";
    p.appendChild(span);
    p.appendChild(document.createTextNode(value));
    return p;
  }

  showDetails(realIndex: number): void {
    const book = this.library.books[realIndex];
    getElement<HTMLElement>("detailTitle").textContent = book.title;

    const detailBody = getElement<HTMLElement>("detailBody");
    detailBody.innerHTML = "";

    const rows: [string, string][] = [
      ["Summary", book.getSummary()],
      ["Author", book.author],
      ["ISBN", book.isbn],
      ["Published", book.publishDate],
      ["Age", book.calculateAge() + " years"],
      ["Genre", book.genre],
      ["Era", book.getEra()],
      ["Discount", book.getDiscount() + "%"],
      ["Type", book.type],
      ["Info", book.getExtraInfo()]
    ];

    rows.forEach(([label, value]) => {
      detailBody.appendChild(this.createRow(label, value));
    });
    getElement<HTMLElement>("detailModal").classList.remove("hidden");
  }

  closeDetails = (): void => {
    getElement<HTMLElement>("detailModal").classList.add("hidden");
  }

  private createTd(text: string): HTMLElement {
    const td = document.createElement("td");
    td.className = "p-2.5 text-[var(--text-light)] text-xs";
    td.textContent = text;
    return td;
  }

  private createBtn(text: string, bg: string, hoverBg: string, onClick: () => void): HTMLElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `border-none rounded cursor-pointer text-xs text-white px-2.5 py-1 mr-1 ${bg} ${hoverBg}`;
    btn.addEventListener("click", onClick);
    return btn;
  }

  private createCardRow(labelText: string, value: string): HTMLElement {
    const row = document.createElement("div");
    row.className = "flex justify-between py-2 border-b border-[var(--border)]";
    const label = document.createElement("span");
    label.className = "text-[var(--blue-light)] text-xs font-bold";
    label.textContent = labelText;
    const val = document.createElement("span");
    val.className = "text-[var(--text-light)] text-xs";
    val.textContent = value;
    row.appendChild(label);
    row.appendChild(val);
    return row;
  }

  private createDiscountBadge(discount: number): HTMLElement {
    const span = document.createElement("span");
    span.className = "bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded whitespace-nowrap";
    span.textContent = discount + "% off";
    return span;
  }

  private createCardBtn(text: string, bg: string, onClick: () => void): HTMLElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `flex-1 py-2 rounded text-white text-xs cursor-pointer border-none ${bg}`;
    btn.addEventListener("click", onClick);
    return btn;
  }

  displayBooks = (): void => {
    const tableBody = getElement<HTMLElement>("bookTableBody");
    const cardBox = getElement<HTMLElement>("bookCards");
    const noBooks = getElement<HTMLElement>("noBooks");
    const sortBy = getElement<HTMLSelectElement>("sortSelect").value as SortOption;
    const booksToShow = this.library.getSortedBooks(sortBy);

    if (booksToShow.length === 0) {
      cardBox.classList.add("hidden");
      noBooks.classList.remove("hidden");
      tableBody.innerHTML = "";
      cardBox.innerHTML = "";
      return;
    }

    noBooks.classList.add("hidden");
    cardBox.classList.remove("hidden");
    tableBody.innerHTML = "";
    cardBox.innerHTML = "";

    for (let i = 0; i < booksToShow.length; i++) {
      const book = booksToShow[i];
      const age = book.calculateAge();
      const category = book.getEra();
      const discount = book.getDiscount();
      const realIndex = this.library.books.indexOf(book);

      const bookData: [string, string][] = [
        ["Author", book.author],
        ["ISBN", book.isbn],
        ["Published", book.publishDate],
        ["Age", age + " yrs"],
        ["Genre", book.genre],
        ["Era", category],
        ["Type", book.type],
      ];

      const tr = document.createElement("tr");
      tr.className = "border-b border-[var(--border)] hover:bg-[var(--bg-hover)]";
 
      [String(i + 1), book.title, ...bookData.map(([, value]) => value)].forEach((cell) => {
        tr.appendChild(this.createTd(cell));
      });
 
      const discountTd = document.createElement("td");
      discountTd.className = "p-2.5 text-[var(--text-light)] text-xs";

      if (discount > 0)
        discountTd.appendChild(this.createDiscountBadge(discount));
      else 
        discountTd.textContent = "—";
      

      tr.appendChild(discountTd);

      const actionTd = document.createElement("td");
      actionTd.className = "p-2.5 whitespace-nowrap";
      actionTd.appendChild(this.createBtn("View", "bg-[var(--grey)]", "hover:bg-[var(--grey-dark)]", () => this.showDetails(realIndex)));
      actionTd.appendChild(this.createBtn("Edit", "bg-[var(--blue-dark)]", "hover:bg-[var(--blue-main)]", () => this.editBook(realIndex)));
      actionTd.appendChild(this.createBtn("Delete", "bg-[var(--red-dark)]", "hover:bg-[var(--red)]", () => this.deleteBook(realIndex)));
      tr.appendChild(actionTd);
      tableBody.appendChild(tr);

      const card = document.createElement("div");
      card.className = "bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4";
 
      const cardTitle = document.createElement("h3");
      cardTitle.className = "text-[var(--blue-light)] text-base font-bold mb-3 pb-2 border-b-2 border-[var(--blue-main)]";
      cardTitle.textContent = book.title;
      card.appendChild(cardTitle);
 
      bookData.slice(1).forEach(([label, value]) => {
        card.appendChild(this.createCardRow(label, value));
      });
 
      const discountRow = document.createElement("div");
      discountRow.className = "flex justify-between py-2 mb-3";
      const discountLabel = document.createElement("span");
      discountLabel.className = "text-[var(--blue-light)] text-xs font-bold";
      discountLabel.textContent = "Discount";
      const discountVal = document.createElement("span");
      discountVal.className = "text-[var(--text-light)] text-xs";

      if (discount > 0) 
        discountVal.appendChild(this.createDiscountBadge(discount));
      else 
        discountVal.textContent = "—";
      
      discountRow.appendChild(discountLabel);
      discountRow.appendChild(discountVal);
      card.appendChild(discountRow);

      const cardActions = document.createElement("div");
      cardActions.className = "flex gap-2";
 
      cardActions.appendChild(this.createCardBtn("View", "bg-[var(--grey)]", () => { this.showDetails(realIndex); }));
      cardActions.appendChild(this.createCardBtn("Edit", "bg-[var(--blue-dark)]", () => { this.editBook(realIndex); }));
      cardActions.appendChild(this.createCardBtn("Delete", "bg-[var(--red-dark)]", () => { this.deleteBook(realIndex); }));
      card.appendChild(cardActions);
      cardBox.appendChild(card);
    }
  }

  searchBooks = (): void => {
    const searchTerm = getElement<HTMLInputElement>("searchInput").value.trim().toLowerCase();
    const searchStatus = getElement<HTMLElement>("searchStatus");
    if (searchTerm === "") {
      searchStatus.textContent = "Please type something to search.";
      return;
    }
    const results = this.library.search(searchTerm);
    searchStatus.textContent = results.length === 0 ? `No books found for "${searchTerm}".` : `Found ${results.length} book(s) for "${searchTerm}".`;
    this.displayBooks();
  }

  clearSearch = (): void => {
    this.library.clearSearch();
    getElement<HTMLInputElement>("searchInput").value = "";
    getElement<HTMLElement>("searchStatus").textContent = "";
    this.displayBooks();
  }

  private showFetchError(fetchError: HTMLElement, loadingMsg: HTMLElement, message: string): void {
    loadingMsg.classList.add("hidden");
    fetchError.textContent = message;
    fetchError.classList.remove("hidden");
  }

  fetchBookFromApi = async (): Promise<void> => {
    const id = getElement<HTMLInputElement>("fetchId").value;
    const loadingMsg = getElement<HTMLElement>("loadingMsg");
    const fetchError = getElement<HTMLElement>("fetchError");
    const fetchResult = getElement<HTMLElement>("fetchResult");
 
    if (id === "" || Number(id) < 1 || Number(id) > 100) {
      this.showFetchError(fetchError, loadingMsg, "Please enter a number between 1 and 100.");
      return;
    }
 
    fetchError.classList.add("hidden");
    fetchResult.classList.add("hidden");
    loadingMsg.classList.remove("hidden");
 
    try {
      const response = await fetch("https://6a33db358248ee962fa48cc7.mockapi.io/books/books");
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const allBooks: IApiBook[] = await response.json();
      const data = allBooks[Number(id) - 1];
      if (!data) throw new Error("Book not found");
 
      if (this.library.isbnExists(data.isbn)) {
        this.showFetchError(fetchError, loadingMsg, "This book already exists in your list.");
        return;
      }
 
      loadingMsg.classList.add("hidden");
      fetchResult.classList.remove("hidden");
      const fetchedType = data.bookType ?? "EBook";
      getElement<HTMLElement>("fetchTitle").textContent = data.title;
      getElement<HTMLElement>("fetchBody").textContent = `Author: ${data.author} | Genre: ${data.genre} | Published: ${data.publish_date} | Type: ${fetchedType}`;
 
      this.fieldIds.forEach((field) => {
        const apiField = field === "publishDate" ? "publish_date" : field;
        fetchResult.dataset[field] = (data as unknown as Record<string, string>)[apiField] ?? "";
      });
      fetchResult.dataset["bookType"] = fetchedType;
      fetchResult.dataset["fileSize"] = data.fileSize ?? "0";
      fetchResult.dataset["pageCount"] = String(data.pageCount ?? 0);
 
    } catch (error) {
      this.showFetchError(fetchError, loadingMsg, `Failed to fetch: ${(error as Error).message}`);
    }
  }

  addFetchedBook = (): void => {
    const fetchResult = getElement<HTMLElement>("fetchResult");
    const values = this.fieldIds.map((field) => fetchResult.dataset[field] ?? "");
    const bookType = (fetchResult.dataset["bookType"] ?? "EBook") as BookType;
    const fileSize = fetchResult.dataset["fileSize"] ?? "0";
    const pageCount = Number(fetchResult.dataset["pageCount"] ?? 0);
    const safeGenre = toSafeGenre(values[4]);
 
    const newBook: IBook = bookType === "Printed"
      ? new PrintedBook(values[0], values[1], values[2], values[3], safeGenre, pageCount)
      : new EBook(values[0], values[1], values[2], values[3], safeGenre, fileSize);
 
    this.library.addBook(newBook);
    fetchResult.classList.add("hidden");
    getElement<HTMLInputElement>("fetchId").value = "";
    this.showSuccess(`${bookType} added to your list!`);
    this.displayBooks();
  };
}