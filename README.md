# PDF Viewer with Advanced Search

A modern, feature-rich PDF viewer built with React, TypeScript, and Vite. This application provides a seamless experience for viewing and searching through PDF documents with advanced highlighting capabilities.

## Features

- PDF document viewing with smooth page navigation
- Advanced text search with multiple keyword support
- Color-coded search results for different search terms
- Responsive design
- Fast and efficient rendering using PDF.js
- URL-based search state management

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **PDF Processing**: PDF.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React

## Performance Considerations

- Text highlighting is optimized to prevent unnecessary re-renders
- Search results are memoized to improve performance
- Page changes trigger delayed highlight updates to ensure proper rendering
- Search state is managed efficiently to prevent infinite update loops

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
