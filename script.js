const books = []; 
const current_yr = 2026;
let edit = null;  
const field_ids = ["title", "author", "isbn", "publish_date", "genre"];
let filtered_books = null;

const Form_Check = () => {
  let isValid = true;
  const error_ids = ["titleError", "authorError", "isbnError", "publish_dateError", "genreError"];

  for (let i = 0; i < field_ids.length; i++) {
    document.getElementById(error_ids[i]).classList.add("hidden");
    document.getElementById(field_ids[i]).classList.remove("invalid");
    if (document.getElementById(field_ids[i]).value.trim() === "") {
      document.getElementById(error_ids[i]).classList.remove("hidden");
      document.getElementById(field_ids[i]).classList.add("invalid");
      isValid = false;
    }
  }
  if (edit === null && books.some(book => book.isbn === document.getElementById("isbn").value.trim())) {
    alert("ISBN already exists");
    isValid = false;
  }
  return isValid;
};

const only_numbers = (input) => {
  input.value = input.value.replace(/[^0-9]/g, "");
};

const addBook = () => {
  const newBook = {};
  for (let i = 0; i < field_ids.length; i++) 
    newBook[field_ids[i]] = document.getElementById(field_ids[i]).value.trim();
  books.push(newBook);
  document.getElementById("successMsg").textContent = "Book added successfully!";
  document.getElementById("successMsg").classList.remove("hidden");
  clearForm();
  display_books();
};

const editBook = (index) => {
  const book = books[index];
  for (let i = 0; i < field_ids.length; i++) 
    document.getElementById(field_ids[i]).value = book[field_ids[i]];
  edit = index;
  document.getElementById("formHeading").textContent = "Edit Book";
  document.getElementById("submitBtn").textContent = "Update Book";
  document.getElementById("cancelBtn").classList.remove("hidden");
  document.getElementById("successMsg").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const updateBook = () => {
  const updatedBook = {};
  for (let i = 0; i < field_ids.length; i++)
    updatedBook[field_ids[i]] = document.getElementById(field_ids[i]).value.trim();
  books[edit] = updatedBook;
  document.getElementById("successMsg").textContent = "Book updated successfully!";
  document.getElementById("successMsg").classList.remove("hidden");
  cancelEdit();
  display_books();
};

const deleteBook = (index) => {
  if (!confirm("Are you sure you want to delete this book?")) return;
  books.splice(index, 1);
  display_books();
};

const calculateAge = (publish_date) => {
  const year = new Date(publish_date).getFullYear();
  return current_yr - year;
};

const getEra = (publish_date) => {
  const age = calculateAge(publish_date);
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
};

const submit_book = () => {
  if (!Form_Check()) 
    return;
  if (edit !== null) 
    updateBook();
  else 
    addBook();
};

const cancelEdit = () => {
  edit = null;
  clearForm();
  document.getElementById("formHeading").textContent = "Add a New Book";
  document.getElementById("submitBtn").textContent = "Add Book";
  document.getElementById("cancelBtn").classList.add("hidden");
};

const clearForm = () => {
  for (let i = 0; i < field_ids.length; i++)
    document.getElementById(field_ids[i]).value = "";
};

const get_sorted_books = (list) => {
  const sort_by = document.getElementById("sortSelect").value;
  const sorted = [...list];
  if (sort_by === "title")
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort_by === "author")
    sorted.sort((a, b) => a.author.localeCompare(b.author));
  else if (sort_by === "age_desc")
    sorted.sort((a, b) => calculateAge(b.publish_date) - calculateAge(a.publish_date));
  else if (sort_by === "age_asc")
    sorted.sort((a, b) => calculateAge(a.publish_date) - calculateAge(b.publish_date));
  return sorted;
};

const showDetails = (realIndex) => {
  const book = books[realIndex];
  const age = calculateAge(book.publish_date);
  const era = getEra(book.publish_date);

  const p = "color:#CFE2FF;font-size:14px;margin-bottom:8px;";
  const label = "color:#42A5FF;font-weight:bold;";

  document.getElementById("detailTitle").textContent = book.title;
  document.getElementById("detailBody").innerHTML = `
    <p style="${p}"><span style="${label}">Author:</span> ${book.author}</p>
    <p style="${p}"><span style="${label}">ISBN:</span> ${book.isbn}</p>
    <p style="${p}"><span style="${label}">Published:</span> ${book.publish_date}</p>
    <p style="${p}"><span style="${label}">Age:</span> ${age} years</p>
    <p style="${p}"><span style="${label}">Genre:</span> ${book.genre}</p>
    <p style="${p}"><span style="${label}">Era:</span> ${era}</p>
  `;
  document.getElementById("detailModal").classList.remove("hidden");
};

const closeDetails = () => {
  document.getElementById("detailModal").classList.add("hidden");
};

const display_books = () => {
  const tableBody = document.getElementById("bookTableBody");
  const cardBox = document.getElementById("bookCards");
  const noBooks = document.getElementById("noBooks");
  const base_list = filtered_books !== null ? filtered_books : books;
  const books_to_show = get_sorted_books(base_list);

  if (books_to_show.length === 0) {
    cardBox.classList.add("hidden");
    noBooks.classList.remove("hidden");
    tableBody.innerHTML = "";
    cardBox.innerHTML = "";
    return;
  }

  noBooks.classList.add("hidden");
  cardBox.classList.remove("hidden");

  const td = "padding:10px;color:#CFE2FF;font-size:13px;";
  const btn = "border:none;border-radius:4px;cursor:pointer;font-size:12px;color:white;";
  let rows = "";
  let cards = "";
  for (let i = 0; i < books_to_show.length; i++) {
    const book = books_to_show[i];
    const age = calculateAge(book.publish_date);
    const category = getEra(book.publish_date);
    const realIndex = books.indexOf(book);
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
        <td style="padding:10px;white-space:nowrap;">
        <button onclick="showDetails(${realIndex})" style="${btn}padding:5px 10px;background:#37474F;margin-right:5px;">View</button>
        <button onclick="editBook(${realIndex})"   style="${btn}padding:5px 10px;background:#1565C0;margin-right:5px;">Edit</button>
        <button onclick="deleteBook(${realIndex})" style="${btn}padding:5px 10px;background:#B71C1C;">Delete</button>
        </td>
    </tr>
    `;
    const row_style = "display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1A3A5C;";
    const label_style = "color:#42A5FF;font-size:12px;font-weight:bold;";
    const value_style = "color:#CFE2FF;font-size:12px;text-align:right;";

    cards += `
    <div style="background:#0D2740;border:1px solid #1A3A5C;border-radius:8px;padding:16px;">
        <h3 style="color:#42A5FF;font-size:16px;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #1E88FF;">${book.title}</h3>
        <div style="${row_style}">
        <span style="${label_style}">Author</span>
        <span style="${value_style}">${book.author}</span>
        </div>
        <div style="${row_style}">
        <span style="${label_style}">ISBN</span>
        <span style="${value_style}">${book.isbn}</span>
        </div>
        <div style="${row_style}">
        <span style="${label_style}">Published</span>
        <span style="${value_style}">${book.publish_date}</span>
        </div>
        <div style="${row_style}">
        <span style="${label_style}">Age</span>
        <span style="${value_style}">${age} yrs</span>
        </div>
        <div style="${row_style}">
        <span style="${label_style}">Genre</span>
        <span style="${value_style}">${book.genre}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;margin-bottom:12px;">
        <span style="${label_style}">Era</span>
        <span style="${value_style}">${category}</span>
        </div>
        <div style="display:flex;gap:8px;">
        <button onclick="showDetails(${realIndex})" style="flex:1;padding:8px;background:#37474F;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">View</button>
        <button onclick="editBook(${realIndex})"   style="flex:1;padding:8px;background:#1565C0;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Edit</button>
        <button onclick="deleteBook(${realIndex})" style="flex:1;padding:8px;background:#B71C1C;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Delete</button>
        </div>
    </div>
    `;
  }
  tableBody.innerHTML = rows;
  cardBox.innerHTML = cards;
};

const simulate_server = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data) 
        resolve(data);
      else 
        reject("No data found");
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
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    await simulate_server(response);
    if (!response.ok) 
      throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    if (books.some(book => book.isbn === String(data.id))) {
        loadingMsg.classList.add("hidden");
        fetchError.textContent = "This book already exists in your list.";
        fetchError.classList.remove("hidden");
        return;
    }
    loadingMsg.classList.add("hidden");
    fetchResult.classList.remove("hidden");
    document.getElementById("fetchTitle").textContent = data.title;
    document.getElementById("fetchBody").textContent = data.body;
    fetchResult.dataset.title = data.title;
    fetchResult.dataset.id = data.id;
  } catch (error) {
    loadingMsg.classList.add("hidden");
    fetchError.textContent = `Failed to fetch: ${error.message}`;
    fetchError.classList.remove("hidden");
  }
};

const add_fetched_book = () => {
  const fetchResult = document.getElementById("fetchResult");
  const newBook = {
    title: fetchResult.dataset.title,
    author: "API Author",
    isbn: fetchResult.dataset.id,
    publish_date: "2026-06-11",
    genre: "Other",
  };
  books.push(newBook);
  fetchResult.classList.add("hidden");
  document.getElementById("fetchId").value = "";
  document.getElementById("successMsg").textContent = "Fetched book added to your list!";
  document.getElementById("successMsg").classList.remove("hidden");
  display_books();
};

const search_books = async () => {
  const search_term = document.getElementById("searchInput").value.trim().toLowerCase();
  const searchStatus = document.getElementById("searchStatus");
  if (search_term === "") {
    searchStatus.textContent = "Please type something to search.";
    return;
  }
  searchStatus.textContent = "Searching...";
  try {
    await simulate_server(search_term);
    const results = books.filter(book =>
      book.title.toLowerCase().includes(search_term) ||
      book.author.toLowerCase().includes(search_term)
    );
    filtered_books = results;
    if (results.length === 0)
      searchStatus.textContent = `No books found for "${search_term}".`;
    else 
      searchStatus.textContent = `Found ${results.length} book(s) for "${search_term}".`;
    display_books();
  } catch (error) {
    searchStatus.textContent = `Search failed: ${error.message}`;
  }
};

const clear_search = () => {
  filtered_books = null;
  document.getElementById("searchInput").value = "";
  document.getElementById("searchStatus").textContent = "";
  display_books();
};