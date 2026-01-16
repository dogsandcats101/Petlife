const postsContainer = document.getElementById('posts-container');
const createBtn = document.getElementById('create-post');
let posts = [];
let filterType = 'all';
let sortType = 'new';

// Fetch posts
async function fetchPosts() {
  const res = await fetch('http://localhost:3000/posts');
  posts = await res.json();
  renderPosts();
}

// Render posts
function renderPosts() {
  let filtered = posts;
  if(filterType !== 'all') filtered = posts.filter(p => p.type === filterType);
  if(sortType === 'top') filtered = [...filtered].sort((a,b) => b.votes - a.votes);
  if(sortType === 'new') filtered = [...filtered].sort((a,b) => b.id - a.id);

  postsContainer.innerHTML = '';
  filtered.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <div class="post-header">
        <h3>${post.title} (${post.type})</h3>
        <span class="votes">${post.votes} ▲▼</span>
      </div>
      <p>${post.content}</p>
      ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
      <div class="buttons">
        <button class="upvote">Upvote</button>
        <button class="downvote">Downvote</button>
        <button class="toggle-comments">Comments (${post.comments.length})</button>
      </div>
      <div class="comments" style="display:none;">
        ${post.comments.map(c => `<p>- ${c.comment}</p>`).join('')}
        <input class="comment-input" placeholder="Add comment">
        <button class="comment-btn">Comment</button>
      </div>
    `;
    // Upvote
    div.querySelector('.upvote').onclick = async () => {
      await fetch(`http://localhost:3000/posts/${post.id}/upvote`, { method:'POST' });
      fetchPosts();
    };
    // Downvote
    div.querySelector('.downvote').onclick = async () => {
      await fetch(`http://localhost:3000/posts/${post.id}/downvote`, { method:'POST' });
      fetchPosts();
    };
    // Toggle comments
    div.querySelector('.toggle-comments').onclick = () => {
      const com = div.querySelector('.comments');
      com.style.display = com.style.display === 'none' ? 'block' : 'none';
    };
    // Add comment
    div.querySelector('.comment-btn').onclick = async () => {
      const input = div.querySelector('.comment-input');
      if(!input.value) return;
      await fetch(`http://localhost:3000/posts/${post.id}/comments`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({comment: input.value})
      });
      input.value='';
      fetchPosts();
    };
    postsContainer.appendChild(div);
  });
}

// Create post
createBtn.onclick = async () => {
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const image = document.getElementById('post-image').value;
  const type = document.getElementById('post-type').value;
  if(!title || !content) return;
  await fetch('http://localhost:3000/posts',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({title, content, type, image})
  });
  document.getElementById('post-title').value='';
  document.getElementById('post-content').value='';
  document.getElementById('post-image').value='';
  fetchPosts();
};

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    filterType = btn.dataset.type;
    renderPosts();
  };
});

// Sorting
document.getElementById('sort-new').onclick = () => { sortType='new'; renderPosts(); };
document.getElementById('sort-top').onclick = () => { sortType='top'; renderPosts(); };

fetchPosts();
