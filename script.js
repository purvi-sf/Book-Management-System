const books = []; 
const current_yr = 2026;
let edit = null;  
const field_ids = ["title", "author", "isbn", "publish_date", "genre"];
let filtered_books = null;

const Form_Check = () => {
  let isValid = true;
  const error_ids = ["titleError", "authorError", "isbnError", "publish_dateError", "genreError"];

  for (let i = 0; i < field_ids.length; i++) {
    document.getElementById(error_ids[i]).style.display = "none";
    document.getElementById(field_ids[i]).classList.remove("invalid");
    if (document.getElementById(field_ids[i]).value.trim()=== "") {
      document.getElementById(error_ids[i]).style.display = "block";
      document.getElementById(field_ids[i]).classList.add("invalid");
      isValid = false;
    }
  }
  if(edit === null && books.some(book => book.isbn === isbn)){
    alert("ISBN already exists");
    isValid=false;
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
  document.getElementById("successMsg").style.display = "block";

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
  document.getElementById("cancelBtn").style.display = "inline-block";
  document.getElementById("successMsg").style.display = "none";
};

const updateBook = () => {
  const updatedBook = {};
  for (let i = 0; i < field_ids.length; i++)
    updatedBook[field_ids[i]] = document.getElementById(field_ids[i]).value.trim();

  books[edit] = updatedBook;

  document.getElementById("successMsg").textContent = "Book updated successfully!";
  document.getElementById("successMsg").style.display = "block";

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
  else if(age<=228)
    return "Romanticism";
  else if(age<=426)
    return "The Enlightenment";
  else if(age<=526)
    return "The Renaissance";
  else if(age<=1526)
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
  document.getElementById("cancelBtn").style.display = "none";
};

const clearForm = () => {
  for (let i = 0; i < field_ids.length; i++)
    document.getElementById(field_ids[i]).value = "";
};

const display_books = () => {
  const tableBody     = document.getElementById("bookTableBody");
  const table         = document.getElementById("bookTable");
  const noBooks       = document.getElementById("noBooks");

  const books_to_show = filtered_books !== null ? filtered_books : books;

  if (books_to_show.length === 0) {
    table.style.display   = "none";
    noBooks.style.display = "block";
    tableBody.innerHTML   = "";
    return;
  }

  table.style.display   = "table";
  noBooks.style.display = "none";

  let rows = "";
  for (let i = 0; i < books_to_show.length; i++) {
    const book      = books_to_show[i];
    const age       = calculateAge(book.publish_date);
    const category  = getEra(book.publish_date);
    const realIndex = books.indexOf(book);

    rows += `
      <tr>
        <td>${i + 1}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.publish_date}</td>
        <td>${age} yrs</td>
        <td>${book.genre}</td>
        <td>${category}</td>
        <td>
          <button class="editBtn"   onclick="editBook(${realIndex})">Edit</button>
          <button class="deleteBtn" onclick="deleteBook(${realIndex})">Delete</button>
        </td>
      </tr>
    `;
  }
  tableBody.innerHTML = rows;
};

  const simulate_server = (data) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
        if (data) {
            resolve(data);
        } else {
            reject("No data found");
        }
        }, 1500);
    });
};

const fetch_book_from_api = async () => {
    const id          = document.getElementById("fetchId").value;
    const loadingMsg  = document.getElementById("loadingMsg");
    const fetchError  = document.getElementById("fetchError");
    const fetchResult = document.getElementById("fetchResult");

    if (id === "" || id < 1 || id > 100) {
        fetchError.textContent    = "Please enter a number between 1 and 100.";
        fetchError.style.display  = "block";
        fetchResult.style.display = "none";
        return;
    }

    fetchError.style.display  = "none";
    fetchResult.style.display = "none";
    loadingMsg.style.display  = "block";

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        await simulate_server(response);

        if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        loadingMsg.style.display  = "none";
        fetchResult.style.display = "block";

        document.getElementById("fetchTitle").textContent = data.title;
        document.getElementById("fetchBody").textContent  = data.body;

        fetchResult.dataset.title = data.title;
        fetchResult.dataset.id    = data.id;

    } catch (error) {
        loadingMsg.style.display = "none";
        fetchError.textContent   = `Failed to fetch: ${error.message}`;
        fetchError.style.display = "block";
    }
};

const add_fetched_book = () => {
    const fetchResult = document.getElementById("fetchResult");
    const newBook = {
        title:        fetchResult.dataset.title,
        author:       "API Author",
        isbn:         fetchResult.dataset.id,
        publish_date: "2024-01-01",
        genre:        "Other",
    };

    books.push(newBook);

    fetchResult.style.display = "none";
    document.getElementById("fetchId").value            = "";
    document.getElementById("successMsg").textContent   = "Fetched book added to your list!";
    document.getElementById("successMsg").style.display = "block";

    display_books();
};

const search_books = async () => {
  const search_term  = document.getElementById("searchInput").value.trim().toLowerCase();
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
