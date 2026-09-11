"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamResult } from '@/lib/api';
import { renderLatex } from '@/lib/katex-utils';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [showTgModal, setShowTgModal] = useState(true);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('examResult');
    if (data) {
      setResult(JSON.parse(data));
    } else {
      router.push('/');
    }

    if (sessionStorage.getItem('autoSubmitted') === 'true') {
      setAutoSubmitted(true);
      sessionStorage.removeItem('autoSubmitted');
    }
  }, [router]);

  if (!result) return <div style={{ padding: '50px' }} suppressHydrationWarning>Loading results...</div>;

  const getStatusText = (mark: number) => {
    if (mark >= 0.999) return 'Correct';
    if (mark >= 0.899) return 'Partially correct';
    return 'Incorrect';
  };

  const getStatusColor = (mark: number) => {
    if (mark >= 0.999) return 'green';
    if (mark >= 0.899) return '#b78103';
    return 'red';
  };

  return (
    <div className="moodle-container" suppressHydrationWarning>
      {/* Telegram Invitation Modal after test completion */}
      {showTgModal && (
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
          onClick={() => setShowTgModal(false)}
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
            <button
              onClick={() => setShowTgModal(false)}
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

            <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px', color: '#333' }} suppressHydrationWarning>
              🎉 Test Completed!
            </h3>
            
            <p style={{ fontSize: '0.95rem', color: '#666', margin: '0 0 12px', fontWeight: 500 }} suppressHydrationWarning>
              Your Score: <span style={{ color: '#28a745', fontWeight: 700 }}>{result.score.toFixed(2)} / {result.total}.00 ({result.percentage.toFixed(1)}%)</span>
            </p>

            <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.5', margin: '0 0 20px' }} suppressHydrationWarning>
              If this platform helped you prepare for the exam, please consider joining my Telegram channel as a sign of gratitude and to stay connected with physics materials!
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
                }}
                suppressHydrationWarning
              >
                <span>Join Telegram Channel</span>
                <span>↗</span>
              </a>

              <button
                onClick={() => setShowTgModal(false)}
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
                Review My Answers
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="moodle-breadcrumb" suppressHydrationWarning>
        Physics I / General / Trial exam / Review
      </div>
      
      <div className="moodle-title" suppressHydrationWarning>
        <span style={{ fontSize: '1.5rem', color: '#e83e8c', marginRight: '10px' }}>📋</span>
        <h2>PHYS 161 - Exam 2 - Review</h2>
      </div>

      {autoSubmitted && (
        <div 
          style={{
            background: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404',
            padding: '14px 18px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: 500
          }}
          suppressHydrationWarning
        >
          <span style={{ fontSize: '1.4rem' }}>⏱️</span>
          <div>
            <strong>Time expired!</strong> Your 40-minute exam time ended and your attempt was automatically submitted with your saved answers.
          </div>
        </div>
      )}

      <table className="summary-table" style={{ marginBottom: '20px' }} suppressHydrationWarning>
        <tbody suppressHydrationWarning>
          <tr suppressHydrationWarning>
            <td style={{ fontWeight: 'bold', width: '200px' }} suppressHydrationWarning>Status</td>
            <td suppressHydrationWarning>Finished</td>
          </tr>
          <tr suppressHydrationWarning>
            <td style={{ fontWeight: 'bold' }} suppressHydrationWarning>Marks</td>
            <td suppressHydrationWarning>{result.score.toFixed(2)}/{result.total}.00</td>
          </tr>
          <tr suppressHydrationWarning>
            <td style={{ fontWeight: 'bold' }} suppressHydrationWarning>Grade</td>
            <td suppressHydrationWarning><strong suppressHydrationWarning>{result.percentage.toFixed(2)}</strong> out of 100.00</td>
          </tr>
        </tbody>
      </table>

      {/* Telegram Channel Banner */}
      <div 
        style={{
          background: '#e8f4fd',
          border: '1px solid #b6e0fe',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}
        suppressHydrationWarning
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} suppressHydrationWarning>
          <span style={{ fontSize: '1.6rem' }}>✈️</span>
          <div>
            <div style={{ fontWeight: 600, color: '#0d6efd', fontSize: '1rem' }} suppressHydrationWarning>
              Join our Telegram Community!
            </div>
            <div style={{ color: '#495057', fontSize: '0.9rem' }} suppressHydrationWarning>
              Find discussions, solutions, and updates for PHYS 161.
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

      {result.results.map((p, i) => (
        <div key={p.problem_id} className="exam-layout" style={{ marginBottom: '30px' }} suppressHydrationWarning>
          <div className="exam-sidebar" suppressHydrationWarning>
            <div className="exam-sidebar-card" suppressHydrationWarning>
              <div className="exam-sidebar-title" suppressHydrationWarning>Question <strong suppressHydrationWarning>{i + 1}</strong></div>
              <div style={{ color: getStatusColor(p.mark), marginBottom: '5px', fontWeight: 600 }} suppressHydrationWarning>
                {getStatusText(p.mark)}
              </div>
              <div style={{ fontSize: '0.8rem', marginBottom: '10px' }} suppressHydrationWarning>
                Mark {p.mark.toFixed(2)} out of {p.max_mark.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--nu-link)', cursor: 'pointer' }} suppressHydrationWarning>⚑ Flag question</div>
            </div>
          </div>

          <div style={{ flexGrow: 1 }} suppressHydrationWarning>
            <div className="exam-question" style={{ background: '#eaf5f7', borderColor: '#bce8f1' }} suppressHydrationWarning>
              <div className="question-text" dangerouslySetInnerHTML={{ __html: renderLatex(p.problem_text) }} suppressHydrationWarning></div>
              {p.image_file && (
                <div style={{ marginBottom: '15px' }} suppressHydrationWarning>
                  <img 
                    src={p.image_file.startsWith('/') || p.image_file.startsWith('http') ? p.image_file : `/images/${p.image_file}`} 
                    alt="Problem image" 
                    style={{ maxWidth: '100%' }} 
                    suppressHydrationWarning 
                  />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} suppressHydrationWarning>
                <input 
                  type="text" 
                  className="question-input" 
                  value={p.submitted_value !== null && p.submitted_value !== undefined ? p.submitted_value : ''}
                  disabled
                  placeholder="Answer"
                  style={{ background: '#e9ecef' }}
                  suppressHydrationWarning
                />
                {p.unit && (
                  <input 
                    type="text" 
                    className="question-unit-input" 
                    value={p.submitted_unit !== null && p.submitted_unit !== undefined ? p.submitted_unit : ''}
                    disabled
                    placeholder="Unit"
                    style={{ background: '#e9ecef' }}
                    suppressHydrationWarning
                  />
                )}
                {p.mark >= 0.999 ? (
                  <span style={{ color: 'green', fontSize: '1.2rem' }} title="Correct" suppressHydrationWarning>✔</span>
                ) : p.mark >= 0.899 ? (
                  <span style={{ color: '#b78103', fontSize: '1.2rem' }} title="Correct value, incorrect/missing unit (-10%)" suppressHydrationWarning>⚠</span>
                ) : (
                  <span style={{ color: 'red', fontSize: '1.2rem' }} title="Incorrect" suppressHydrationWarning>✘</span>
                )}
              </div>
              
              <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px' }} suppressHydrationWarning>
                One possible correct answer is: <strong suppressHydrationWarning>{p.correct_value} {p.unit || ''}</strong>
              </div>
            </div>
            
            <div 
              className={p.mark >= 0.999 ? 'result-correct-bg' : p.mark >= 0.899 ? 'result-partial-bg' : 'result-incorrect-bg'} 
              suppressHydrationWarning
            >
              {p.feedback || (p.mark >= 0.999 ? 'Your answer is correct.' : 'Your answer is incorrect.')}
            </div>
          </div>
        </div>
      ))}
      
      <div style={{ textAlign: 'center', marginTop: '30px' }} suppressHydrationWarning>
        <button className="moodle-btn moodle-btn-primary" onClick={() => router.push('/')} suppressHydrationWarning>
          Finish review
        </button>
      </div>
    </div>
  );
}
