const books = []; 
const current_yr = 2026;
let edit = null;  

const Form_Check = () => {
  let isValid = true;

  const title   = document.getElementById("title").value.trim();
  document.getElementById("titleError").style.display   = "none";
  document.getElementById("title").classList.remove("invalid");
  if (title === "") {
    document.getElementById("titleError").style.display = "block";
    document.getElementById("title").classList.add("invalid");
    isValid = false;
  }

  const author  = document.getElementById("author").value.trim();
  document.getElementById("authorError").style.display  = "none";
  document.getElementById("author").classList.remove("invalid");
  if (author === "") {
    document.getElementById("authorError").style.display = "block";
    document.getElementById("author").classList.add("invalid");
    isValid = false;
  }

  const isbn    = document.getElementById("isbn").value.trim();
  document.getElementById("isbnError").style.display = "none";
  document.getElementById("isbn").classList.remove("invalid");
  if (isbn === "" || isNaN(isbn)) {
    document.getElementById("isbnError").style.display = "block";
    document.getElementById("isbn").classList.add("invalid");
    isValid = false;
  }
  if(books.some(book => book.isbn === isbn)){
    alert("ISBN already exists");
    isValid=false;
  }

  const publish_date = document.getElementById("publish_date").value;
  document.getElementById("publish_dateError").style.display = "none";
  document.getElementById("publish_date").classList.remove("invalid");
  if (publish_date === "") {
    document.getElementById("publish_dateError").style.display = "block";
    document.getElementById("publish_date").classList.add("invalid");
    isValid = false;
  }

  const genre   = document.getElementById("genre").value.trim();  
  document.getElementById("genreError").style.display   = "none";
  document.getElementById("genre").classList.remove("invalid");
  if (genre === "") {
    document.getElementById("genreError").style.display = "block";
    document.getElementById("genre").classList.add("invalid");
    isValid = false;
  }

  return isValid;
};

const addBook = () => {
  const title   = document.getElementById("title").value.trim();
  const author  = document.getElementById("author").value.trim();
  const isbn    = document.getElementById("isbn").value.trim();
  const publish_date = document.getElementById("publish_date").value;
  const genre   = document.getElementById("genre").value.trim();

  const newBook = { title, author, isbn, publish_date, genre };
  books.push(newBook);

  document.getElementById("successMsg").textContent = "Book added successfully!";
  document.getElementById("successMsg").style.display = "block";

  clearForm();
  display_books();
};

const editBook = (index) => {
  const book = books[index];
  document.getElementById("title").value   = book.title;
  document.getElementById("author").value  = book.author;
  document.getElementById("isbn").value    = book.isbn;
  document.getElementById("publish_date").value = book.publish_date;
  document.getElementById("genre").value   = book.genre;
  edit = index;
  document.getElementById("formHeading").textContent   = "Edit Book";
  document.getElementById("submitBtn").textContent     = "Update Book";
  document.getElementById("cancelBtn").style.display   = "inline-block";
  document.getElementById("successMsg").style.display  = "none";
};

const updateBook = () => {
  books[edit] = {
    title:   document.getElementById("title").value.trim(),
    author:  document.getElementById("author").value.trim(),
    isbn:    document.getElementById("isbn").value.trim(),
    publish_date: document.getElementById("publish_date").value,
    genre:   document.getElementById("genre").value.trim(),
  };

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
  document.getElementById("formHeading").textContent  = "Add a New Book";
  document.getElementById("submitBtn").textContent    = "Add Book";
  document.getElementById("cancelBtn").style.display  = "none";
};

const clearForm = () => {
  document.getElementById("title").value   = "";
  document.getElementById("author").value  = "";
  document.getElementById("isbn").value    = "";
  document.getElementById("publish_date").value = "";
  document.getElementById("genre").value   = "";
};

const display_books = () => {
  const tableBody = document.getElementById("bookTableBody");
  const table     = document.getElementById("bookTable");
  const noBooks   = document.getElementById("noBooks");

  if (books.length === 0) {
    table.style.display   = "none";
    noBooks.style.display = "block";
    tableBody.innerHTML   = "";
    return;
  }

  table.style.display   = "table";
  noBooks.style.display = "none";

  let rows = "";
  for (let i = 0; i < books.length; i++) {
    const book     = books[i];
    const age      = calculateAge(book.publish_date);
    const category = getEra(book.publish_date);
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
          <button class="editBtn"   onclick="editBook(${i})">Edit</button>
          <button class="deleteBtn" onclick="deleteBook(${i})">Delete</button>
        </td>
      </tr>
    `;
  }
  tableBody.innerHTML = rows;
};