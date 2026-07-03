//decorator : wraps around a function and adds behaviour but doesnt change the og function
//target is the class in which the method belongs
//key is the method name
//descriptor.value is the actual function only
export function Log(target, key, descriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args) {
        console.log(`[LOG] ${key} called with:`, args);
        const result = original.apply(this, args); //apply is used because this refers to lib instance
        console.log(`[LOG] ${key} returned:`, result);
        return result;
    };
    return descriptor;
}
export function ValidateBook(target, key, descriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args) {
        for (const arg of args) {
            if (arg !== null && arg !== undefined && typeof arg === "object") {
                const bookObj = arg;
                const invalidFields = Object.entries(bookObj)
                    .filter(([, value]) => value === null || value === undefined || value === "")
                    .map(([field]) => field);
                if (invalidFields.length > 0) {
                    console.warn(`[VALIDATE_BOOK] ${key} — empty fields: ${invalidFields.join(", ")}`);
                }
            }
        }
        return original.apply(this, args);
    };
    return descriptor;
}
//# sourceMappingURL=decorators.js.map