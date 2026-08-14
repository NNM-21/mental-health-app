import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { getSessionMessages, endSession } from '../services/chatService';
import { getSocket } from '../lib/socket';

export default function ChatSession() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [otherName, setOtherName] = useState(location.state?.otherName || null);
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getSessionMessages(id)
      .then((data) => {
        if (cancelled) return;
        setSession(data.session);
        setMessages(data.messages);
        if (!otherName && data.messages.length > 0) {
          const otherMsg = data.messages.find((m) => m.sender_id !== user.id);
          if (otherMsg) setOtherName(otherMsg.sender_name);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.status === 403
              ? "You're not a participant in this conversation."
              : 'Could not load this conversation right now.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit('join_session', Number(id));
    };
    const onNewMessage = (message) => {
      if (message.session_id === Number(id)) {
        setMessages((prev) => (prev ? [...prev, message] : [message]));
      }
    };
    const onError = (err) => {
      setError(err.message || 'A connection error occurred.');
    };

    socket.on('connect', onConnect);
    socket.on('new_message', onNewMessage);
    socket.on('error', onError);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('new_message', onNewMessage);
      socket.off('error', onError);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !socketRef.current) return;
    socketRef.current.emit('send_message', { sessionId: Number(id), content });
    setDraft('');
  };

  const handleEnd = async () => {
    try {
      await endSession(id);
      navigate('/conversations');
    } catch {
      setError('Could not end this conversation right now.');
    }
  };

  if (error) {
    return (
      <AppLayout>
        <Card style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <Link to="/conversations" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
            ← Back to conversations
          </Link>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to="/conversations"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={15} /> Back to conversations
      </Link>

      <Card style={{ maxWidth: '640px', margin: '0 auto', overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{otherName || 'Conversation'}</div>
            <div style={{ fontSize: '12px', color: connected ? 'var(--teal)' : 'var(--text-muted)' }}>
              {connected ? '● Connected' : 'Connecting…'}
            </div>
          </div>
          {session && !session.ended_at && (
            <button
              onClick={handleEnd}
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 12px',
              }}
            >
              End conversation
            </button>
          )}
        </div>

        <div
          style={{
            padding: '10px 16px',
            background: '#FFFBEB',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#92600A',
          }}
        >
          <ShieldAlert size={14} />
          This chat is not a replacement for emergency services.
        </div>

        <div style={{ height: '420px', overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!messages && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ height: '36px', width: '60%', background: 'var(--border)', borderRadius: '12px', opacity: 0.5 }} />
              <div style={{ height: '36px', width: '50%', background: 'var(--border)', borderRadius: '12px', opacity: 0.5, alignSelf: 'flex-end' }} />
            </div>
          )}

          {messages && messages.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '20px' }}>
              No messages yet. Say hello to start the conversation.
            </p>
          )}

          {messages?.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                }}
              >
                <div
                  style={{
                    background: mine ? 'var(--teal)' : 'var(--sage-light)',
                    color: mine ? '#fff' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  {m.content}
                </div>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                    textAlign: mine ? 'right' : 'left',
                  }}
                >
                  {new Date(m.sent_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            gap: '10px',
            padding: '14px 18px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            disabled={session?.ended_at}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || session?.ended_at}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: !draft.trim() || session?.ended_at ? 0.5 : 1,
            }}
          >
            <Send size={17} />
          </button>
        </form>
      </Card>
    </AppLayout>
  );
}
