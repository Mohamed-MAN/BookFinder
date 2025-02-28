// Initialize API key
let API_KEY;

// Function to initialize the API key
function initializeApiKey() {
    console.log('Initializing API key for featured-books.js...');
    try {
        if (!window.CONFIG || !window.CONFIG.GOOGLE_BOOKS_API_KEY) {
            throw new Error('CONFIG or API key not found in window object');
        }
        API_KEY = window.CONFIG.GOOGLE_BOOKS_API_KEY;
        console.log('API key loaded successfully in featured-books.js');
        return true;
    } catch (error) {
        console.error('Error loading API key:', error);
        document.getElementById('featured-books-grid').innerHTML = 'Error: API configuration is missing. Please check the setup instructions in the README.';
        return false;
    }
}

// Function to fetch featured books from Google Books API
async function fetchFeaturedBooks() {
    const searchTerms = [
        'bestseller fiction',
        'atomic habits',
        'الهشاشة النفسية',
        'A Smarter Way to Learn JavaScript',
    ];

    const featuredBooksGrid = document.getElementById('featured-books-grid');
    if (!featuredBooksGrid) return;

    // Clear any existing content
    featuredBooksGrid.innerHTML = 'Loading featured books...';

    try {
        const booksPromises = searchTerms.map(async (term) => {
            try {
                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&key=${API_KEY}&maxResults=1`);
                
                // Check for rate limiting
                if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                }

                const data = await response.json();
                
                // Check if books exist
                if (data.items && data.items.length > 0) {
                    return data.items[0];
                }
                return null;
            } catch (error) {
                console.error(`Error fetching book for term "${term}":`, error);
                return null;
            }
        });

        const books = await Promise.all(booksPromises);

        // Clear loading message
        featuredBooksGrid.innerHTML = '';

        // Create book cards
        books.forEach(book => {
            if (!book) return;

            const bookInfo = book.volumeInfo;
            const bookElement = document.createElement('div');
            bookElement.classList.add('featured-book');
            bookElement.innerHTML = `
                <a href="book.html?bookId=${book.id}">
                    <img src="${bookInfo.imageLinks?.thumbnail || 'default-book-cover.jpg'}" 
                         alt="${bookInfo.title} cover">
                </a>
                <h3>${bookInfo.title}</h3>
                <p>By ${bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author'}</p>
            `;
            featuredBooksGrid.appendChild(bookElement);
        });

        // If no books found, show a message
        if (featuredBooksGrid.children.length === 0) {
            featuredBooksGrid.innerHTML = 'No featured books available at the moment.';
        }
    } catch (error) {
        console.error('Error fetching featured books:', error);
        featuredBooksGrid.innerHTML = 'Failed to load featured books. Please try again later.';
    }
}

// Implement exponential backoff for retrying
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            
            if (response.status === 429) {
                // Wait with exponential backoff
                const waitTime = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            return response;
        } catch (error) {
            if (attempt === maxRetries) throw error;
        }
    }
}

// Initialize the app
function init() {
    if (initializeApiKey()) {
        fetchFeaturedBooks();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);