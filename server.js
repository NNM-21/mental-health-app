const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(morgan('dev'));

// Route 1 - Home
app.get('/', (req, res) => {
    res.send('Hello from MindSpace Express server!');
});

// Route 2 - Health check
app.get('/health', (req, res) => {
    res.send('Server theek chal raha hai!');
});

// MindSpace Posts Data
const posts = [
    {
        id: 1,
        title: "Feeling anxious lately",
        author: "patient1",
        status: "pending",
        isFlagged: false
    },
    {
        id: 2,
        title: "Need help with stress",
        author: "patient2",
        status: "approved",
        isFlagged: false
    }
];

// GET all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// GET only approved posts
app.get('/posts/approved', (req, res) => {
    const approved = posts.filter(p => p.status === "approved");
    res.json(approved);
});

app.listen(3000, () => {
    console.log(`MindSpace server running on http://localhost:3000`);
});