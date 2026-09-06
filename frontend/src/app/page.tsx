"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="moodle-container" suppressHydrationWarning>
      <div className="moodle-breadcrumb" suppressHydrationWarning>
        Physics I for Scientists and Engineers with Laboratory-Recitation,Sections-1-2-3-5-7-8-9-11-12-13-14-16-17-18-19-20-Fall 2026 / General / Trial exam
      </div>
      
      <div className="moodle-title" suppressHydrationWarning>
        <span style={{ fontSize: '2rem', color: '#e83e8c', marginRight: '10px' }}>📋</span>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>PHYS 161 - Exam 1 - Simulation</h2>
      </div>

      <div style={{ marginTop: '20px', fontSize: '1.1rem', textAlign: 'center' }} suppressHydrationWarning>
        <p>Mon-Fri: Exam 1, Chapters 1-6 (during recitation classes) - Week 4 - 07/09-11/09</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '25px auto', background: '#fff', border: '1px solid var(--nu-border)', borderRadius: '4px', padding: '15px' }} suppressHydrationWarning>
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

      <div style={{ marginTop: '30px', textAlign: 'center' }} suppressHydrationWarning>
        <button 
          className="moodle-btn moodle-btn-primary" 
          style={{ padding: '10px 20px', fontSize: '1.2rem' }}
          onClick={() => router.push('/exam')}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}
