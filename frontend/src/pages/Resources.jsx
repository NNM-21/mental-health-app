import { useEffect, useMemo, useState } from 'react';
import { PlayCircle, FileText, ExternalLink } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { listResources } from '../services/resourceService';

const TYPE_ICON = {
  video: PlayCircle,
  article: FileText,
};

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: '999px',
        border: `1.5px solid ${active ? 'var(--teal)' : 'var(--border)'}`,
        background: active ? 'var(--teal)' : '#fff',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 600,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

export default function Resources() {
  const [resources, setResources] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    listResources()
      .then((data) => {
        if (!cancelled) setResources(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load resources right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    if (!resources) return [];
    return ['all', ...new Set(resources.map((r) => r.category))];
  }, [resources]);

  const filtered = useMemo(() => {
    if (!resources) return [];
    if (category === 'all') return resources;
    return resources.filter((r) => r.category === category);
  }, [resources, category]);

  return (
    <AppLayout>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Resources</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '22px' }}>
        Curated articles and videos to help you understand and manage what you're going through.
      </p>

      {error && <Card style={{ padding: '20px', color: 'var(--emergency)' }}>{error}</Card>}

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {categories.map((c) => (
            <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
      )}

      {!resources && !error && (
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={{ padding: '22px', opacity: 0.5, height: '130px' }} />
          ))}
        </div>
      )}

      {resources && filtered.length === 0 && (
        <Card style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No resources found in this category yet.
        </Card>
      )}

      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((r) => {
          const Icon = TYPE_ICON[r.type] || FileText;
          return (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
              <Card
                style={{
                  padding: '22px',
                  height: '100%',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'var(--sage-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color="var(--teal)" />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--teal)',
                      background: 'var(--sage-light)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {r.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.4 }}>
                  {r.title}
                </h3>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--teal)',
                  }}
                >
                  {r.type === 'video' ? 'Watch' : 'Read'} <ExternalLink size={13} />
                </div>
              </Card>
            </a>
          );
        })}
      </div>
    </AppLayout>
  );
}
