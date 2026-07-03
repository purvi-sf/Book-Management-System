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
import { getElement, toSafeGenre } from "./generics.js";
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
        getElement("isbn").addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, ""); //replaces every non digit with empty string
        });
        const clickEvents = {
            submitBtn: this.submitBook,
            cancelBtn: this.cancelEdit,
            fetchBtn: this.fetchBookFromApi,
            addFetchedBtn: this.addFetchedBook,
            searchBtn: this.searchBooks,
            clearBtn: this.clearSearch,
            closeDetailBtn: this.closeDetails,
        };
        const changeEvents = {
            bookType: this.toggleExtraField,
            sortSelect: this.displayBooks,
        };
        Object.entries(clickEvents).forEach(([id, handler]) => {
            getElement(id).addEventListener("click", handler); //for each id fires the click button
        });
        Object.entries(changeEvents).forEach(([id, handler]) => {
            getElement(id).addEventListener("change", handler);
        });
    }
    getFormValues() {
        const getValue = (id) => getElement(id).value.trim();
        return {
            title: getValue("title"),
            author: getValue("author"),
            isbn: getValue("isbn"),
            publishDate: getElement("publishDate").value,
            genre: getElement("genre").value,
            bookType: getElement("bookType").value,
            extra: getValue("extraField"),
        };
    }
    //for file size and printed page 
    toggleExtraField = () => {
        const bookType = getElement("bookType").value;
        const extraLabel = getElement("extraLabel");
        const extraField = getElement("extraField");
        const extraWrap = getElement("extraWrap");
        const config = {
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
    };
    validateBookType() {
        const bookTypeSelect = getElement("bookType");
        const bookTypeError = getElement("bookTypeError");
        const valid = bookTypeSelect.value !== "";
        bookTypeError.classList.toggle("hidden", valid);
        bookTypeSelect.classList.toggle("invalid", !valid);
        return valid;
    }
    formCheck() {
        const fieldsValid = Library.validateForm(this.fieldIds, this.errorIds);
        const bookTypeValid = this.validateBookType();
        if (!fieldsValid || !bookTypeValid)
            return false;
        const isbn = getElement("isbn").value.trim();
        if (this.edit === null && this.library.isbnExists(isbn)) {
            alert("ISBN already exists");
            return false;
        }
        return true;
    }
    makeBook(values) {
        const { title, author, isbn, publishDate, genre, bookType, extra } = values;
        const safeGenre = toSafeGenre(genre);
        if (bookType === "EBook")
            return new EBook(title, author, isbn, publishDate, safeGenre, extra || "0");
        return new PrintedBook(title, author, isbn, publishDate, safeGenre, Number(extra) || 0);
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
        const bookRecord = book;
        for (const id of this.fieldIds) {
            getElement(id).value = bookRecord[id] ?? "";
        }
        getElement("bookType").value = book.type;
        this.toggleExtraField();
        const extraField = getElement("extraField");
        if (book instanceof PrintedBook)
            extraField.value = String(book.pageCount);
        else if (book instanceof EBook)
            extraField.value = book.fileSize;
        this.edit = index;
        getElement("formHeading").textContent = "Edit Book";
        getElement("submitBtn").textContent = "Update Book";
        getElement("cancelBtn").classList.remove("hidden");
        getElement("successMsg").classList.add("hidden");
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
    deleteBook = (index) => {
        if (!confirm("Are you sure you want to delete this book?"))
            return;
        this.library.deleteBook(index);
        this.displayBooks();
    };
    submitBook = () => {
        if (!this.formCheck())
            return;
        if (this.edit !== null)
            this.updateBook();
        else
            this.addBook();
    };
    cancelEdit = () => {
        this.edit = null;
        this.clearForm();
        getElement("formHeading").textContent = "Add a New Book";
        getElement("submitBtn").textContent = "Add Book";
        getElement("cancelBtn").classList.add("hidden");
    };
    clearForm() {
        const toClear = [...this.fieldIds, "bookType", "extraField"];
        toClear.forEach(id => document.getElementById(id).value = "");
        getElement("extraWrap").classList.add("hidden");
        getElement("bookTypeError").classList.add("hidden");
        getElement("bookType").classList.remove("invalid");
    }
    showSuccess(message) {
        const msg = getElement("successMsg");
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
        getElement("detailTitle").textContent = book.title;
        const detailBody = getElement("detailBody");
        detailBody.innerHTML = "";
        const rows = [
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
        getElement("detailModal").classList.remove("hidden");
    }
    closeDetails = () => {
        getElement("detailModal").classList.add("hidden");
    };
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
    createDiscountBadge(discount) {
        const span = document.createElement("span");
        span.className = "bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded whitespace-nowrap";
        span.textContent = discount + "% off";
        return span;
    }
    createCardBtn(text, bg, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.className = `flex-1 py-2 rounded text-white text-xs cursor-pointer border-none ${bg}`;
        btn.addEventListener("click", onClick);
        return btn;
    }
    displayBooks = () => {
        const tableBody = getElement("bookTableBody");
        const cardBox = getElement("bookCards");
        const noBooks = getElement("noBooks");
        const sortBy = getElement("sortSelect").value;
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
    };
    searchBooks = () => {
        const searchTerm = getElement("searchInput").value.trim().toLowerCase();
        const searchStatus = getElement("searchStatus");
        if (searchTerm === "") {
            searchStatus.textContent = "Please type something to search.";
            return;
        }
        const results = this.library.search(searchTerm);
        searchStatus.textContent = results.length === 0 ? `No books found for "${searchTerm}".` : `Found ${results.length} book(s) for "${searchTerm}".`;
        this.displayBooks();
    };
    clearSearch = () => {
        this.library.clearSearch();
        getElement("searchInput").value = "";
        getElement("searchStatus").textContent = "";
        this.displayBooks();
    };
    showFetchError(fetchError, loadingMsg, message) {
        loadingMsg.classList.add("hidden");
        fetchError.textContent = message;
        fetchError.classList.remove("hidden");
    }
    fetchBookFromApi = async () => {
        const id = getElement("fetchId").value;
        const loadingMsg = getElement("loadingMsg");
        const fetchError = getElement("fetchError");
        const fetchResult = getElement("fetchResult");
        if (id === "" || Number(id) < 1 || Number(id) > 100) {
            this.showFetchError(fetchError, loadingMsg, "Please enter a number between 1 and 100.");
            return;
        }
        fetchError.classList.add("hidden");
        fetchResult.classList.add("hidden");
        loadingMsg.classList.remove("hidden");
        try {
            const response = await fetch("https://6a33db358248ee962fa48cc7.mockapi.io/books/books");
            if (!response.ok)
                throw new Error(`Server error: ${response.status}`);
            const allBooks = await response.json();
            const data = allBooks[Number(id) - 1];
            if (!data)
                throw new Error("Book not found");
            if (this.library.isbnExists(data.isbn)) {
                this.showFetchError(fetchError, loadingMsg, "This book already exists in your list.");
                return;
            }
            loadingMsg.classList.add("hidden");
            fetchResult.classList.remove("hidden");
            const fetchedType = data.bookType ?? "EBook";
            getElement("fetchTitle").textContent = data.title;
            getElement("fetchBody").textContent = `Author: ${data.author} | Genre: ${data.genre} | Published: ${data.publish_date} | Type: ${fetchedType}`;
            this.fieldIds.forEach((field) => {
                const apiField = field === "publishDate" ? "publish_date" : field;
                fetchResult.dataset[field] = data[apiField] ?? "";
            });
            fetchResult.dataset["bookType"] = fetchedType;
            fetchResult.dataset["fileSize"] = data.fileSize ?? "0";
            fetchResult.dataset["pageCount"] = String(data.pageCount ?? 0);
        }
        catch (error) {
            this.showFetchError(fetchError, loadingMsg, `Failed to fetch: ${error.message}`);
        }
    };
    addFetchedBook = () => {
        const fetchResult = getElement("fetchResult");
        const values = this.fieldIds.map((field) => fetchResult.dataset[field] ?? "");
        const bookType = (fetchResult.dataset["bookType"] ?? "EBook");
        const fileSize = fetchResult.dataset["fileSize"] ?? "0";
        const pageCount = Number(fetchResult.dataset["pageCount"] ?? 0);
        const safeGenre = toSafeGenre(values[4]);
        const newBook = bookType === "Printed"
            ? new PrintedBook(values[0], values[1], values[2], values[3], safeGenre, pageCount)
            : new EBook(values[0], values[1], values[2], values[3], safeGenre, fileSize);
        this.library.addBook(newBook);
        fetchResult.classList.add("hidden");
        getElement("fetchId").value = "";
        this.showSuccess(`${bookType} added to your list!`);
        this.displayBooks();
    };
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