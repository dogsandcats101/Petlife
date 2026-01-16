const postsContainer = document.getElementById('posts-container');
const createBtn = document.getElementById('create-post');

async function fetchPosts() {
    const res = await fetch('http://localhost:3000/posts');
    const posts = await res.json();
    renderPosts(posts);
}

function renderPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
            <h3>${post.title} (${post.type})</h3>
            <p>${post.content}</p>
            <span class="votes">▲ ${post.votes}</span>
            <div class="comments">
                <h4>Comments</h4>
                <div>${post.comments.map(c => `<p>- ${c.comment}</p>`).join('')}</div>
                <input placeholder="Add comment" class="comment-input">
                <button class="comment-btn">Comment</button>
            </div>
        `;
        // Upvote
        div.querySelector('.votes').onclick = async () => {
            await fetch(`http://localhost:3000/posts/${post.id}/upvote`, { method: 'POST' });
            fetchPosts();
        };
        // Comment
        div.querySelector('.comment-btn').onclick = async () => {
            const commentInput = div.querySelector('.comment-input');
            if (!commentInput.value) return;
            await fetch(`http://localhost:3000/posts/${post.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: commentInput.value })
            });
            commentInput.value = '';
            fetchPosts();
        };
        postsContainer.appendChild(div);
    });
}

createBtn.onclick = async () => {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const type = document.getElementById('post-type').value;
    if (!title || !content) return;

    await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type })
    });

    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    fetchPosts();
};

fetchPosts();
