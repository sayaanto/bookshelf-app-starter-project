(() => {
    let books = [];

    function saveToLocalStorage() {
        localStorage.setItem("books", JSON.stringify(books));
    }

    function loadFromLocalStorage() {
        books = JSON.parse(localStorage.getItem("books")) || [];
        books = books.map(book => ({
            ...book,
            year: Number(book.year)
        }));
    }

    function dispatchBookChanged() {
        document.dispatchEvent(new Event("bookChanged"));
    }

    function renderBooks(filteredBooks = books) {
        const incompleteBookshelf = document.querySelector('[data-testid="incompleteBookList"]');
        const completeBookshelf = document.querySelector('[data-testid="completeBookList"]');

        incompleteBookshelf.innerHTML = "";
        completeBookshelf.innerHTML = "";

        filteredBooks.forEach((book) => {
            const bookElement = document.createElement("article");
            bookElement.classList.add("book_item");
            bookElement.setAttribute("data-bookid", book.id);
            bookElement.setAttribute("data-testid", "bookItem");

            const title = document.createElement("h2");
            title.innerText = book.title;
            title.setAttribute("data-testid", "bookItemTitle");
            bookElement.appendChild(title);

            const author = document.createElement("p");
            author.innerText = "Penulis: " + book.author;
            author.setAttribute("data-testid", "bookItemAuthor");
            bookElement.appendChild(author);

            const year = document.createElement("p");
            year.innerText = "Tahun: " + book.year;
            year.setAttribute("data-testid", "bookItemYear");
            bookElement.appendChild(year);

            const actionContainer = document.createElement("div");
            actionContainer.classList.add("action");

            const moveButton = document.createElement("button");
            moveButton.id = book.id;
            moveButton.classList.add("green");
            moveButton.innerText = book.isComplete ? "Belum Selesai Dibaca" : "Selesai Dibaca";
            moveButton.setAttribute("data-testid", "bookItemIsCompleteButton");
            moveButton.addEventListener("click", () => toggleBookStatus(book.id));

            const deleteButton = document.createElement("button");
            deleteButton.id = book.id;
            deleteButton.classList.add("red");
            deleteButton.innerText = "Hapus Buku";
            deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
            deleteButton.addEventListener("click", () => deleteBook(book.id));

            actionContainer.appendChild(moveButton);
            actionContainer.appendChild(deleteButton);
            bookElement.appendChild(actionContainer);

            if (book.isComplete) {
                completeBookshelf.appendChild(bookElement);
            } else {
                incompleteBookshelf.appendChild(bookElement);
            }
        });
    }

    function addBook(event) {
        event.preventDefault();

        const titleInput = document.querySelector('[data-testid="bookFormTitleInput"]');
        const authorInput = document.querySelector('[data-testid="bookFormAuthorInput"]');
        const yearInput = document.querySelector('[data-testid="bookFormYearInput"]');
        const isCompleteInput = document.querySelector('[data-testid="bookFormIsCompleteCheckbox"]');

        const newBook = {
            id: +new Date(),
            title: titleInput.value,
            author: authorInput.value,
            year: Number(yearInput.value), 
            isComplete: isCompleteInput.checked,
        };

        books.push(newBook);
        saveToLocalStorage();
        dispatchBookChanged();

        titleInput.value = "";
        authorInput.value = "";
        yearInput.value = "";
        isCompleteInput.checked = false;

        showNotification("Buku berhasil ditambahkan ke rak!");
    }

    function toggleBookStatus(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            books[bookIndex].isComplete = !books[bookIndex].isComplete;
            saveToLocalStorage();
            dispatchBookChanged();
        }
    }

    function deleteBook(bookId) {
        books = books.filter(book => book.id !== bookId);
        saveToLocalStorage();
        dispatchBookChanged();
        showNotification("Buku berhasil dihapus!");
    }

    function searchBook(event) {
        event.preventDefault();

        const searchInput = document.querySelector('[data-testid="searchBookFormTitleInput"]').value.toLowerCase();
        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchInput));

        if (filteredBooks.length > 0) {
            renderBooks(filteredBooks);
            showNotification("Pencarian selesai! Buku ditemukan.");
        } else {
            renderBooks([]);
            showNotification("Buku tidak ditemukan!");
        }
    }

    window.addEventListener("load", () => {
        loadFromLocalStorage();
        renderBooks();

        document.querySelector('[data-testid="bookForm"]').addEventListener("submit", addBook);
        document.querySelector('[data-testid="searchBookForm"]').addEventListener("submit", searchBook);
        document.addEventListener("bookChanged", () => renderBooks());
    });
})();

function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
