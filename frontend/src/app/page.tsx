"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  useEffect(() => {
    // Check if user already dismissed in this session, or show on entry
    const dismissed = sessionStorage.getItem('tg_modal_dismissed');
    if (!dismissed) {
      setShowTelegramModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    sessionStorage.setItem('tg_modal_dismissed', 'true');
    setShowTelegramModal(false);
  };

  return (
    <div className="moodle-container" suppressHydrationWarning>
      {/* Telegram Invitation Modal */}
      {showTelegramModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={handleCloseModal}
          suppressHydrationWarning
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              textAlign: 'center',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
            suppressHydrationWarning
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                color: '#888',
                lineHeight: 1,
              }}
              title="Close"
              suppressHydrationWarning
            >
              ✕
            </button>

            {/* Telegram Icon */}
            <div style={{ marginBottom: '16px' }} suppressHydrationWarning>
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 4px 12px rgba(34, 158, 217, 0.35)',
                }}
                suppressHydrationWarning
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
                </svg>
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#333' }} suppressHydrationWarning>
              Join our Telegram Community!
            </h3>
            
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.5', margin: '0 0 22px' }} suppressHydrationWarning>
              Can you please join my telegram channel as a gratitude and to stay updated with physics solutions and updates?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} suppressHydrationWarning>
              <a
                href="https://t.me/+wplGBisTb7QwZjcy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#229ED9',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 6px rgba(34, 158, 217, 0.4)',
                  transition: 'background 0.2s',
                }}
                onClick={() => {
                  // Keep modal or close after clicking
                  sessionStorage.setItem('tg_modal_dismissed', 'true');
                }}
                suppressHydrationWarning
              >
                <span>Join Telegram Channel</span>
                <span>↗</span>
              </a>

              <button
                onClick={handleCloseModal}
                style={{
                  background: '#f1f3f5',
                  color: '#495057',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
                suppressHydrationWarning
              >
                Continue to Platform
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="moodle-breadcrumb" suppressHydrationWarning>
        Physics I for Scientists and Engineers with Laboratory-Recitation,Sections-1-2-3-5-7-8-9-11-12-13-14-16-17-18-19-20-Fall 2026 / General / Trial exam
      </div>
      
      <div className="moodle-title" suppressHydrationWarning>
        <span style={{ fontSize: '2rem', color: '#e83e8c', marginRight: '10px' }}>📋</span>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>PHYS 161 - Exam 2 - Simulation</h2>
      </div>

      <div style={{ marginTop: '20px', fontSize: '1.1rem', textAlign: 'center' }} suppressHydrationWarning>
        <p>Week 7 28/09- 02/10 Exam 2, Chapters 7-11 and previous chapters (during recitation classes)</p>
      </div>

      {/* Telegram Channel Banner on Main Page */}
      <div 
        style={{ 
          maxWidth: '700px', 
          margin: '20px auto', 
          background: '#e8f4fd', 
          border: '1px solid #b6e0fe', 
          borderRadius: '8px', 
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
        suppressHydrationWarning
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} suppressHydrationWarning>
          <span style={{ fontSize: '1.6rem' }}>✈️</span>
          <div>
            <div style={{ fontWeight: 600, color: '#0d6efd', fontSize: '0.95rem' }} suppressHydrationWarning>
              Join our Telegram Community!
            </div>
            <div style={{ color: '#495057', fontSize: '0.85rem' }} suppressHydrationWarning>
              Get physics solutions, discussions, and course updates.
            </div>
          </div>
        </div>
        <a
          href="https://t.me/+wplGBisTb7QwZjcy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#229ED9',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(34, 158, 217, 0.3)',
            whiteSpace: 'nowrap',
          }}
          suppressHydrationWarning
        >
          Join Channel ↗
        </a>
      </div>

      <div style={{ maxWidth: '700px', margin: '20px auto', background: '#fff', border: '1px solid var(--nu-border)', borderRadius: '4px', padding: '15px' }} suppressHydrationWarning>
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 600, color: 'var(--nu-link)' }}
          onClick={() => setShowRules(!showRules)}
          suppressHydrationWarning
        >
          <span>ℹ️ Moodle Exam Format & Grading Instructions</span>
          <span>{showRules ? '▲ Hide' : '▼ View'}</span>
        </div>
        
        {showRules && (
          <div style={{ marginTop: '15px', fontSize: '0.9rem', lineHeight: '1.6', borderTop: '1px solid #eee', paddingTop: '10px' }} suppressHydrationWarning>
            <p><strong>Scoring:</strong> 90% for the correct numerical answer (within ±1% tolerance) and 10% for correct units in proper Moodle format.</p>
            <p><strong>Number Format:</strong> Use scientific E-notation or 10^ notation (e.g. <code>1.56E4</code>, <code>5.3*10^4</code>, <code>10^-3</code>, <code>15.2</code>). Do not use commas as decimal separators.</p>
            <p><strong>Units Format:</strong> Enter units with space for multiplication (e.g. <code>50 kN m</code>), slash or negative exponents for division (e.g. <code>10 m/s</code> or <code>10 m s^(-1)</code>), and caret for powers (e.g. <code>4.7 m^2</code>). Do not misuse brackets (e.g. <code>m/s^(2)</code> or <code>(m)</code> receives 0 marks).</p>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '700px', margin: '30px auto', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '24px 20px', textAlign: 'center' }} suppressHydrationWarning>
        <h3 style={{ margin: '0 0 15px', fontSize: '1.2rem', color: '#333' }} suppressHydrationWarning>
          Select Exam Mode
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }} suppressHydrationWarning>
          <button 
            className="moodle-btn moodle-btn-primary" 
            style={{ padding: '12px 24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => router.push('/exam?mode=timed')}
            suppressHydrationWarning
          >
            <span>⏱️</span>
            <span>Start Timed Exam (40 min)</span>
          </button>

          <button 
            className="moodle-btn" 
            style={{ padding: '12px 24px', fontSize: '1.1rem', background: '#6c757d', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => router.push('/exam?mode=untimed')}
            suppressHydrationWarning
          >
            <span>♾️</span>
            <span>Start Untimed Practice</span>
          </button>
        </div>

        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#6c757d', lineHeight: '1.4' }} suppressHydrationWarning>
          <strong>Timed Exam:</strong> 40-minute simulation with automatic submission when time expires.<br />
          <strong>Untimed Practice:</strong> Practice freely without time limits.
        </div>

        <div style={{ marginTop: '18px', paddingTop: '15px', borderTop: '1px solid #e9ecef' }} suppressHydrationWarning>
          <a 
            href="https://t.me/+wplGBisTb7QwZjcy" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#229ED9', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            suppressHydrationWarning
          >
            <span>💬 Join our Telegram Channel for discussions & updates</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
