import { API_URL } from '../config';
import { useState } from 'react';
import axios from 'axios';
import { X, Image as ImageIcon, Video, Upload } from 'lucide-react';

export default function CreatePost({ token, onClose }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      // Create a local URL for instant preview
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !file) {
      setError("Please add text or media to post.");
      return;
    }

    setLoading(true);
    setError('');

    // Because we are sending physical files, we MUST use FormData, not standard JSON
    const formData = new FormData();
    formData.append('content_text', text);
    
    if (file) {
      formData.append('media', file);
      // Simple logic to detect if it's a video or image
      formData.append('type', file.type.startsWith('video') ? 'VIDEO' : 'IMAGE');
    } else {
      formData.append('type', 'TEXT');
    }

    try {
      await axios.post(`${API_URL}/api/posts`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Required for file uploads!
        }
      });
      // The WebSocket will handle showing the post on the feed automatically
      onClose();
    } catch (err) {
      setError("Failed to create post. File might be too large.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
          <h3 style={{ margin: 0 }}>Create new post</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}
          
          <textarea 
            className="glass-input" 
            placeholder="Write a caption..." 
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: '100px', resize: 'vertical', marginBottom: '20px' }}
          />

          {preview && (
            <div style={{ position: 'relative', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              {file?.type.startsWith('video') ? (
                <video src={preview} controls style={{ width: '100%', display: 'block' }} />
              ) : (
                <img src={preview} alt="Preview" style={{ width: '100%', display: 'block' }} />
              )}
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                <ImageIcon size={20} /> Image
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
                <Video size={20} /> Video
                <input type="file" accept="video/mp4,video/webm" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
            
            <button className="glass-button" onClick={handleSubmit} disabled={loading}>
              <Upload size={18} /> {loading ? 'Posting...' : 'Share'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
