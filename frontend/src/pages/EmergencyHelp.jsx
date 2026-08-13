import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ArrowLeft, Clock } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { getEmergencyContacts } from '../services/emergencyService';

export default function EmergencyHelp() {
  const [contacts, setContacts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getEmergencyContacts()
      .then((data) => {
        if (!cancelled) setContacts(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load helpline information right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={15} /> Back to MindSpace
      </Link>

      <Card
        style={{
          padding: '28px 30px',
          marginBottom: '24px',
          background: 'var(--emergency-bg)',
          border: '1.5px solid var(--emergency)',
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--emergency)', marginBottom: '10px' }}>
          Are you in immediate danger?
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          If you or someone else is in immediate danger, please contact your local emergency
          services or a trusted person right now. You don't have to face this alone — help is
          available.
        </p>
      </Card>

      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
        Helplines you can call
      </h2>

      {error && <Card style={{ padding: '20px', color: 'var(--emergency)' }}>{error}</Card>}

      {!contacts && !error && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: '22px', opacity: 0.5, height: '90px' }} />
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px', marginBottom: '28px' }}>
        {contacts?.map((c) => (
          <Card key={c.id} style={{ padding: '20px 24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{c.name}</h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--teal)',
                      background: 'var(--sage-light)',
                      padding: '3px 9px',
                      borderRadius: '999px',
                    }}
                  >
                    <Clock size={11} /> {c.hours}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {c.description}
                </p>
              </div>

              <a
                href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--emergency)',
                  color: '#fff',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Phone size={15} /> Call {c.phone}
              </a>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: '20px 24px' }}>
        <Link to="/dashboard" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          ← Go back to MindSpace
        </Link>
      </Card>
    </AppLayout>
  );
}
