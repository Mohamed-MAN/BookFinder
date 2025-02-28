// Initialize API key
let API_KEY;

// Function to initialize the API key
async function initializeApiKey() {
    try {
        const module = await import('./config.js');
        API_KEY = module.default.GOOGLE_BOOKS_API_KEY;
        if (!API_KEY) {
            throw new Error('API key is undefined');
        }
    } catch (error) {
        console.error('Error loading API key:', error);
        document.getElementById('results').innerHTML = 'Error: API configuration is missing. Please check the setup instructions in the README.';
        return false;
    }
    return true;
}

// Caching mechanism
const BookCache = {
    _cache: {},
    get: function(key) {
        if (this._cache[key] && 
            (Date.now() - this._cache[key].timestamp) < 24 * 60 * 60 * 1000) {
            return this._cache[key].data;
        }
        return null;
    },
    set: function(key, data) {
        this._cache[key] = {
            data: data,
            timestamp: Date.now()
        };
    },
    clear: function() {
        const now = Date.now();
        for (let key in this._cache) {
            if ((now - this._cache[key].timestamp) > 24 * 60 * 60 * 1000) {
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
async function init() {
    const apiKeyLoaded = await initializeApiKey();
    if (apiKeyLoaded) {
        // Add event listeners only if API key is loaded
        document.getElementById('searchButton').addEventListener('click', () => {
            const query = document.getElementById('searchInput').value;
            if (!query.trim()) {
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
            if (e.key === 'Enter') {
                const query = document.getElementById('searchInput').value;
                if (!query.trim()) {
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
    }
}

const searchBooks = (query, page = 1) => {
    const startIndex = (page - 1) * booksPerPage;
    const cacheKey = `${query}_${page}`;
    
    // Check cache first
    const cachedData = BookCache.get(cacheKey);
    if (cachedData) {
        console.log('Using cached data');
        totalBooks = cachedData.totalItems;
        displayBooks(cachedData.items);
        createPagination();
        return;
    }
    
    console.log('Fetching from API');
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
                console.log('No items found');
                document.getElementById('results').innerHTML = 'No books found.';
                document.getElementById('pagination').innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('results').innerHTML = `Error fetching books: ${error.message}`;
            document.getElementById('pagination').innerHTML = '';
        });
};

const displayBooks = (books) => {
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
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
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
            currentPage++;
            searchBooks(currentQuery, currentPage);
        });
        paginationContainer.appendChild(nextButton);
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', init);