import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flag, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import FlagModal from '../components/FlagModal';
import { getPost, flagPost } from '../services/forumService';
import { timeAgo } from '../lib/timeAgo';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [showFlag, setShowFlag] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPost(id)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? 'This question could not be found.'
              : 'Could not load this question right now.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleFlagSubmit = async (reason) => {
    await flagPost(id, { reason });
  };

  if (error) {
    return (
      <AppLayout>
        <Card style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <Link to="/forum" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
            ← Back to Community
          </Link>
        </Card>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <Card style={{ padding: '32px', opacity: 0.5 }}>
          <div style={{ height: '20px', width: '50%', background: 'var(--border)', borderRadius: '6px', marginBottom: '14px' }} />
          <div style={{ height: '14px', width: '90%', background: 'var(--border)', borderRadius: '6px' }} />
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to="/forum"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={15} /> Back to Community
      </Link>

      <Card style={{ padding: '28px 30px', marginBottom: '20px' }}>
        {post.is_flagged && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--emergency)',
              background: 'var(--emergency-bg)',
              padding: '4px 10px',
              borderRadius: '999px',
              marginBottom: '14px',
            }}
          >
            <AlertTriangle size={13} /> This post is under moderation review
          </div>
        )}

        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>{post.title}</h1>
        <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '18px' }}>
          {post.content}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            {post.author_name} · {timeAgo(post.created_at)}
          </span>
          <button
            onClick={() => setShowFlag(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <Flag size={13} /> Report
          </button>
        </div>
      </Card>

      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
        {post.responses?.length || 0} {post.responses?.length === 1 ? 'response' : 'responses'}
      </h2>

      {(!post.responses || post.responses.length === 0) && (
        <Card style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          No responses yet.
        </Card>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {post.responses?.map((r) => (
          <Card key={r.id} style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '14.5px', lineHeight: 1.65, marginBottom: '10px' }}>{r.content}</p>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{r.responder_name}</span> ·{' '}
              {timeAgo(r.created_at)}
            </div>
          </Card>
        ))}
      </div>

      {showFlag && <FlagModal onClose={() => setShowFlag(false)} onSubmit={handleFlagSubmit} />}
    </AppLayout>
  );
}
