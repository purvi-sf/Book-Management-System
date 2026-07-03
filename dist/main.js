import { Library } from "./services/library.js";
import { BookFactory } from "./services/bookFactory.js";
import { ApiService } from "./services/apiService.js";
import { FormService } from "./services/formService.js";
import { DOMBuilder } from "./utils/domBuilder.js";
import { BookApp } from "./app/bookApp.js";
const library = new Library();
const factory = new BookFactory();
const apiService = new ApiService("https://6a33db358248ee962fa48cc7.mockapi.io/books/books");
const formService = new FormService();
const domBuilder = new DOMBuilder();
const app = new BookApp(library, factory, apiService, formService, domBuilder);
app.displayBooks();
//# sourceMappingURL=main.js.map