//point of generics is to create functions that work with any type
//T is just an arbitrary parameter like it could by anything 
export function filterItems(array, predicate) {
    return array.filter(predicate);
}
export function sortItems(array, compareFn) {
    return [...array].sort(compareFn);
}
export function getSortedBooks(books, sortBy) {
    const sorted = [...books];
    if (sortBy === "title")
        return sortItems(sorted, (a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "author")
        return sortItems(sorted, (a, b) => a.author.localeCompare(b.author));
    else if (sortBy === "age_asc")
        return sortItems(sorted, (a, b) => a.calculateAge() - b.calculateAge());
    else if (sortBy === "age_desc")
        return sortItems(sorted, (a, b) => b.calculateAge() - a.calculateAge());
    else
        return sorted;
}
export function getElement(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element with id "${id}" not found`);
    return el;
}
const VALID_GENRES = ["Fiction", "Non-Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance", "Horror", "History", "Science", "Biography", "Other"];
export function toSafeGenre(value) {
    return VALID_GENRES.includes(value) ? value : "Other";
}
//# sourceMappingURL=generics.js.map