import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle } from 'lucide-react';

export default function Explore({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/posts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter out text-only posts and shuffle for the explore page feel
        let mediaPosts = response.data.filter(p => p.media_url);
        mediaPosts = mediaPosts.sort(() => 0.5 - Math.random());
        
        setPosts(mediaPosts);
      } catch (err) {
        console.error("Failed to load explore feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExplorePosts();
  }, [token]);

  return (
    <div className="animate-slide-up" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Explore</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading explore grid...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}>
          {posts.length === 0 ? (
            <p>No posts to explore.</p>
          ) : (
            posts.map(post => (
              <div key={post.id} style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-elevated)',
                cursor: 'pointer'
              }} className="explore-item">
                
                {post.type === 'VIDEO' ? (
                  <video src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:3000${post.media_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop />
                ) : (
                  <img src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:3000${post.media_url}`} alt="Explore" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '20px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Heart fill="white" /> {post.like_count}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
