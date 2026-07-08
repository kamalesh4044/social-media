import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

const socket = io('http://localhost:3000');

export default function Feed({ token, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({}); // { postId: [comment1, comment2] }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/posts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(response.data);
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();

    socket.on('new_post', (newPost) => {
      setPosts((currentPosts) => [newPost, ...currentPosts]);
    });

    socket.on('post_liked', ({ post_id, user_id }) => {
      setPosts((currentPosts) => 
        currentPosts.map(post => {
          if (post.id === post_id) {
            const isMe = user_id === user.id;
            return { ...post, like_count: post.like_count + 1, user_has_liked: isMe ? 1 : post.user_has_liked };
          }
          return post;
        })
      );
    });

    socket.on('new_comment', (newComment) => {
      setComments((prev) => {
        const postComments = prev[newComment.post_id] || [];
        return { ...prev, [newComment.post_id]: [...postComments, newComment] };
      });
    });

    return () => {
      socket.off('new_post');
      socket.off('post_liked');
      socket.off('new_comment');
    };
  }, [token, user.id]);

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:3000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const loadComments = async (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    if (!comments[postId]) {
      try {
        const res = await axios.get(`http://localhost:3000/api/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments(prev => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const submitComment = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`http://localhost:3000/api/posts/${postId}/comments`, { comment_text: commentText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="feed-container animate-slide-up">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading real-time feed...</div>
      ) : (
        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <h3>No posts yet.</h3>
              <p>Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card">
                
                <div className="post-header">
                  <div className="post-user-info">
                    <img src={post.avatar_url || `https://ui-avatars.com/api/?name=${post.username}&background=random`} alt={post.username} className="post-avatar"/>
                    <span className="post-username">{post.username}</span>
                    <span className="post-time">• {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <MoreHorizontal size={20} color="var(--text-secondary)" />
                </div>

                {post.media_url && (
                  <div className="post-media-container">
                    {post.type === 'VIDEO' ? (
                      <video src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:3000${post.media_url}`} className="post-media" controls autoPlay muted loop />
                    ) : (
                      <img src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:3000${post.media_url}`} alt="Post media" className="post-media" />
                    )}
                  </div>
                )}

                <div className="post-actions">
                  <button className={`post-action-btn ${post.user_has_liked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                    <Heart size={24} strokeWidth={post.user_has_liked ? 0 : 2} />
                  </button>
                  <button className="post-action-btn" onClick={() => loadComments(post.id)}>
                    <MessageCircle size={24} />
                  </button>
                  <button className="post-action-btn" onClick={() => alert("Share feature coming soon!")}>
                    <Send size={24} />
                  </button>
                  <div style={{ flexGrow: 1 }} />
                  <button className="post-action-btn">
                    <Bookmark size={24} />
                  </button>
                </div>

                <div className="post-likes">
                  {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                </div>
                
                {post.content_text && (
                  <div className="post-caption">
                    <span style={{ fontWeight: '600', marginRight: '8px' }}>{post.username}</span>
                    {post.content_text}
                  </div>
                )}

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '8px 4px', cursor: 'pointer' }} onClick={() => loadComments(post.id)}>
                  View all comments
                </div>

                {activeCommentPostId === post.id && (
                  <div style={{ padding: '0 4px', borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
                    {(comments[post.id] || []).map(c => (
                      <div key={c.id} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600', marginRight: '8px' }}>{c.username}</span>
                        {c.comment_text}
                      </div>
                    ))}
                    <form onSubmit={(e) => submitComment(e, post.id)} style={{ display: 'flex', marginTop: '12px' }}>
                      <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..." 
                        style={{ background: 'transparent', border: 'none', color: 'white', flexGrow: 1, outline: 'none' }}
                      />
                      <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer' }} disabled={!commentText.trim()}>
                        Post
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
