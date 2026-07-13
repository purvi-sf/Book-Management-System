import { IDOMBuilder, IBook, ILibrary, IBookCallbacks, IFetchResult } from "../types/interfaces.js";
import { getElement } from "../utils/generics.js";

export class DOMBuilder implements IDOMBuilder {

  private readonly fetchErrorEl = getElement<HTMLElement>("fetchError");
  private readonly loadingMsgEl = getElement<HTMLElement>("loadingMsg");
  private readonly fetchResultEl = getElement<HTMLElement>("fetchResult");
  
  createRow(labelText: string, value: string): HTMLElement {
    const p = document.createElement("p");
    p.className = "text-[var(--text-light)] text-sm mb-2";
    const span = document.createElement("span");
    span.className = "text-[var(--blue-light)] font-bold";
    span.textContent = labelText + ": ";
    p.appendChild(span);
    p.appendChild(document.createTextNode(value));
    return p;
  }

  private createTd(text: string): HTMLElement {
    const td = document.createElement("td");
    td.className = "p-2.5 text-[var(--text-light)] text-xs";
    td.textContent = text;
    return td;
  }

  private createBtn(text: string, bg: string, hoverBg: string, onClick: () => void): HTMLElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `border-none rounded cursor-pointer text-xs text-white px-2.5 py-1 mr-1 ${bg} ${hoverBg}`;
    btn.addEventListener("click", onClick);
    return btn;
  }

  private createCardBtn(text: string, bg: string, onClick: () => void): HTMLElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `flex-1 py-2 rounded text-white text-xs cursor-pointer border-none ${bg}`;
    btn.addEventListener("click", onClick);
    return btn;
  }

  private createCardRow(labelText: string, value: string): HTMLElement {
    const row = document.createElement("div");
    row.className = "flex justify-between py-2 border-b border-[var(--border)]";
    const label = document.createElement("span");
    label.className = "text-[var(--blue-light)] text-xs font-bold";
    label.textContent = labelText;
    const val = document.createElement("span");
    val.className = "text-[var(--text-light)] text-xs";
    val.textContent = value;
    row.appendChild(label);
    row.appendChild(val);
    return row;
  }

  private createDiscountBadge(discount: number): HTMLElement {
    const badge = document.createElement("span");
    badge.className = "bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded whitespace-nowrap";
    badge.textContent = discount + "% off";
    return badge;
  }

  renderDetail(book: IBook): void {
    getElement<HTMLElement>("detailTitle").textContent = book.title;
    const detailBody = getElement<HTMLElement>("detailBody");
    detailBody.innerHTML = "";

    const rows: [string, string][] = [
      ["Summary",   book.getSummary()],
      ["Author",    book.author],
      ["ISBN",      book.isbn],
      ["Published", book.publishDate],
      ["Age",       book.calculateAge() + " years"],
      ["Genre",     book.genre],
      ["Era",       book.getEra()],
      ["Discount",  book.getDiscount() + "%"],
      ["Type",      book.type],
      ["Info",      book.getExtraInfo()],
    ];

    rows.forEach(([label, value]) => {
      detailBody.appendChild(this.createRow(label, value));
    });
    getElement<HTMLElement>("detailModal").classList.remove("hidden");
  }

  showFetchPreview(result: IFetchResult): void {
    getElement<HTMLElement>("fetchTitle").textContent = result.title;
    getElement<HTMLElement>("fetchBody").textContent = `Author: ${result.author} | Genre: ${result.genre} | Published: ${result.publishDate} | Type: ${result.bookType}`;
    getElement<HTMLElement>("fetchResult").classList.remove("hidden");
  }

  showFetchError(message: string): void {
    this.fetchErrorEl.textContent = message;
    this.fetchErrorEl.classList.remove("hidden");
    this.loadingMsgEl.classList.add("hidden");
    this.fetchResultEl.classList.add("hidden");
  }

  showFetchLoading(): void {
    this.loadingMsgEl.classList.remove("hidden");
    this.fetchErrorEl.classList.add("hidden");
    this.fetchResultEl.classList.add("hidden");
  }

  hideFetchLoading(): void {
    getElement<HTMLElement>("loadingMsg").classList.add("hidden");
  }

  setFormMode(mode: "add" | "edit"): void {
    const isEdit = mode === "edit";
    getElement<HTMLElement>("formHeading").textContent = isEdit ? "Edit Book"      : "Add a New Book";
    getElement<HTMLElement>("submitBtn").textContent = isEdit ? "Update Book"    : "Add Book";
    getElement<HTMLElement>("cancelBtn").classList.toggle("hidden", !isEdit);
    getElement<HTMLElement>("successMsg").classList.add("hidden");
  }

  showSuccess(message: string): void {
    const msg = getElement<HTMLElement>("successMsg");
    msg.textContent = message;
    msg.classList.remove("hidden");
  }

  renderBookList(books: IBook[], library: ILibrary, callbacks: IBookCallbacks): void {
    const tableBody = getElement<HTMLElement>("bookTableBody");
    const cardBox = getElement<HTMLElement>("bookCards");
    const noBooks = getElement<HTMLElement>("noBooks");

    if (books.length === 0) {
      noBooks.classList.remove("hidden");
      cardBox.classList.add("hidden");
      tableBody.innerHTML = "";
      cardBox.innerHTML = "";
      return;
    }

    noBooks.classList.add("hidden");
    cardBox.classList.remove("hidden");
    tableBody.innerHTML = "";
    cardBox.innerHTML = "";

    const indexMap = new Map<IBook, number>();
    library.books.forEach((book,i)=>indexMap.set(book,i));

    books.forEach((book, i) => {
      const realIndex = indexMap.get(book) ?? i;
      tableBody.appendChild(this.buildTableRow(book, i, realIndex, callbacks));
      cardBox.appendChild(this.buildCard(book, realIndex, callbacks));
    });
  }

  private createDiscountCell(discount: number): HTMLElement {
    const el = document.createElement("span");
    if (discount > 0)
      el.appendChild(this.createDiscountBadge(discount));
    else 
      el.textContent = "—";
    return el;
  }

  private buildTableRow(book: IBook, index: number, realIndex: number, callbacks: IBookCallbacks): HTMLElement {
    const discount = book.getDiscount();
    const tr = document.createElement("tr");
    tr.className = "border-b border-[var(--border)] hover:bg-[var(--bg-hover)]";

    [String(index + 1), book.title, book.author, book.isbn,
     book.publishDate, book.calculateAge() + " yrs",
     book.genre, book.getEra(), book.type
    ].forEach((cell) => tr.appendChild(this.createTd(cell)));

    const discountTd = document.createElement("td");
    discountTd.className = "p-2.5 text-[var(--text-light)] text-xs";
    discountTd.appendChild(this.createDiscountCell(discount));
    tr.appendChild(discountTd);

    const actionTd = document.createElement("td");
    actionTd.className = "p-2.5 whitespace-nowrap";
    actionTd.appendChild(this.createBtn("View",   "bg-[var(--grey)]",      "hover:bg-[var(--grey-dark)]", () => { callbacks.onView(realIndex); }));
    actionTd.appendChild(this.createBtn("Edit",   "bg-[var(--blue-dark)]", "hover:bg-[var(--blue-main)]", () => { callbacks.onEdit(realIndex); }));
    actionTd.appendChild(this.createBtn("Delete", "bg-[var(--red-dark)]",  "hover:bg-[var(--red)]",       () => { callbacks.onDelete(realIndex); }));
    tr.appendChild(actionTd);
    return tr;
  }

  private buildCard(book: IBook, realIndex: number, callbacks: IBookCallbacks): HTMLElement {
    const discount = book.getDiscount();
    const card = document.createElement("div");
    card.className = "bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4";

    const cardTitle = document.createElement("h3");
    cardTitle.className = "text-[var(--blue-light)] text-base font-bold mb-3 pb-2 border-b-2 border-[var(--blue-main)]";
    cardTitle.textContent = book.title;
    card.appendChild(cardTitle);

    const cardRows: [string, string][] = [
      ["Author",    book.author],
      ["ISBN",      book.isbn],
      ["Published", book.publishDate],
      ["Age",       book.calculateAge() + " yrs"],
      ["Genre",     book.genre],
      ["Era",       book.getEra()],
      ["Type",      book.type],
    ];
    cardRows.forEach(([label, value]) => card.appendChild(this.createCardRow(label, value)));

    const discountRow = document.createElement("div");
    discountRow.className = "flex justify-between py-2 mb-3";
    const discountLabel = document.createElement("span");
    discountLabel.className = "text-[var(--blue-light)] text-xs font-bold";
    discountLabel.textContent = "Discount";
    const discountVal = document.createElement("span");
    discountVal.className = "text-[var(--text-light)] text-xs";
    discountVal.appendChild(this.createDiscountCell(discount));
    discountRow.appendChild(discountLabel);
    discountRow.appendChild(discountVal);
    card.appendChild(discountRow);

    const cardActions = document.createElement("div");
    cardActions.className = "flex gap-2";
    cardActions.appendChild(this.createCardBtn("View",   "bg-[var(--grey)]",      () => { callbacks.onView(realIndex); }));
    cardActions.appendChild(this.createCardBtn("Edit",   "bg-[var(--blue-dark)]", () => { callbacks.onEdit(realIndex); }));
    cardActions.appendChild(this.createCardBtn("Delete", "bg-[var(--red-dark)]",  () => { callbacks.onDelete(realIndex); }));
    card.appendChild(cardActions);
    return card;
  }
}