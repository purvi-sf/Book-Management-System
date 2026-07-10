import { IApiBook, IApiService, IFetchResult } from "../types/interfaces.js";

// Returns a clean IFetchResult so BookApp never touches raw API data
export class ApiService implements IApiService {
  constructor(private url: string) {}

  async fetchBook(id: string): Promise<IFetchResult | null> {
    if (id === "" || Number(id) < 1 || Number(id) > 100) return null;

    const response = await fetch(this.url);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const allBooks: IApiBook[] = await response.json();
    const data = allBooks[Number(id) - 1];
    if (!data) throw new Error("Book not found");

    // Map API shape to our clean IFetchResult shape
    return {
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      publishDate: data.publish_date,
      genre: data.genre,
      bookType: data.bookType   ?? "EBook",
      fileSize: data.fileSize   ?? "0",
      pageCount: data.pageCount  ?? 0,
    };
  }
}