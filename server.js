const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const booksFile = path.join(__dirname, 'books.json');

// Check if the JSON file exists, if not, create it with an empty array
const initializeBooksFile = () => {
    if (!fs.existsSync(booksFile)) {
        fs.writeFileSync(booksFile, JSON.stringify([], null, 2), 'utf8');
        console.log('books.json file created');
    }
};

// Read books from the JSON file
const readBooksFromFile = () => {
    try {
        const data = fs.readFileSync(booksFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Write books to the JSON file
const writeBooksToFile = (books) => {
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2), 'utf8');
};

// Validate ISBN
const isValidISBN = (isbn) => /^\d{13}$/.test(isbn);

// GET all books
app.get("/books", (req, res) => {
    const books = readBooksFromFile();
    res.status(200).json(books);
});

// GET book by ISBN
app.get("/books/:isbn", (req, res) => {
    const books = readBooksFromFile();
    const book = books.find(book => book.isbn === req.params.isbn);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
});

// POST new book
app.post("/books", (req, res) => {
    const { title, author, publisher, publishedDate, isbn } = req.body;

    if (!title || !author || !publisher || !publishedDate || !isbn || !isValidISBN(isbn)) {
        return res.status(400).json({ message: "All fields are required and ISBN must be a valid 13-digit number" });
    }

    const books = readBooksFromFile();

    // Check if ISBN already exists
    const existingBook = books.find(book => book.isbn === isbn);
    if (existingBook) {
        return res.status(400).json({ message: "Book with this ISBN already exists" });
    }

    const newBook = { title, author, publisher, publishedDate, isbn };
    books.push(newBook);
    writeBooksToFile(books);

    res.status(201).json(newBook);
});

// PUT update book by ISBN
app.put("/books/:isbn", (req, res) => {
    const { title, author, publisher, publishedDate } = req.body;
    const isbn = req.params.isbn;

    const books = readBooksFromFile();
    const bookIndex = books.findIndex(book => book.isbn === isbn);

    if (bookIndex === -1) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!title || !author || !publisher || !publishedDate) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const updatedBook = { ...books[bookIndex], title, author, publisher, publishedDate };
    books[bookIndex] = updatedBook;
    writeBooksToFile(books);

    res.status(200).json(updatedBook);
});

// DELETE book by ISBN
app.delete("/books/:isbn", (req, res) => {
    const books = readBooksFromFile();
    const bookIndex = books.findIndex(book => book.isbn === req.params.isbn);

    if (bookIndex === -1) {
        return res.status(404).json({ message: "Book not found" });
    }

    books.splice(bookIndex, 1);
    writeBooksToFile(books);

    res.status(204).send();
});

// Start the server
app.listen(port, () => {
    initializeBooksFile(); 
    console.log(`Server is running on port ${port}`);
});
