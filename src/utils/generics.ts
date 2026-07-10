//point of generics is to create functions that work with any type

import { IBook, SortOption, Genre, GENRES } from "../types/interfaces.js";

//T is just an arbitrary parameter like it could by anything 
export function filterItems<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

export function sortItems<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...array].sort(compareFn);
}

export function getSortedBooks(books: IBook[], sortBy: SortOption): IBook[] {
  const sorted = [...books];
  if (sortBy === "title") return sortItems(sorted, (a, b) => a.title.localeCompare(b.title));
  else if (sortBy === "author")
    return sortItems(sorted, (a, b) => a.author.localeCompare(b.author));
  else if (sortBy === "age_asc")
    return sortItems(sorted, (a, b) => a.calculateAge() - b.calculateAge());
  else if (sortBy === "age_desc")
    return sortItems(sorted, (a, b) => b.calculateAge() - a.calculateAge());
  else return sorted;
}

export function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Element with id "${id}" not found`);
  return el;
}
 
export function toSafeGenre(value: string): Genre {
  return (GENRES as readonly string[]).includes(value) ? value as Genre : "Other";
}
