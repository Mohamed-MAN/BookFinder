const CONFIG = {
    GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY || '${{ secrets.GOOGLE_BOOKS_API_KEY }}'
};

module.exports = CONFIG;