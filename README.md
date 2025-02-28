# BookFinder App

A web application to search and manage your book collection.

## Features

- **Book Search**: Search for books by title, author, or keywords
- **Detailed Book Information**: View comprehensive book details including:
  - Title and author
  - Cover images
  - Descriptions
  - Publication details
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **User-friendly Interface**: Clean and intuitive design for easy navigation

## Setup Instructions

1. Clone the repository
2. Copy `config.template.js` to `config.js`
3. Get your API key from [Google Books API](https://developers.google.com/books/docs/v1/using)
4. Replace `YOUR_API_KEY_HERE` in `config.js` with your actual API key

## Environment Variables for GitHub Pages

To deploy this project on GitHub Pages while keeping your API key secure:

1. Go to your GitHub repository settings
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add a new secret with:
   - Name: `API_KEY`
   - Value: Your actual API key

## Deployment

The app uses GitHub Actions to automatically deploy to GitHub Pages while keeping the API key secure. The workflow will:
1. Build the project
2. Replace the API key placeholder with the secret during build
3. Deploy to GitHub Pages

Never commit your actual API key to the repository!

## Technologies Used

- Frontend: React.js
- Styling: CSS
- Book Data: Google Books API
