const API_URL = 'https://lsm9yozdp5.execute-api.us-east-1.amazonaws.com/dev/books';

// Fetch books from the API and display them
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        showNotification('Error fetching books.', 'error');
    }
}

// Display books in the book list
function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Clear previous content

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card'); // Apply the book-card class for styling

        bookCard.innerHTML = `
            <div class="book-content">
                <h2 class="book-title">${book.Title}</h2>
                <p><strong>Authors:</strong> ${book.Authors}</p>
                <p><strong>Publisher:</strong> ${book.Publisher}</p>
                <p><strong>Year:</strong> ${book.Year}</p>
            </div>
            <div class="book-actions">
                <button class="btn btn-edit" onclick="editBook('${book.book_id}', '${book.Title.replace(/'/g, "\\'")}', '${book.Authors.replace(/'/g, "\\'")}', '${book.Publisher.replace(/'/g, "\\'")}', '${book.Year}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteBook('${book.book_id}', '${book.Title.replace(/'/g, "\\'")}', '${book.Authors.replace(/'/g, "\\'")}', '${book.Publisher.replace(/'/g, "\\'")}', '${book.Year}')">Delete</button>
            </div>
        `;
        bookList.appendChild(bookCard);
    });
}

// Add a new book
async function addBook() {
    const confirmation = confirm("Are you sure you want to add this book?");
    if (confirmation) {
        const title = document.getElementById('add-title').value;
        const authors = document.getElementById('add-authors').value;
        const publisher = document.getElementById('add-publisher').value;
        const year = document.getElementById('add-year').value;
        const bookId = document.getElementById('add-book-id').value;

        if (!bookId) {
            showNotification('Book ID is required.', 'error');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ book_id: bookId, Title: title, Authors: authors, Publisher: publisher, Year: year })
            });
            if (response.ok) {
                showNotification('Book added successfully!', 'success');
                location.href = 'dashboard.html';
            } else {
                showNotification('Error adding book.', 'error');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            showNotification('Error adding book.', 'error');
        }
    }
}

// Update an existing book
async function updateBook() {
    const id = document.getElementById('edit-book-id').value;
    const title = document.getElementById('edit-title').value;
    const authors = document.getElementById('edit-authors').value;
    const publisher = document.getElementById('edit-publisher').value;
    const year = document.getElementById('edit-year').value;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Title: title, Authors: authors, Publisher: publisher, Year: year })
        });
        if (response.ok) {
            showNotification('Book updated successfully!', 'success');
            location.href = 'dashboard.html';
        } else {
            showNotification('Error updating book.', 'error');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        showNotification('Error updating book.', 'error');
    }
}

// Route to delete confirmation page
function deleteBook(book_id, title, authors, publisher, year) {
    localStorage.setItem('deleteBookId', book_id);
    localStorage.setItem('deleteBookTitle', title);
    localStorage.setItem('deleteBookAuthors', authors);
    localStorage.setItem('deleteBookPublisher', publisher);
    localStorage.setItem('deleteBookYear', year);
    location.href = 'delete-book.html';
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.className = '';
    notification.classList.add(type);
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Set up edit book page with existing data
function editBook(id, title, authors, publisher, year) {
    const confirmation = confirm("Are you sure you want to edit this book?");
    if (confirmation) {
        localStorage.setItem('editBookId', id);
        localStorage.setItem('editBookTitle', title);
        localStorage.setItem('editBookAuthors', authors);
        localStorage.setItem('editBookPublisher', publisher);
        localStorage.setItem('editBookYear', year);
        location.href = 'edit-book.html';
    }
}

// Populate edit book form on page load
function populateEditBookForm() {
    document.getElementById('edit-book-id').value = localStorage.getItem('editBookId');
    document.getElementById('edit-title').value = localStorage.getItem('editBookTitle');
    document.getElementById('edit-authors').value = localStorage.getItem('editBookAuthors');
    document.getElementById('edit-publisher').value = localStorage.getItem('editBookPublisher');
    document.getElementById('edit-year').value = localStorage.getItem('editBookYear');
    localStorage.clear();
}

// Populate delete book confirmation page with data
function populateDeleteBookPage() {
    const bookId = localStorage.getItem('deleteBookId');
    const title = localStorage.getItem('deleteBookTitle');
    const authors = localStorage.getItem('deleteBookAuthors');
    const publisher = localStorage.getItem('deleteBookPublisher');
    const year = localStorage.getItem('deleteBookYear');

    document.getElementById('book-title').textContent = title;
    document.getElementById('book-authors').textContent = authors;
    document.getElementById('book-publisher').textContent = publisher;
    document.getElementById('book-year').textContent = year;

    document.getElementById('confirm-delete').onclick = async function() {
        await deleteConfirmedBook(bookId);
    };
}

// Delete a confirmed book
async function deleteConfirmedBook(bookId) {
    try {
        const response = await fetch(`${API_URL}/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showNotification('Book deleted successfully!', 'success');
   //         location.href = 'dashboard.html'; // Redirect to the dashboard after deletion
        } else {
            const errorData = await response.json();
            throw new Error(`Error deleting book: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification(`Error deleting book: ${error.message}`, 'error');
    }
}

// Fetch books on initial load (only on index page)
if (document.body.contains(document.getElementById('book-list'))) {
    fetchBooks();
}

// Populate edit book form on edit book page
if (document.body.contains(document.getElementById('edit-book-id'))) {
    populateEditBookForm();
}

// Populate delete book confirmation page on delete-book.html
if (document.body.contains(document.getElementById('book-details'))) {
    populateDeleteBookPage();
}
