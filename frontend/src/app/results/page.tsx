"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamResult } from '@/lib/api';
import { renderLatex } from '@/lib/katex-utils';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('examResult');
    if (data) {
      setResult(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!result) return <div style={{padding: '50px'}} suppressHydrationWarning>Loading results...</div>;

  return (
    <div className="moodle-container" suppressHydrationWarning>
      <div className="moodle-breadcrumb" suppressHydrationWarning>
        Physics I / General / Trial exam / Review
      </div>
      
      <div className="moodle-title" suppressHydrationWarning>
        <span style={{ fontSize: '1.5rem', color: '#e83e8c', marginRight: '10px' }}>📋</span>
        <h2>Trial exam - Review</h2>
      </div>

      <table className="summary-table" style={{ marginBottom: '30px' }} suppressHydrationWarning>
        <tbody suppressHydrationWarning>
          <tr suppressHydrationWarning>
            <td style={{ fontWeight: 'bold', width: '200px' }} suppressHydrationWarning>Status</td>
            <td suppressHydrationWarning>Finished</td>
          </tr>
          <tr suppressHydrationWarning>
            <td style={{ fontWeight: 'bold' }} suppressHydrationWarning>Marks</td>
            <td suppressHydrationWarning>{result.score}.00/{result.total}.00</td>
          </tr>
          <tr suppressHydrationWarning>
            <td style={{ fontWeight: 'bold' }} suppressHydrationWarning>Grade</td>
            <td suppressHydrationWarning><strong suppressHydrationWarning>{result.percentage.toFixed(2)}</strong> out of 100.00</td>
          </tr>
        </tbody>
      </table>

      {result.results.map((p, i) => (
        <div key={p.problem_id} className="exam-layout" style={{ marginBottom: '30px' }} suppressHydrationWarning>
          <div className="exam-sidebar" suppressHydrationWarning>
            <div className="exam-sidebar-card" suppressHydrationWarning>
              <div className="exam-sidebar-title" suppressHydrationWarning>Question <strong suppressHydrationWarning>{i + 1}</strong></div>
              <div style={{ color: p.is_correct ? 'green' : 'red', marginBottom: '5px' }} suppressHydrationWarning>
                {p.is_correct ? 'Correct' : 'Incorrect'}
              </div>
              <div style={{fontSize: '0.8rem', marginBottom: '10px'}} suppressHydrationWarning>
                Mark {p.is_correct ? '1.00' : '0.00'} out of 1.00
              </div>
              <div style={{fontSize: '0.8rem', color: 'var(--nu-link)', cursor: 'pointer'}} suppressHydrationWarning>⚑ Flag question</div>
            </div>
          </div>

          <div style={{flexGrow: 1}} suppressHydrationWarning>
            <div className="exam-question" style={{ background: '#eaf5f7', borderColor: '#bce8f1' }} suppressHydrationWarning>
              <div className="question-text" dangerouslySetInnerHTML={{ __html: renderLatex(p.problem_text) }} suppressHydrationWarning></div>
              {p.image_file && (
                <div style={{ marginBottom: '15px' }} suppressHydrationWarning>
                  <img src={`/images/${p.image_file}`} alt="Problem image" style={{ maxWidth: '100%' }} suppressHydrationWarning />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} suppressHydrationWarning>
                <input 
                  type="text" 
                  className="question-input" 
                  value={p.submitted_value !== null ? p.submitted_value : ''}
                  disabled
                  style={{ background: '#e9ecef' }}
                  suppressHydrationWarning
                />
                {p.is_correct ? (
                  <span style={{ color: 'green', fontSize: '1.2rem' }} suppressHydrationWarning>✔</span>
                ) : (
                  <span style={{ color: 'red', fontSize: '1.2rem' }} suppressHydrationWarning>✘</span>
                )}
              </div>
              
              <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px' }} suppressHydrationWarning>
                One possible correct answer is: <strong suppressHydrationWarning>{p.correct_value} {p.unit || ''}</strong>
              </div>
            </div>
            
            <div className={p.is_correct ? 'result-correct-bg' : 'result-incorrect-bg'} suppressHydrationWarning>
              Your answer is {p.is_correct ? 'correct' : 'incorrect'}.
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
