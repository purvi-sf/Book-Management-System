class BaseBook {
  constructor(title, author, isbn, publish_date, genre) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.publish_date = publish_date;
    this.genre = genre;
  }

  calculateAge() {
    return 2026 - new Date(this.publish_date).getFullYear();
  }

  getEra() {
    const age = this.calculateAge();
    if (age <= 26) return "Contemporary Classics";
    if (age <= 126) return "Modernism";
    if (age <= 189) return "Victorian";
    if (age <= 228) return "Romanticism";
    if (age <= 426) return "The Enlightenment";
    if (age <= 526) return "The Renaissance";
    if (age <= 1526) return "Medieval";
    return "Classical";
  }

  getDiscount() {
    const age = this.calculateAge();
    if (age > 100) return 30;
    if (age > 50) return 20;
    if (age > 25) return 10;
    return 0;
  }

  getSummary() {
    return `${this.title} by ${this.author} (${this.publish_date})`;
  }
}

class PrintedBook extends BaseBook {
  constructor(title, author, isbn, publish_date, genre, page_count) {
    super(title, author, isbn, publish_date, genre);
    this.page_count = page_count;
    this.type = "Printed";
  }

  getReadingTime() {
    return Math.ceil(this.page_count / 30) + " hrs";
  }
}

class EBook extends BaseBook {
  constructor(title, author, isbn, publish_date, genre, file_size) {
    super(title, author, isbn, publish_date, genre);
    this.file_size = file_size;
    this.type = "EBook";
  }

  getFileInfo() {
    return `${this.file_size} MB`;
  }
}

class Library {
  constructor() {
    this.books = [];
    this.filtered_books = null;
  }

  addBook(book) {
    this.books.push(book);
    this.filtered_books = null;
  }

  updateBook(index, book) {
    this.books[index] = book;
    this.filtered_books = null;
  }

  deleteBook(index) {
    this.books.splice(index, 1);
    this.filtered_books = null;
  }

  isbnExists(isbn) {
    return this.books.some(book => book.isbn === isbn);
  }

  search(term) {
    const lower = term.toLowerCase();
    this.filtered_books = this.books.filter(book =>
      book.title.toLowerCase().includes(lower) ||
      book.author.toLowerCase().includes(lower)
    );
    return this.filtered_books;
  }

  clearSearch() {
    this.filtered_books = null;
  }

  getSortedBooks(sort_by) {
    const list = this.filtered_books !== null ? this.filtered_books : this.books;
    const sorted = [...list];
    if (sort_by === "title")
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort_by === "author")
      sorted.sort((a, b) => a.author.localeCompare(b.author));
    else if (sort_by === "age_asc")
      sorted.sort((a, b) => a.calculateAge() - b.calculateAge());
    else if (sort_by === "age_desc")
      sorted.sort((a, b) => b.calculateAge() - a.calculateAge());
    return sorted;
  }

  static validateForm(field_ids, error_ids) {
    let isValid = true;
    for (let i = 0; i < field_ids.length; i++) {
      document.getElementById(error_ids[i]).classList.add("hidden");
      document.getElementById(field_ids[i]).classList.remove("invalid");
      if (document.getElementById(field_ids[i]).value.trim() === "") {
        document.getElementById(error_ids[i]).classList.remove("hidden");
        document.getElementById(field_ids[i]).classList.add("invalid");
        isValid = false;
      }
    }
    return isValid;
  }
}

class BookApp {
  constructor(library) {
    this.library = library;
    this.field_ids = ["title", "author", "isbn", "publish_date", "genre"];
    this.error_ids = ["titleError", "authorError", "isbnError", "publish_dateError", "genreError"];
    this.edit = null;
  }

  get_form_values() {
    return {
      title: document.getElementById("title").value.trim(),
      author: document.getElementById("author").value.trim(),
      isbn: document.getElementById("isbn").value.trim(),
      publish_date: document.getElementById("publish_date").value,
      genre: document.getElementById("genre").value.trim(),
      book_type: document.getElementById("book_type").value,
      extra: document.getElementById("extraField").value.trim(),
    };
  }

  toggle_extra_field() {
    const book_type = document.getElementById("book_type").value;
    const extraLabel = document.getElementById("extraLabel");
    const extraField = document.getElementById("extraField");
    const extraWrap = document.getElementById("extraWrap");

    if (book_type === "Printed") {
      extraLabel.textContent = "Page Count:";
      extraField.placeholder = "e.g. 350";
      extraWrap.classList.remove("hidden");
    } else if (book_type === "EBook") {
      extraLabel.textContent = "File Size (MB):";
      extraField.placeholder = "e.g. 5";
      extraWrap.classList.remove("hidden");
    } else {
      extraWrap.classList.add("hidden");
      extraField.value = "";
    }
  }

  Form_Check() {
    const isValid = Library.validateForm(this.field_ids, this.error_ids);
    if (!isValid) return false;
    const isbn = document.getElementById("isbn").value.trim();
    if (this.edit === null && this.library.isbnExists(isbn)) {
      alert("ISBN already exists");
      return false;
    }
    return true;
  }

  make_book(title, author, isbn, publish_date, genre, book_type, extra) {
    if (book_type === "EBook")
      return new EBook(title, author, isbn, publish_date, genre, extra || "0");
    return new PrintedBook(title, author, isbn, publish_date, genre, Number(extra) || 0);
  }

  addBook() {
    const { title, author, isbn, publish_date, genre, book_type, extra } = this.get_form_values();
    const newBook = this.make_book(title, author, isbn, publish_date, genre, book_type, extra);
    this.library.addBook(newBook);
    document.getElementById("successMsg").textContent = "Book added successfully!";
    document.getElementById("successMsg").classList.remove("hidden");
    this.clearForm();
    this.display_books();
  }

  editBook(index) {
    const book = this.library.books[index];
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("isbn").value = book.isbn;
    document.getElementById("publish_date").value = book.publish_date;
    document.getElementById("genre").value = book.genre;
    document.getElementById("book_type").value = book.type;

    this.toggle_extra_field();

    if (book.type === "Printed")
      document.getElementById("extraField").value = book.page_count;
    else if (book.type === "EBook")
      document.getElementById("extraField").value = book.file_size;

    this.edit = index;
    document.getElementById("formHeading").textContent = "Edit Book";
    document.getElementById("submitBtn").textContent   = "Update Book";
    document.getElementById("cancelBtn").classList.remove("hidden");
    document.getElementById("successMsg").classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateBook() {
    const { title, author, isbn, publish_date, genre, book_type, extra } = this.get_form_values();
    const updatedBook = this.make_book(title, author, isbn, publish_date, genre, book_type, extra);
    this.library.updateBook(this.edit, updatedBook);
    document.getElementById("successMsg").textContent = "Book updated successfully!";
    document.getElementById("successMsg").classList.remove("hidden");
    this.cancelEdit();
    this.display_books();
  }

  deleteBook(index) {
    if (!confirm("Are you sure you want to delete this book?")) return;
    this.library.deleteBook(index);
    this.display_books();
  }

  submit_book() {
    if (!this.Form_Check()) return;
    if (this.edit !== null) this.updateBook();
    else this.addBook();
  }

  cancelEdit() {
    this.edit = null;
    this.clearForm();
    document.getElementById("formHeading").textContent = "Add a New Book";
    document.getElementById("submitBtn").textContent   = "Add Book";
    document.getElementById("cancelBtn").classList.add("hidden");
  }

  clearForm() {
    for (let i = 0; i < this.field_ids.length; i++)
      document.getElementById(this.field_ids[i]).value = "";
    document.getElementById("book_type").value  = "";
    document.getElementById("extraField").value = "";
    document.getElementById("extraWrap").classList.add("hidden");
  }

  showDetails(realIndex) {
    const book = this.library.books[realIndex];
    const age = book.calculateAge();
    const era = book.getEra();
    const discount = book.getDiscount();
    const summary  = book.getSummary();
    const p = "color:#CFE2FF;font-size:14px;margin-bottom:8px;";
    const label = "color:#42A5FF;font-weight:bold;";

    let extra_info = "";
    if (book.type === "Printed")
      extra_info = `<p style="${p}"><span style="${label}">Reading Time:</span> ${book.getReadingTime()}</p>`;
    else if (book.type === "EBook")
      extra_info = `<p style="${p}"><span style="${label}">File Size:</span> ${book.getFileInfo()}</p>`;

    document.getElementById("detailTitle").textContent = book.title;
    document.getElementById("detailBody").innerHTML = `
      <p style="${p}"><span style="${label}">Summary:</span> ${summary}</p>
      <p style="${p}"><span style="${label}">Author:</span> ${book.author}</p>
      <p style="${p}"><span style="${label}">ISBN:</span> ${book.isbn}</p>
      <p style="${p}"><span style="${label}">Published:</span> ${book.publish_date}</p>
      <p style="${p}"><span style="${label}">Age:</span> ${age} years</p>
      <p style="${p}"><span style="${label}">Genre:</span> ${book.genre}</p>
      <p style="${p}"><span style="${label}">Era:</span> ${era}</p>
      <p style="${p}"><span style="${label}">Discount:</span> ${discount}%</p>
      <p style="${p}"><span style="${label}">Type:</span> ${book.type}</p>
      ${extra_info}
    `;
    document.getElementById("detailModal").classList.remove("hidden");
  }

  closeDetails() {
    document.getElementById("detailModal").classList.add("hidden");
  }

  display_books() {
    const tableBody = document.getElementById("bookTableBody");
    const cardBox = document.getElementById("bookCards");
    const noBooks = document.getElementById("noBooks");
    const sort_by = document.getElementById("sortSelect").value;
    const books_to_show = this.library.getSortedBooks(sort_by);

    if (books_to_show.length === 0) {
      cardBox.classList.add("hidden");
      noBooks.classList.remove("hidden");
      tableBody.innerHTML = "";
      cardBox.innerHTML   = "";
      return;
    }

    noBooks.classList.add("hidden");
    cardBox.classList.remove("hidden");

    const td  = "padding:10px;color:#CFE2FF;font-size:13px;";
    const btn = "border:none;border-radius:4px;cursor:pointer;font-size:12px;color:white;";

    let rows  = "";
    let cards = "";

    for (let i = 0; i < books_to_show.length; i++) {
      const book = books_to_show[i];
      const age = book.calculateAge();
      const category = book.getEra();
      const discount = book.getDiscount();
      const realIndex = this.library.books.indexOf(book);

      const discount_badge = discount > 0
        ? `<span style="background:#1B5E20;color:#A5D6A7;font-size:11px;padding:2px 6px;border-radius:4px;white-space:nowrap;">${discount}% off</span>`
        : "";

      rows += `
        <tr style="border-bottom:1px solid #1A3A5C;" onmouseover="this.style.background='#0A2540'" onmouseout="this.style.background=''">
          <td style="${td}">${i + 1}</td>
          <td style="${td}">${book.title}</td>
          <td style="${td}">${book.author}</td>
          <td style="${td}">${book.isbn}</td>
          <td style="${td}">${book.publish_date}</td>
          <td style="${td}">${age} yrs</td>
          <td style="${td}">${book.genre}</td>
          <td style="${td}">${category}</td>
          <td style="${td}">${book.type}</td>
          <td style="${td}">${discount > 0 ? discount_badge : "—"}</td>
          <td style="padding:10px;white-space:nowrap;">
            <button onclick="app.showDetails(${realIndex})" style="${btn}padding:5px 10px;background:#37474F;margin-right:5px;">View</button>
            <button onclick="app.editBook(${realIndex})"   style="${btn}padding:5px 10px;background:#1565C0;margin-right:5px;">Edit</button>
            <button onclick="app.deleteBook(${realIndex})" style="${btn}padding:5px 10px;background:#B71C1C;">Delete</button>
          </td>
        </tr>
      `;

      const row_style   = "display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1A3A5C;";
      const label_style = "color:#42A5FF;font-size:12px;font-weight:bold;";
      const value_style = "color:#CFE2FF;font-size:12px;text-align:right;";
      const discount_tag = discount > 0
        ? `<span style="background:#1B5E20;color:#A5D6A7;font-size:11px;padding:3px 8px;border-radius:4px;">${discount}% off</span>`
        : "";

      cards += `
        <div style="background:#0D2740;border:1px solid #1A3A5C;border-radius:8px;padding:16px;">
          <h3 style="color:#42A5FF;font-size:16px;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #1E88FF;">${book.title}</h3>
          <div style="${row_style}"><span style="${label_style}">Author</span><span style="${value_style}">${book.author}</span></div>
          <div style="${row_style}"><span style="${label_style}">ISBN</span><span style="${value_style}">${book.isbn}</span></div>
          <div style="${row_style}"><span style="${label_style}">Published</span><span style="${value_style}">${book.publish_date}</span></div>
          <div style="${row_style}"><span style="${label_style}">Age</span><span style="${value_style}">${age} yrs</span></div>
          <div style="${row_style}"><span style="${label_style}">Genre</span><span style="${value_style}">${book.genre}</span></div>
          <div style="${row_style}"><span style="${label_style}">Era</span><span style="${value_style}">${category}</span></div>
          <div style="${row_style}"><span style="${label_style}">Type</span><span style="${value_style}">${book.type}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;margin-bottom:12px;align-items:center;">
            <span style="${label_style}">Discount</span>
            <span style="${value_style}">${discount > 0 ? discount + "% off" : "No discount"} ${discount_tag}</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="app.showDetails(${realIndex})" style="flex:1;padding:8px;background:#37474F;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">View</button>
            <button onclick="app.editBook(${realIndex})"   style="flex:1;padding:8px;background:#1565C0;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Edit</button>
            <button onclick="app.deleteBook(${realIndex})" style="flex:1;padding:8px;background:#B71C1C;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Delete</button>
          </div>
        </div>
      `;
    }

    tableBody.innerHTML = rows;
    cardBox.innerHTML   = cards;
  }

  search_books() {
    const search_term = document.getElementById("searchInput").value.trim().toLowerCase();
    const searchStatus = document.getElementById("searchStatus");
    if (search_term === "") {
      searchStatus.textContent = "Please type something to search.";
      return;
    }
    const results = this.library.search(search_term);
    if (results.length === 0)
      searchStatus.textContent = `No books found for "${search_term}".`;
    else
      searchStatus.textContent = `Found ${results.length} book(s) for "${search_term}".`;
    this.display_books();
  }

  clear_search() {
    this.library.clearSearch();
    document.getElementById("searchInput").value        = "";
    document.getElementById("searchStatus").textContent = "";
    this.display_books();
  }
}

const simulate_server = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data) resolve(data);
      else reject("No data found");
    }, 1500);
  });
};

const fetch_book_from_api = async () => {
  const id = document.getElementById("fetchId").value;
  const loadingMsg = document.getElementById("loadingMsg");
  const fetchError = document.getElementById("fetchError");
  const fetchResult = document.getElementById("fetchResult");

  if (id === "" || id < 1 || id > 100) {
    fetchError.textContent = "Please enter a number between 1 and 100.";
    fetchError.classList.remove("hidden");
    fetchResult.classList.add("hidden");
    return;
  }

  fetchError.classList.add("hidden");
  fetchResult.classList.add("hidden");
  loadingMsg.classList.remove("hidden");

  try {
    const response = await fetch(`https://6a33db358248ee962fa48cc7.mockapi.io/books/books`);
    if (!response.ok)
    throw new Error(`Server error: ${response.status}`);
    await simulate_server(response);
    const allBooks = await response.json();
    const data = allBooks[id - 1];
    if (!data) throw new Error("Book not found");

    if (app.library.isbnExists(String(data.id))) {
      loadingMsg.classList.add("hidden");
      fetchError.textContent = "This book already exists in your list.";
      fetchError.classList.remove("hidden");
      return;
    }

    loadingMsg.classList.add("hidden");
    fetchResult.classList.remove("hidden");
    document.getElementById("fetchTitle").textContent = data.title;
    document.getElementById("fetchBody").textContent  = `Author: ${data.author} | Genre: ${data.genre} | Published: ${data.publish_date}`;
    fetchResult.dataset.title = data.title;
    fetchResult.dataset.id = data.isbn;
    fetchResult.dataset.author = data.author;
    fetchResult.dataset.publish_date = data.publish_date;
    fetchResult.dataset.genre = data.genre;

  } catch (error) {
    loadingMsg.classList.add("hidden");
    fetchError.textContent = `Failed to fetch: ${error.message}`;
    fetchError.classList.remove("hidden");
  }
};

const add_fetched_book = () => {
  const fetchResult = document.getElementById("fetchResult");
  const newBook = new EBook(
    fetchResult.dataset.title,
    fetchResult.dataset.author,
    fetchResult.dataset.id,
    fetchResult.dataset.publish_date,
    fetchResult.dataset.genre,
    "5"
  );
  app.library.addBook(newBook);
  fetchResult.classList.add("hidden");
  document.getElementById("fetchId").value = "";
  document.getElementById("successMsg").textContent = "Fetched book added to your list!";
  document.getElementById("successMsg").classList.remove("hidden");
  app.display_books();
};

const only_numbers = (input) => {
  input.value = input.value.replace(/[^0-9]/g, "");
};

const library = new Library();
const app = new BookApp(library);
app.display_books();
