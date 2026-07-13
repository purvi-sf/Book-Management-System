export type BookType = "Printed" | "EBook";
export type SortOption = "none" | "title" | "author" | "age_asc" | "age_desc";
export const GENRES = ["Fiction", "Non-Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance", "Horror", "History", "Science", "Biography", "Other"] as const;
export type Genre = typeof GENRES[number];

export interface IBookCore {
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  genre: Genre;
  type: BookType;
}

export interface IBookCalculations {
  calculateAge(): number;
  getEra(): string;
  getDiscount(): number;
}

export interface IBookDisplay {
  getSummary(): string;
  getExtraInfo(): string;
}

export interface IBook extends IBookCore, IBookCalculations, IBookDisplay {}

export interface IPrintedBook extends IBook {
  pageCount: number;
  getReadingTime(): string;
}

export interface IEBook extends IBook {
  fileSize: string;
  getFileInfo(): string;
}

export interface ILibrary {
  books: IBook[];
  filteredBooks: IBook[] | null;
  addBook(book: IBook): void;
  updateBook(index: number, book: IBook): void;
  deleteBook(index: number): void;
  isbnExists(isbn: string): boolean;
  search(term: string): IBook[];
  clearSearch(): void;
  getSortedBooks(sortBy: SortOption): IBook[];
}

export interface IApiBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publish_date: string;
  genre: string;
  bookType: BookType;
  fileSize: string;
  pageCount: number;
}

export interface IFetchResult {
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  genre: string;
  bookType: BookType;
  fileSize: string;
  pageCount: number;
}

export interface IFormValues {
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  genre: Genre | "";
  bookType: BookType | "";
  extra: string;
}

export interface IBookFactory {
  createBook(values: IFormValues): IBook;
  createFromFetch(result: IFetchResult): IBook;
}

export interface IApiService {
  fetchBook(id: string): Promise<IFetchResult | null>;
}

export interface IFormService {
  getValues(): IFormValues;
  fillForm(book: IBook): void;
  clearForm(fieldIds: string[], extraIds: string[]): void;
  validate(fieldIds: string[], errorIds: string[]): boolean;
  validateBookType(): boolean;
}

export interface IBookCallbacks {
  onView: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export interface IDOMBuilder {
  createRow(label: string, value: string): HTMLElement;
  renderBookList(books: IBook[], library: ILibrary, callbacks: IBookCallbacks): void;
  renderDetail(book: IBook): void;
  showFetchPreview(result: IFetchResult): void;
  showFetchError(message: string): void;
  showFetchLoading(): void;
  hideFetchLoading(): void;
  setFormMode(mode: "add" | "edit"): void;
  showSuccess(message: string): void;
}