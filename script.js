// Debug loading order
console.log('script.js loading...');

// Function to check if config is loaded
function waitForConfig(maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        function checkConfig() {
            console.log('Checking for CONFIG, attempt:', attempts + 1);
            if (window.CONFIG) {
                console.log('CONFIG found:', window.CONFIG);
                resolve(window.CONFIG);
            } else if (attempts >= maxAttempts) {
                console.error('CONFIG not found after', maxAttempts, 'attempts');
                reject(new Error('CONFIG not found after maximum attempts'));
            } else {
                attempts++;
                setTimeout(checkConfig, 100);
            }
        }
        
        checkConfig();
    });
}

// Initialize API key
let API_KEY;

// Function to initialize the API key
async function initializeApiKey() {
    console.log('Initializing API key...');
    try {
        await waitForConfig();
        if (!window.CONFIG.GOOGLE_BOOKS_API_KEY) {
            console.error('API key not found in CONFIG:', window.CONFIG);
            throw new Error('API key not found in CONFIG object');
        }
        API_KEY = window.CONFIG.GOOGLE_BOOKS_API_KEY;
        console.log('API key loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading API key:', error);
        console.error('Error stack:', error.stack);
        console.error('window object keys:', Object.keys(window));
        document.getElementById('results').innerHTML = 'Error: API configuration is missing. Please check the console for more details.';
        return false;
    }
}

// Caching mechanism
const BookCache = {
    _cache: {},
    get: function(key) {
        console.log('Getting cache for key:', key);
        if (this._cache[key] && 
            (Date.now() - this._cache[key].timestamp) < 24 * 60 * 60 * 1000) {
            console.log('Cache hit for key:', key);
            return this._cache[key].data;
        }
        console.log('Cache miss for key:', key);
        return null;
    },
    set: function(key, data) {
        console.log('Setting cache for key:', key);
        this._cache[key] = {
            data: data,
            timestamp: Date.now()
        };
    },
    clear: function() {
        console.log('Clearing cache');
        const now = Date.now();
        for (let key in this._cache) {
            if ((now - this._cache[key].timestamp) > 24 * 60 * 60 * 1000) {
                console.log('Removing cache for key:', key);
                delete this._cache[key];
            }
        }
    }
};

// Pagination state
let currentPage = 1;
const booksPerPage = 10;
let totalBooks = 0;
let currentQuery = '';

// Initialize the app
function init() {
    console.log('Initializing app...');
    if (initializeApiKey()) {
        console.log('API key loaded, adding event listeners...');
        // Add event listeners only if API key is loaded
        document.getElementById('searchButton').addEventListener('click', () => {
            console.log('Search button clicked');
            const query = document.getElementById('searchInput').value;
            if (!query.trim()) {
                console.log('Empty search query');
                alert('Please enter a book title to search');
                return;
            }
            currentQuery = query;
            currentPage = 1;
            const featuredBooks = document.getElementById('featured-books');
            featuredBooks.style.display = 'none';
            searchBooks(query);
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            console.log('Search input keypress:', e.key);
            if (e.key === 'Enter') {
                console.log('Enter key pressed');
                const query = document.getElementById('searchInput').value;
                if (!query.trim()) {
                    console.log('Empty search query');
                    alert('Please enter a book title to search');
                    return;
                }
                currentQuery = query;
                currentPage = 1;
                const featuredBooks = document.getElementById('featured-books');
                featuredBooks.style.display = 'none';
                searchBooks(query);
            }
        });
    } else {
        console.log('API key not loaded, skipping event listeners');
    }
}

const searchBooks = (query, page = 1) => {
    console.log('Searching books for query:', query, 'page:', page);
    const startIndex = (page - 1) * booksPerPage;
    const cacheKey = `${query}_${page}`;
    
    // Check cache first
    const cachedData = BookCache.get(cacheKey);
    if (cachedData) {
        console.log('Using cached data for query:', query, 'page:', page);
        totalBooks = cachedData.totalItems;
        displayBooks(cachedData.items);
        createPagination();
        return;
    }
    
    console.log('Fetching from API for query:', query, 'page:', page);
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&startIndex=${startIndex}&maxResults=${booksPerPage}`)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Full API Response:', data);
            if (data.items) {
                // Cache the response
                BookCache.set(cacheKey, data);
                
                totalBooks = data.totalItems;
                displayBooks(data.items);
                createPagination();
            } else {
                console.log('No items found for query:', query, 'page:', page);
                document.getElementById('results').innerHTML = 'No books found.';
                document.getElementById('pagination').innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error fetching data for query:', query, 'page:', page, error);
            document.getElementById('results').innerHTML = `Error fetching books: ${error.message}`;
            document.getElementById('pagination').innerHTML = '';
        });
};

const displayBooks = (books) => {
    console.log('Displaying books:', books);
    const results = document.getElementById('results');
    results.innerHTML = '';
    console.log('Number of books:', books.length);
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book');
        
        const volumeInfo = book.volumeInfo;
        const coverUrl = volumeInfo.imageLinks 
            ? volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail
            : 'https://media.istockphoto.com/id/1055079680/vector/black-linear-photo-camera-like-no-image-available.jpg?s=612x612&w=0&k=20&c=P1DebpeMIAtXj_ZbVsKVvg-duuL0v9DlrOZUvPG6UJk=';
        
        bookElement.innerHTML = `
        <a href="book.html?bookId=${book.id}"><img src="${coverUrl}" alt="${volumeInfo.title}"></a>
        <h3>${volumeInfo.title}</h3>
        <p>By ${volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author'}</p>
        `;
        results.appendChild(bookElement);
    });
};

const createPagination = () => {
    console.log('Creating pagination');
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            console.log('Previous button clicked');
            currentPage--;
            searchBooks(currentQuery, currentPage);
        });
        paginationContainer.appendChild(prevButton);
    }

    // Page numbers
    for (let i = 1; i <= totalPages && i <= 5; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            console.log('Page button clicked:', i);
            currentPage = i;
            searchBooks(currentQuery, currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            console.log('Next button clicked');
            currentPage++;
            searchBooks(currentQuery, currentPage);
        });
        paginationContainer.appendChild(nextButton);
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', init);