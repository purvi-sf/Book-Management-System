import { Library } from "./library.js";
import { BookApp } from "./bookApp.js";

const library = new Library();
const app = new BookApp(library);

(window as any).app = app;

app.displayBooks();
