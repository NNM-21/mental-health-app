import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { listPosts } from '../services/forumService';
import { timeAgo } from '../lib/timeAgo';

export default function Forum() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the community forum right now. Please try again shortly.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Community
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Ask a question, or see how others in the community have supported each other.
          </p>
        </div>
        <div style={{ width: 'auto' }}>
          <Link to="/forum/ask">
            <Button variant="primary" style={{ width: 'auto' }}>
              <Plus size={17} /> Ask a question
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card style={{ padding: '20px', color: 'var(--emergency)', marginBottom: '20px' }}>
          {error}
        </Card>
      )}

      {!posts && !error && (
        <div style={{ display: 'grid', gap: '14px' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: '22px', opacity: 0.5 }}>
              <div style={{ height: '14px', width: '40%', background: 'var(--border)', borderRadius: '6px', marginBottom: '10px' }} />
              <div style={{ height: '12px', width: '80%', background: 'var(--border)', borderRadius: '6px' }} />
            </Card>
          ))}
        </div>
      )}

      {posts && posts.length === 0 && (
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No questions yet. Be the first to start a conversation.
          </p>
          <Link to="/forum/ask">
            <Button variant="secondary" style={{ width: 'auto', display: 'inline-flex' }}>
              Ask a question
            </Button>
          </Link>
        </Card>
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {posts?.map((post) => (
          <Link key={post.id} to={`/forum/${post.id}`}>
            <Card
              style={{
                padding: '22px 24px',
                transition: 'transform .15s ease, box-shadow .15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{post.title}</h3>
                    {post.is_flagged && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: 'var(--emergency)',
                          background: 'var(--emergency-bg)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                        }}
                      >
                        <AlertTriangle size={12} /> Under review
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.content}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '14px',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                }}
              >
                <span>{post.author_name}</span>
                <span>·</span>
                <span>{timeAgo(post.created_at)}</span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MessageCircle size={13} /> {post.responses?.length || 0}{' '}
                  {post.responses?.length === 1 ? 'response' : 'responses'}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
