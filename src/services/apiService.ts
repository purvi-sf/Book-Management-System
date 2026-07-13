import { IApiBook, IApiService, IFetchResult } from "../types/interfaces.js";

// Returns a clean IFetchResult so BookApp never touches raw API data
export class ApiService implements IApiService {
  constructor(private url: string) {}

  async fetchBook(id: string): Promise<IFetchResult | null> {
    if (id === "" || Number(id) < 1 || Number(id) > 100) return null;

    const response = await fetch(`${this.url}?id=${id}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data: IApiBook[] = await response.json();
    const book = data[0];
    if (!book) throw new Error("Book not found");

    // Map API shape to our clean IFetchResult shape
    return {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishDate: book.publish_date,
      genre: book.genre,
      bookType: book.bookType ?? "EBook",
      fileSize: book.fileSize ?? "0",
      pageCount: book.pageCount ?? 0,
    };
  }
}