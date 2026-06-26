var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Library } from "./library.js";
import { PrintedBook, EBook } from "./books.js";
import { Log } from "./decorators.js";
export class BookApp {
    library;
    fieldIds = ["title", "author", "isbn", "publishDate", "genre"];
    errorIds = ["titleError", "authorError", "isbnError", "publishDateError", "genreError"];
    edit = null;
    constructor(library) {
        this.library = library;
        this.attachEvents();
    }
    attachEvents() {
        const isbn = document.getElementById("isbn");
        isbn.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
        const clickEvents = {
            submitBtn: () => this.submitBook(),
            cancelBtn: () => this.cancelEdit(),
            fetchBtn: () => this.fetchBookFromApi(),
            addFetchedBtn: () => this.addFetchedBook(),
            searchBtn: () => this.searchBooks(),
            clearBtn: () => this.clearSearch(),
            closeDetailBtn: () => this.closeDetails(),
        };
        const changeEvents = {
            bookType: () => this.toggleExtraField(),
            sortSelect: () => this.displayBooks(),
        };
        Object.entries(clickEvents).forEach(([id, handler]) => {
            document.getElementById(id).addEventListener("click", handler);
        });
        Object.entries(changeEvents).forEach(([id, handler]) => {
            document.getElementById(id).addEventListener("change", handler);
        });
    }
    getFormValues() {
        return {
            title: document.getElementById("title").value.trim(),
            author: document.getElementById("author").value.trim(),
            isbn: document.getElementById("isbn").value.trim(),
            publishDate: document.getElementById("publishDate").value,
            genre: document.getElementById("genre").value.trim(),
            bookType: document.getElementById("bookType").value,
            extra: document.getElementById("extraField").value.trim(),
        };
    }
    toggleExtraField() {
        const bookType = document.getElementById("bookType").value;
        const extraLabel = document.getElementById("extraLabel");
        const extraField = document.getElementById("extraField");
        const extraWrap = document.getElementById("extraWrap");
        if (bookType === "Printed") {
            extraLabel.textContent = "Page Count:";
            extraField.placeholder = "e.g. 350";
            extraWrap.classList.remove("hidden");
        }
        else if (bookType === "EBook") {
            extraLabel.textContent = "File Size (MB):";
            extraField.placeholder = "e.g. 5";
            extraWrap.classList.remove("hidden");
        }
        else {
            extraWrap.classList.add("hidden");
            extraField.value = "";
        }
    }
    formCheck() {
        const isValid = Library.validateForm(this.fieldIds, this.errorIds);
        if (!isValid)
            return false;
        const isbn = document.getElementById("isbn").value.trim();
        if (this.edit === null && this.library.isbnExists(isbn)) {
            alert("ISBN already exists");
            return false;
        }
        return true;
    }
    makeBook(values) {
        const { title, author, isbn, publishDate, genre, bookType, extra } = values;
        if (bookType === "EBook")
            return new EBook(title, author, isbn, publishDate, genre, extra || "0");
        return new PrintedBook(title, author, isbn, publishDate, genre, Number(extra) || 0);
    }
    addBook() {
        const values = this.getFormValues();
        const newBook = this.makeBook(values);
        this.library.addBook(newBook);
        this.showSuccess("Book added successfully!");
        this.clearForm();
        this.displayBooks();
    }
    editBook(index) {
        const book = this.library.books[index];
        for (let i = 0; i < this.fieldIds.length; i++) {
            document.getElementById(this.fieldIds[i]).value = book[this.fieldIds[i]];
        }
        document.getElementById("bookType").value = book.type;
        this.toggleExtraField();
        if (book.type === "Printed") {
            document.getElementById("extraField").value = String(book.pageCount);
        }
        else if (book.type === "EBook") {
            document.getElementById("extraField").value = book.fileSize;
        }
        this.edit = index;
        document.getElementById("formHeading").textContent = "Edit Book";
        document.getElementById("submitBtn").textContent = "Update Book";
        document.getElementById("cancelBtn").classList.remove("hidden");
        document.getElementById("successMsg").classList.add("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    updateBook() {
        const values = this.getFormValues();
        const updatedBook = this.makeBook(values);
        this.library.updateBook(this.edit, updatedBook);
        this.showSuccess("Book updated successfully!");
        this.cancelEdit();
        this.displayBooks();
    }
    deleteBook(index) {
        if (!confirm("Are you sure you want to delete this book?"))
            return;
        this.library.deleteBook(index);
        this.displayBooks();
    }
    submitBook() {
        if (!this.formCheck())
            return;
        if (this.edit !== null)
            this.updateBook();
        else
            this.addBook();
    }
    cancelEdit() {
        this.edit = null;
        this.clearForm();
        document.getElementById("formHeading").textContent = "Add a New Book";
        document.getElementById("submitBtn").textContent = "Add Book";
        document.getElementById("cancelBtn").classList.add("hidden");
    }
    clearForm() {
        const toClear = [...this.fieldIds, "bookType", "extraField"];
        toClear.forEach(id => document.getElementById(id).value = "");
        document.getElementById("extraWrap").classList.add("hidden");
    }
    showSuccess(message) {
        const msg = document.getElementById("successMsg");
        msg.textContent = message;
        msg.classList.remove("hidden");
    }
    createRow(labelText, value) {
        const p = document.createElement("p");
        p.className = "text-[var(--text-light)] text-sm mb-2";
        const span = document.createElement("span");
        span.className = "text-[var(--blue-light)] font-bold";
        span.textContent = labelText + ": ";
        p.appendChild(span);
        p.appendChild(document.createTextNode(value));
        return p;
    }
    showDetails(realIndex) {
        const book = this.library.books[realIndex];
        const age = book.calculateAge();
        const era = book.getEra();
        const discount = book.getDiscount();
        const summary = book.getSummary();
        document.getElementById("detailTitle").textContent = book.title;
        const detailBody = document.getElementById("detailBody");
        detailBody.innerHTML = "";
        const rows = [
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
        if (book.type === "Printed") {
            detailBody.appendChild(this.createRow("Reading Time", book.getReadingTime()));
        }
        else if (book.type === "EBook") {
            detailBody.appendChild(this.createRow("File Size", book.getFileInfo()));
        }
        document.getElementById("detailModal").classList.remove("hidden");
    }
    closeDetails() {
        document.getElementById("detailModal").classList.add("hidden");
    }
    createTd(text) {
        const td = document.createElement("td");
        td.className = "p-2.5 text-[var(--text-light)] text-xs";
        td.textContent = text;
        return td;
    }
    createBtn(text, bg, hoverBg, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.className = `border-none rounded cursor-pointer text-xs text-white px-2.5 py-1 mr-1 ${bg} ${hoverBg}`;
        btn.addEventListener("click", onClick);
        return btn;
    }
    createCardRow(labelText, value) {
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
    displayBooks() {
        const tableBody = document.getElementById("bookTableBody");
        const cardBox = document.getElementById("bookCards");
        const noBooks = document.getElementById("noBooks");
        const sortBy = document.getElementById("sortSelect").value;
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
            const bookData = [
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
            [String(i + 1), book.title, ...bookData.map(([, value]) => value)].forEach(cell => tr.appendChild(this.createTd(cell)));
            const discountTd = document.createElement("td");
            discountTd.className = "p-2.5 text-[var(--text-light)] text-xs";
            if (discount > 0) {
                const badge = document.createElement("span");
                badge.className = "bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded whitespace-nowrap";
                badge.textContent = discount + "% off";
                discountTd.appendChild(badge);
            }
            else {
                discountTd.textContent = "—";
            }
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
            bookData.slice(1).forEach(([label, value]) => card.appendChild(this.createCardRow(label, value)));
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
            else {
                discountVal.textContent = "—";
            }
            discountRow.appendChild(discountLabel);
            discountRow.appendChild(discountVal);
            card.appendChild(discountRow);
            const cardActions = document.createElement("div");
            cardActions.className = "flex gap-2";
            const createCardBtn = (text, bg, onClick) => {
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
    searchBooks() {
        const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
        const searchStatus = document.getElementById("searchStatus");
        if (searchTerm === "") {
            searchStatus.textContent = "Please type something to search.";
            return;
        }
        const results = this.library.search(searchTerm);
        searchStatus.textContent = results.length === 0
            ? `No books found for "${searchTerm}".`
            : `Found ${results.length} book(s) for "${searchTerm}".`;
        this.displayBooks();
    }
    clearSearch() {
        this.library.clearSearch();
        document.getElementById("searchInput").value = "";
        document.getElementById("searchStatus").textContent = "";
        this.displayBooks();
    }
    simulateServer(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (data)
                    resolve(data);
                else
                    reject("No data found");
            }, 1500);
        });
    }
    async fetchBookFromApi() {
        const id = document.getElementById("fetchId").value;
        const loadingMsg = document.getElementById("loadingMsg");
        const fetchError = document.getElementById("fetchError");
        const fetchResult = document.getElementById("fetchResult");
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
            if (!response.ok)
                throw new Error(`Server error: ${response.status}`);
            await this.simulateServer(response);
            const allBooks = await response.json();
            const data = allBooks[Number(id) - 1];
            if (!data)
                throw new Error("Book not found");
            if (this.library.isbnExists(data.isbn)) {
                loadingMsg.classList.add("hidden");
                fetchError.textContent = "This book already exists in your list.";
                fetchError.classList.remove("hidden");
                return;
            }
            loadingMsg.classList.add("hidden");
            fetchResult.classList.remove("hidden");
            document.getElementById("fetchTitle").textContent = data.title;
            document.getElementById("fetchBody").textContent = `Author: ${data.author} | Genre: ${data.genre} | Published: ${data.publish_date}`;
            this.fieldIds.forEach(field => {
                const apiField = field === "publishDate" ? "publish_date" : field;
                fetchResult.dataset[field] = data[apiField];
            });
        }
        catch (error) {
            loadingMsg.classList.add("hidden");
            fetchError.textContent = `Failed to fetch: ${error.message}`;
            fetchError.classList.remove("hidden");
        }
    }
    addFetchedBook() {
        const fetchResult = document.getElementById("fetchResult");
        const values = this.fieldIds.map(field => fetchResult.dataset[field] ?? "");
        const newBook = new EBook(values[0], values[1], values[2], values[3], values[4], "5");
        this.library.addBook(newBook);
        fetchResult.classList.add("hidden");
        document.getElementById("fetchId").value = "";
        this.showSuccess("Fetched book added to your list!");
        this.displayBooks();
    }
}
__decorate([
    Log,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BookApp.prototype, "addBook", null);
__decorate([
    Log,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BookApp.prototype, "updateBook", null);
//# sourceMappingURL=bookApp.js.map