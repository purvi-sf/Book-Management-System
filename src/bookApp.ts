import { Library } from "./library.js";
import { PrintedBook, EBook } from "./books.js";
import { IBook, IApiBook, IFormValues, SortOption, BookType } from "./interfaces.js";
import { Log } from "./decorators.js";

export class BookApp {
  private library: Library;
  private fieldIds: string[] = ["title", "author", "isbn", "publishDate", "genre"];
  private errorIds: string[] = ["titleError", "authorError", "isbnError", "publishDateError", "genreError"];
  private edit: number | null = null;

  constructor(library: Library) {
    this.library = library;
    this.attachEvents();
  }

  private attachEvents(): void {
    const isbn = document.getElementById("isbn") as HTMLInputElement; //this is used to let TS know that .value exists
    isbn.addEventListener("input", (e) => { //"input" fires everytime the input value changes in form
      (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, ""); //replaces every non digit with null
    });

    const clickEvents: Record<string, () => void> = { //Record<a,b> where a is key and b is value so here key is string and value is function with no return type
      submitBtn: () => this.submitBook(), //arrow function used to preserve this context
      cancelBtn: () => this.cancelEdit(),
      fetchBtn: () => this.fetchBookFromApi(),
      addFetchedBtn: () => this.addFetchedBook(),
      searchBtn: () => this.searchBooks(),
      clearBtn: () => this.clearSearch(),
      closeDetailBtn: () => this.closeDetails(),
    };

    const changeEvents: Record<string, () => void> = { 
      bookType: () => this.toggleExtraField(),
      sortSelect: () => this.displayBooks(),
    };

    Object.entries(clickEvents).forEach(([id, handler]) => { //converting object to array of pairs 
      document.getElementById(id)!.addEventListener("click", handler); //for each id fires the click button
    });

    Object.entries(changeEvents).forEach(([id, handler]) => {
      document.getElementById(id)!.addEventListener("change", handler);
    });
  }

  private getFormValues(): IFormValues {
    return {
      title: (document.getElementById("title") as HTMLInputElement).value.trim(),
      author: (document.getElementById("author") as HTMLInputElement).value.trim(),
      isbn: (document.getElementById("isbn") as HTMLInputElement).value.trim(),
      publishDate: (document.getElementById("publishDate") as HTMLInputElement).value,
      genre: (document.getElementById("genre") as HTMLSelectElement).value.trim(),
      bookType: (document.getElementById("bookType") as HTMLSelectElement).value as BookType | "",
      extra: (document.getElementById("extraField") as HTMLInputElement).value.trim(),
    };
  }

  //for file size and printed page 
  toggleExtraField(): void {
    const bookType = (document.getElementById("bookType") as HTMLSelectElement).value;
    const extraLabel = document.getElementById("extraLabel") as HTMLLabelElement;
    const extraField = document.getElementById("extraField") as HTMLInputElement;
    const extraWrap = document.getElementById("extraWrap") as HTMLElement;
    if (bookType === "Printed") {
      extraLabel.textContent = "Page Count:";
      extraField.placeholder = "e.g. 350";
      extraWrap.classList.remove("hidden");
    } else if (bookType === "EBook") {
      extraLabel.textContent = "File Size (MB):";
      extraField.placeholder = "e.g. 5";
      extraWrap.classList.remove("hidden");
    } else {
      extraWrap.classList.add("hidden");
      extraField.value = "";
    }
  }

  private formCheck(): boolean {
    const isValid = Library.validateForm(this.fieldIds, this.errorIds);
    if (!isValid) return false;
    const isbn = (document.getElementById("isbn") as HTMLInputElement).value.trim();
    if (this.edit === null && this.library.isbnExists(isbn)) { //duplicate isbn check
      alert("ISBN already exists"); 
      return false;
    }
    return true;
  }

  private makeBook(values: IFormValues): IBook {
    const { title, author, isbn, publishDate, genre, bookType, extra } = values;
    if (bookType === "EBook") return new EBook(title, author, isbn, publishDate, genre, extra || "0");
    return new PrintedBook(title, author, isbn, publishDate, genre, Number(extra) || 0);
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
    for (let i = 0; i < this.fieldIds.length; i++) 
      (document.getElementById(this.fieldIds[i]) as HTMLInputElement).value = (book as any)[this.fieldIds[i]];
    (document.getElementById("bookType") as HTMLSelectElement).value = book.type;
    this.toggleExtraField();
    if (book.type === "Printed") 
      (document.getElementById("extraField") as HTMLInputElement).value = String((book as PrintedBook).pageCount);
    else if (book.type === "EBook")
      (document.getElementById("extraField") as HTMLInputElement).value = (book as EBook).fileSize;
    
    this.edit = index;
    document.getElementById("formHeading")!.textContent = "Edit Book";
    document.getElementById("submitBtn")!.textContent   = "Update Book";
    document.getElementById("cancelBtn")!.classList.remove("hidden");
    document.getElementById("successMsg")!.classList.add("hidden");
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

  deleteBook(index: number): void {
    if (!confirm("Are you sure you want to delete this book?")) return;
    this.library.deleteBook(index);
    this.displayBooks();
  }

  submitBook(): void {
    if (!this.formCheck()) return;
    if (this.edit !== null) this.updateBook();
    else this.addBook();
  }

  cancelEdit(): void {
    this.edit = null;
    this.clearForm();
    document.getElementById("formHeading")!.textContent = "Add a New Book";
    document.getElementById("submitBtn")!.textContent   = "Add Book";
    document.getElementById("cancelBtn")!.classList.add("hidden");
  }

  private clearForm(): void {
    const toClear = [...this.fieldIds, "bookType", "extraField"];
    toClear.forEach(id => (document.getElementById(id) as HTMLInputElement).value = "");
    document.getElementById("extraWrap")!.classList.add("hidden");
  }

  private showSuccess(message: string): void {
    const msg = document.getElementById("successMsg") as HTMLElement;
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
    const age = book.calculateAge();
    const era = book.getEra();
    const discount = book.getDiscount();
    const summary = book.getSummary();

    document.getElementById("detailTitle")!.textContent = book.title;

    const detailBody = document.getElementById("detailBody") as HTMLElement;
    detailBody.innerHTML = "";

    const rows: [string, string][] = [
      ["Summary", summary],
      ["Author", book.author],
      ["ISBN", book.isbn],
      ["Published", book.publishDate],
      ["Age", age + " years"],
      ["Genre", book.genre],
      ["Era", era],
      ["Discount", discount + "%"],
      ["Type", book.type],
    ];

    rows.forEach(([label, value]) => detailBody.appendChild(this.createRow(label, value)));

    if (book.type === "Printed")
      detailBody.appendChild(this.createRow("Reading Time", (book as PrintedBook).getReadingTime()));
    else if (book.type === "EBook") 
      detailBody.appendChild(this.createRow("File Size", (book as EBook).getFileInfo()));
    document.getElementById("detailModal")!.classList.remove("hidden");
  }

  closeDetails(): void {
    document.getElementById("detailModal")!.classList.add("hidden");
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

  displayBooks(): void {
    const tableBody = document.getElementById("bookTableBody") as HTMLElement;
    const cardBox = document.getElementById("bookCards") as HTMLElement;
    const noBooks = document.getElementById("noBooks") as HTMLElement;
    const sortBy = (document.getElementById("sortSelect") as HTMLSelectElement).value as SortOption;
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

      const tr = document.createElement("tr");
      tr.className = "border-b border-[var(--border)] hover:bg-[var(--bg-hover)]";

      tr.appendChild(this.createTd(String(i + 1)));
      tr.appendChild(this.createTd(book.title));
      tr.appendChild(this.createTd(book.author));
      tr.appendChild(this.createTd(book.isbn));
      tr.appendChild(this.createTd(book.publishDate));
      tr.appendChild(this.createTd(age + " yrs"));
      tr.appendChild(this.createTd(book.genre));
      tr.appendChild(this.createTd(category));
      tr.appendChild(this.createTd(book.type));

      const discountTd = document.createElement("td");
      discountTd.className = "p-2.5 text-[var(--text-light)] text-xs";
      if (discount > 0) {
        const badge = document.createElement("span");
        badge.className = "bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded whitespace-nowrap";
        badge.textContent = discount + "% off";
        discountTd.appendChild(badge);
      } else
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

      card.appendChild(this.createCardRow("Author", book.author));
      card.appendChild(this.createCardRow("ISBN", book.isbn));
      card.appendChild(this.createCardRow("Published", book.publishDate));
      card.appendChild(this.createCardRow("Age", age + " yrs"));
      card.appendChild(this.createCardRow("Genre", book.genre));
      card.appendChild(this.createCardRow("Era", category));
      card.appendChild(this.createCardRow("Type", book.type));

      const discountRow = document.createElement("div");
      discountRow.className = "flex justify-between py-2 mb-3";
      const discountLabel = document.createElement("span");
      discountLabel.className = "text-[var(--blue-light)] text-xs font-bold";
      discountLabel.textContent = "Discount";
      const discountVal = document.createElement("span");
      discountVal.className = "text-[var(--text-light)] text-xs";
      if (discount > 0) {
        const badge = document.createElement("span");
        badge.className = "bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded whitespace-nowrap";
        badge.textContent = discount + "% off";
        discountVal.appendChild(badge);
      } 
      else
        discountVal.textContent = "—";
      
      discountRow.appendChild(discountLabel);
      discountRow.appendChild(discountVal);
      card.appendChild(discountRow);

      const cardActions = document.createElement("div");
      cardActions.className = "flex gap-2";

      const createCardBtn = (text: string, bg: string, onClick: () => void): HTMLElement => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.className = `flex-1 py-2 rounded text-white text-xs cursor-pointer border-none ${bg}`;
        btn.addEventListener("click", onClick);
        return btn;
      };

      cardActions.appendChild(createCardBtn("View", "bg-[var(--grey)]", () => this.showDetails(realIndex)));
      cardActions.appendChild(createCardBtn("Edit", "bg-[var(--blue-dark)]", () => this.editBook(realIndex)));
      cardActions.appendChild(createCardBtn("Delete", "bg-[var(--red-dark)]", () => this.deleteBook(realIndex)));
      card.appendChild(cardActions);
      cardBox.appendChild(card);
    }
  }

  searchBooks(): void {
    const searchTerm = (document.getElementById("searchInput") as HTMLInputElement).value.trim().toLowerCase();
    const searchStatus = document.getElementById("searchStatus") as HTMLElement;
    if (searchTerm === "") {
      searchStatus.textContent = "Please type something to search.";
      return;
    }
    const results = this.library.search(searchTerm);
    searchStatus.textContent = results.length === 0 ? `No books found for "${searchTerm}".` : `Found ${results.length} book(s) for "${searchTerm}".`;
    this.displayBooks();
  }

  clearSearch(): void {
    this.library.clearSearch();
    (document.getElementById("searchInput") as HTMLInputElement).value = "";
    document.getElementById("searchStatus")!.textContent = "";
    this.displayBooks();
  }

  private simulateServer(data: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data) resolve(data);
        else reject("No data found");
      }, 1500);
    });
  }

  async fetchBookFromApi(): Promise<void> {
    const id = (document.getElementById("fetchId") as HTMLInputElement).value;
    const loadingMsg = document.getElementById("loadingMsg") as HTMLElement;
    const fetchError = document.getElementById("fetchError") as HTMLElement;
    const fetchResult = document.getElementById("fetchResult") as HTMLElement;

    if (id === "" || Number(id) < 1 || Number(id) > 100) {
      fetchError.textContent = "Please enter a number between 1 and 100.";
      fetchError.classList.remove("hidden");
      fetchResult.classList.add("hidden");
      return;
    }

    fetchError.classList.add("hidden");
    fetchResult.classList.add("hidden");
    loadingMsg.classList.remove("hidden");

    try {
      const response = await fetch("https://6a33db358248ee962fa48cc7.mockapi.io/books/books");
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      await this.simulateServer(response);
      const allBooks: IApiBook[] = await response.json();
      const data = allBooks[Number(id) - 1];
      if (!data) throw new Error("Book not found");

      if (this.library.isbnExists(data.isbn)) {
        loadingMsg.classList.add("hidden");
        fetchError.textContent = "This book already exists in your list.";
        fetchError.classList.remove("hidden");
        return;
      }

      loadingMsg.classList.add("hidden");
      fetchResult.classList.remove("hidden");
      document.getElementById("fetchTitle")!.textContent = data.title;
      document.getElementById("fetchBody")!.textContent  = `Author: ${data.author} | Genre: ${data.genre} | Published: ${data.publish_date}`;

      this.fieldIds.forEach(field => {
        const apiField = field === "publishDate" ? "publish_date" : field;
        fetchResult.dataset[field] = (data as any)[apiField];
      });

    } catch (error) {
      loadingMsg.classList.add("hidden");
      fetchError.textContent = `Failed to fetch: ${(error as Error).message}`;
      fetchError.classList.remove("hidden");
    }
  }

  addFetchedBook(): void {
    const fetchResult = document.getElementById("fetchResult") as HTMLElement;
    const values = this.fieldIds.map(field => fetchResult.dataset[field] ?? "");
    const newBook = new EBook(values[0], values[1], values[2], values[3], values[4], "5");
    this.library.addBook(newBook);
    fetchResult.classList.add("hidden");
    (document.getElementById("fetchId") as HTMLInputElement).value = "";
    this.showSuccess("Fetched book added to your list!");
    this.displayBooks();
  }
}