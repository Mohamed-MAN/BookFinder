// book.js

// Initialize API key
let API_KEY;

// Function to initialize the API key
function initializeApiKey() {
    console.log('Initializing API key for book.js...');
    try {
        if (!window.CONFIG || !window.CONFIG.GOOGLE_BOOKS_API_KEY) {
            throw new Error('CONFIG or API key not found in window object');
        }
        API_KEY = window.CONFIG.GOOGLE_BOOKS_API_KEY;
        console.log('API key loaded successfully in book.js');
        return true;
    } catch (error) {
        console.error('Error loading API key:', error);
        document.getElementById('book-title').innerHTML = 'Error: API configuration is missing. Please check the setup instructions in the README.';
        return false;
    }
}

// Book Management Utility
const BookManager = {
    addToMyBooks: function(book) {
        // Get existing books or initialize empty array
        let myBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
        
        // Check if book already exists
        const bookExists = myBooks.some(b => b.id === book.id);
        if (bookExists) {
            alert('This book is already in your reading list!');
            return false;
        }
        
        // Create a simplified book object
        const bookToSave = {
            id: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors,
            coverImage: book.volumeInfo.imageLinks?.thumbnail || 'default-cover.jpg',
            addedDate: new Date().toISOString()
        };
        
        // Add book and save to localStorage
        myBooks.push(bookToSave);
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
        
        alert('Book added to My Books!');
        return true;
    },
    
    removeFromMyBooks: function(bookId) {
        let myBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
        myBooks = myBooks.filter(book => book.id !== bookId);
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    },
    
    getMyBooks: function() {
        return JSON.parse(localStorage.getItem('myBooks') || '[]');
    }
};

// Expose methods globally
function addToMyBooks(book) {
    return BookManager.addToMyBooks(book);
}

function removeFromMyBooks(bookId) {
    return BookManager.removeFromMyBooks(bookId);
}

function getMyBooks() {
    return BookManager.getMyBooks();
}

// Utility function to fetch data from Google Books API
async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${API_KEY}`);
        if (!response.ok) throw new Error("Book not found");
        return await response.json();
    } catch (error) {
        console.error("Error fetching book details:", error);
        return null;
    }
}

// Function to sanitize and format HTML description
function formatBookDescription(description) {
    if (!description) return 'No description available.';
    
    // Create a temporary div to help with HTML parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    
    // Remove excessive line breaks and trim
    let cleanedText = tempDiv.innerText.trim();
    
    // If the text is too long, truncate it
    if (cleanedText.length > 1000) {
        cleanedText = cleanedText.substring(0, 1000) + '...';
    }
    
    return cleanedText;
}

// Function to update the page with book details
async function displayBookDetails() {
    // Get the bookId from the URL query parameter
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("bookId");

    if (!bookId) {
        document.getElementById("book-title").innerText = "Book not found.";
        return;
    }

    // Fetch book details
    const book = await fetchBookDetails(bookId);

    if (book && book.volumeInfo) {
        const volumeInfo = book.volumeInfo;

        document.getElementById("book-title").innerText = volumeInfo.title || "Unknown Title";
        document.getElementById("book-author").innerText = volumeInfo.authors 
            ? volumeInfo.authors.join(", ") 
            : "Unknown Author";
        document.getElementById("book-published").innerText = volumeInfo.publishedDate 
            ? new Date(volumeInfo.publishedDate).toDateString() 
            : "Unknown Date";

        // Description handling
        const description = formatBookDescription(volumeInfo.description);
        document.getElementById("book-description").innerText = description;

        // Book cover
        const coverUrl = volumeInfo.imageLinks 
            ? volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail
            : "https://via.placeholder.com/300x450?text=No+Cover";
        document.getElementById("book-cover").src = coverUrl;

        // Add to My Books functionality
        document.getElementById('addToMyBooks').addEventListener('click', () => {
            BookManager.addToMyBooks(book);
        });
    } else {
        document.getElementById("book-title").innerText = "Book not found.";
    }
}

// Function to go back to the previous page
function goBack() {
    window.history.back();
}

// Initialize the app
function init() {
    if (initializeApiKey()) {
        displayBookDetails();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);