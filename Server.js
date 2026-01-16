// backend/server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './backend/data.json';

// Load data
let posts = [];
if (fs.existsSync(DATA_FILE)) {
    posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Get all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Add a post
app.post('/posts', (req, res) => {
    const { title, content, type } = req.body; // type: dog or cat
    const newPost = {
        id: Date.now(),
        title,
        content,
        type,
        votes: 0,
        comments: []
    };
    posts.unshift(newPost);
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    res.json(newPost);
});

// Add a comment
app.post('/posts/:id/comments', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { comment } = req.body;
    post.comments.push({ comment, id: Date.now() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    res.json(post);
});

// Upvote a post
app.post('/posts/:id/upvote', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.votes += 1;
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    res.json(post);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
