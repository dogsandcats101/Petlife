// backend/server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = "./backend/data.json";

// Load existing posts or start empty
let posts = [];
if (fs.existsSync(DATA_FILE)) {
  posts = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Save posts to file
function savePosts() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

// --- ROUTES ---

// Get all posts, with optional filters: category, search, sort
app.get("/posts", (req, res) => {
  let result = [...posts];

  // Filter by category
  if (req.query.category) {
    result = result.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
  }

  // Filter by search keyword in title/content
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(search) || p.content.toLowerCase().includes(search)
    );
  }

  // Sort posts
  if (req.query.sort === "top") {
    result.sort((a, b) => b.votes - a.votes);
  } else { // default newest first
    result.sort((a, b) => b.id - a.id);
  }

  res.json(result);
});

// Create new post
app.post("/posts", (req, res) => {
  const { title, content, category, image } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Missing required fields (title, content, category)" });
  }

  const newPost = {
    id: Date.now(), // unique ID
    title,
    content,
    category, // "Dogs", "Cats", etc.
    image: image || null,
    votes: 0,
    comments: []
  };

  posts.unshift(newPost);
  savePosts();

  res.status(201).json(newPost);
});

// Edit a post
app.put("/posts/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const { title, content, category, image } = req.body;
  post.title = title || post.title;
  post.content = content || post.content;
  post.category = category || post.category;
  post.image = image || post.image;

  savePosts();
  res.json(post);
});

// Delete a post
app.delete("/posts/:id", (req, res) => {
  const index = posts.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post not found" });

  posts.splice(index, 1);
  savePosts();
  res.json({ message: "Post deleted" });
});

// Upvote a post
app.post("/posts/:id/upvote", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.votes += 1;
  savePosts();
  res.json(post);
});

// Downvote a post
app.post("/posts/:id/downvote", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.votes -= 1;
  savePosts();
  res.json(post);
});

// Add a comment
app.post("/posts/:id/comments", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: "Comment is required" });

  const newComment = { id: Date.now(), comment };
  post.comments.push(newComment);
  savePosts();

  res.json(post);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

