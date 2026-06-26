export function findItem(array, predicate) {
    return array.find(predicate);
}
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
//# sourceMappingURL=generics.js.map