class BookTracker {
    constructor() {
        // Existing statuses
        this.STATUSES = {
            NOT_STARTED: 'Not Started',
            READING: 'Currently Reading',
            COMPLETED: 'Completed',
            ON_HOLD: 'On Hold',
            ABANDONED: 'Abandoned'
        };
    }

    displayMyBooks() {
        const myBooks = getMyBooks();
        const myBooksList = document.getElementById('myBooksList');
        const emptyState = document.getElementById('emptyState');

        // Clear previous content
        myBooksList.innerHTML = '';

        if (myBooks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        myBooks.forEach(book => {
            // Prioritize different image sources
            const coverImage = 
                book.coverImage || 
                book.volumeInfo?.imageLinks?.thumbnail || 
                './default-cover.jpg';

            const bookElement = document.createElement('div');
            bookElement.classList.add('book');
            
            bookElement.innerHTML = `
                <img src="${coverImage}" alt="${book.title || 'Unknown Title'}" onerror="this.src='./default-cover.jpg'">
                <h3>${book.title || 'Unknown Title'}</h3>
                <p>By ${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                <div class="book-actions">
                    <button onclick="bookTracker.removeBook('${book.id}')">Remove</button>
                </div>
            `;
            
            myBooksList.appendChild(bookElement);
        });
    }

    updateBookStatus(bookId, newStatus) {
        let myBooks = getMyBooks();
        const bookIndex = myBooks.findIndex(book => book.id === bookId);
        
        if (bookIndex !== -1) {
            myBooks[bookIndex].status = newStatus;
            localStorage.setItem('myBooks', JSON.stringify(myBooks));
            this.displayMyBooks(); // Refresh the display
        }
    }

    removeBook(bookId) {
        removeFromMyBooks(bookId);
        this.displayMyBooks(); // Refresh the display
    }
}

// Initialize BookTracker with all features
const bookTracker = new BookTracker();

// Run when the page loads
document.addEventListener('DOMContentLoaded', () => {
    bookTracker.displayMyBooks();
});