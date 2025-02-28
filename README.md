# BookFinder

A web application for searching and managing books using the Google Books API.

## Features

- Search for books using the Google Books API
- View detailed book information
- Add books to your personal reading list
- Featured books section
- Mobile-responsive design

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/BookFinder.git
   cd BookFinder
   ```

2. Set up your Google Books API key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Books API
   - Create credentials (API key)
   - Copy `config.template.js` to `config.js`
   - Replace `YOUR_API_KEY` with your actual Google Books API key

3. For local development:
   - Use a local web server (e.g., Live Server in VS Code)
   - Open `index.html` in your browser

## Deployment

### GitHub Pages

1. Fork this repository
2. Go to your repository settings
3. Under "Secrets and variables" > "Actions", add your Google Books API key:
   - Name: `GOOGLE_BOOKS_API_KEY`
   - Value: Your actual API key
4. Enable GitHub Pages in your repository settings
5. The GitHub Actions workflow will automatically deploy your site

### Manual Deployment

1. Build the project:
   - Ensure all files are in place
   - Make sure `config.js` is properly set up with your API key
2. Deploy to your web server
3. Ensure HTTPS is enabled for secure API access

## Development

### Project Structure

```
BookFinder/
├── index.html          # Main page
├── book.html          # Book details page
├── myBooks.html       # Reading list page
├── style.css         # Main styles
├── book.css          # Book details styles
├── script.js         # Main JavaScript
├── book.js           # Book details logic
├── featured-books.js # Featured books logic
├── config.js         # API configuration (gitignored)
└── config.template.js # Template for API configuration
```

### Adding New Features

1. Create a new branch for your feature
2. Implement the feature
3. Test thoroughly
4. Submit a pull request

## Security

- API key is stored securely and not committed to the repository
- GitHub Actions workflow injects the API key during deployment
- HTTPS required for API access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## License

MIT License - see LICENSE file for details
