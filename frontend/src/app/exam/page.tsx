"use client";
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startExam, submitExam, ExamSession, SubmittedAnswer } from '@/lib/api';
import { renderLatex } from '@/lib/katex-utils';

interface AnswerState {
  value: string;
  unit: string;
}

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'untimed' ? 'untimed' : 'timed';
  const isTimed = mode === 'timed';

  const [exam, setExam] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Timer state (40 minutes = 2400 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(2400);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const answersRef = useRef<Record<string, AnswerState>>({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    startExam().then(res => {
      setExam(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      alert('Failed to start exam. Make sure backend is running.');
      setLoading(false);
    });
  }, []);

  // Timer countdown and automatic submission
  useEffect(() => {
    if (!isTimed || !exam) return;

    let end = sessionStorage.getItem('exam_end_timestamp');
    const now = Date.now();
    let endTime: number;

    if (end && !isNaN(Number(end))) {
      endTime = Number(end);
    } else {
      endTime = now + 40 * 60 * 1000;
      sessionStorage.setItem('exam_end_timestamp', String(endTime));
    }

    const checkTimer = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !isSubmittingRef.current) {
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        sessionStorage.setItem('autoSubmitted', 'true');
        sessionStorage.removeItem('exam_end_timestamp');

        // Auto-submit current answers
        const currentAnswers = answersRef.current;
        const payload: SubmittedAnswer[] = exam.problems.map(p => ({
          problem_id: p.problem_id,
          submitted_value: currentAnswers[p.problem_id]?.value?.trim() || null,
          submitted_unit: currentAnswers[p.problem_id]?.unit?.trim() || null,
        }));

        submitExam(exam.exam_id, payload)
          .then(result => {
            sessionStorage.setItem('examResult', JSON.stringify(result));
            router.push('/results');
          })
          .catch(e => {
            console.error('Failed to auto-submit exam:', e);
            router.push('/results');
          });
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [isTimed, exam, router]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }} suppressHydrationWarning>Loading exam...</div>;
  if (!exam) return <div style={{ padding: '50px', textAlign: 'center' }} suppressHydrationWarning>Error loading exam</div>;

  const currentProblem = exam.problems[currentIdx];

  const handleNext = () => {
    if (currentIdx < exam.problems.length - 1) setCurrentIdx(currentIdx + 1);
  };
  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleFinishAttempt = () => {
    setShowSummary(true);
  };

  const handleValueChange = (pid: string, val: string) => {
    if (isSubmitting) return;
    setAnswers(prev => ({
      ...prev,
      [pid]: { value: val, unit: prev[pid]?.unit || '' }
    }));
  };

  const handleUnitChange = (pid: string, unit: string) => {
    if (isSubmitting) return;
    setAnswers(prev => ({
      ...prev,
      [pid]: { value: prev[pid]?.value || '', unit }
    }));
  };

  const isAnswered = (pid: string) => {
    const a = answers[pid];
    return Boolean(a && (a.value.trim() || a.unit.trim()));
  };

  const submitAll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    sessionStorage.removeItem('exam_end_timestamp');
    sessionStorage.removeItem('autoSubmitted');

    const payload: SubmittedAnswer[] = exam.problems.map(p => ({
      problem_id: p.problem_id,
      submitted_value: answers[p.problem_id]?.value?.trim() || null,
      submitted_unit: answers[p.problem_id]?.unit?.trim() || null,
    }));
    try {
      const result = await submitExam(exam.exam_id, payload);
      sessionStorage.setItem('examResult', JSON.stringify(result));
      router.push('/results');
    } catch (e) {
      alert('Failed to submit exam');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unansweredCount = exam.problems.filter(p => !isAnswered(p.problem_id)).length;

  return (
    <div className="moodle-container" suppressHydrationWarning>
      <div className="moodle-breadcrumb" suppressHydrationWarning>
        Physics I / General / Trial exam
      </div>

      <div className="moodle-title" suppressHydrationWarning>
        <span style={{ fontSize: '1.5rem', color: '#e83e8c', marginRight: '10px' }}>📋</span>
        <h2>PHYS 161 - Exam 2 - Simulation</h2>
      </div>

      {!showSummary ? (
        <div className="exam-layout" suppressHydrationWarning>
          <div className="exam-sidebar" suppressHydrationWarning>
            <button className="moodle-btn" style={{ background: '#6c757d', marginBottom: '10px', width: '100%' }} onClick={() => router.push('/')}>Back</button>

            {/* Timer or Untimed Status Card */}
            {isTimed ? (
              <div 
                className="exam-sidebar-card" 
                style={{ 
                  marginBottom: '15px', 
                  textAlign: 'center',
                  borderLeft: timeLeft <= 60 ? '4px solid #dc3545' : timeLeft <= 300 ? '4px solid #ffc107' : '4px solid #0d6efd',
                  backgroundColor: timeLeft <= 60 ? '#fff5f5' : timeLeft <= 300 ? '#fffdf5' : '#f8f9fa'
                }} 
                suppressHydrationWarning
              >
                <div style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <span>⏱️</span>
                  <span>Time left</span>
                </div>
                <div 
                  style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    fontFamily: 'monospace',
                    color: timeLeft <= 60 ? '#dc3545' : timeLeft <= 300 ? '#b78103' : '#333'
                  }}
                  suppressHydrationWarning
                >
                  {formatTime(timeLeft)}
                </div>
              </div>
            ) : (
              <div 
                className="exam-sidebar-card" 
                style={{ 
                  marginBottom: '15px', 
                  textAlign: 'center',
                  borderLeft: '4px solid #6c757d',
                  backgroundColor: '#f8f9fa'
                }} 
                suppressHydrationWarning
              >
                <div style={{ fontSize: '0.85rem', color: '#495057', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <span>♾️</span>
                  <span>Untimed Practice</span>
                </div>
              </div>
            )}

            <div className="exam-sidebar-card" suppressHydrationWarning>
              <div className="exam-sidebar-title" suppressHydrationWarning>Question <strong>{currentIdx + 1}</strong></div>
              <div className="exam-sidebar-status" suppressHydrationWarning>
                {isAnswered(currentProblem.problem_id) ? 'Answer saved' : 'Not yet answered'}
              </div>
              <div style={{ fontSize: '0.8rem', marginBottom: '10px' }} suppressHydrationWarning>Marked out of 1.00</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--nu-link)', cursor: 'pointer' }} suppressHydrationWarning>⚑ Flag question</div>
            </div>

            <div className="exam-sidebar-card" style={{ marginTop: '20px' }} suppressHydrationWarning>
              <div style={{ fontSize: '0.9rem', marginBottom: '10px' }} suppressHydrationWarning>Quiz navigation</div>
              <div className="exam-sidebar-nav" suppressHydrationWarning>
                {exam.problems.map((p, i) => (
                  <div
                    key={p.problem_id}
                    className={`nav-box ${isAnswered(p.problem_id) ? 'answered' : ''} ${i === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(i)}
                    suppressHydrationWarning
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--nu-link)', cursor: 'pointer' }} onClick={handleFinishAttempt} suppressHydrationWarning>
                Finish attempt ...
              </div>
            </div>
          </div>

          <div style={{ flexGrow: 1 }} suppressHydrationWarning>
            <div className="exam-question" suppressHydrationWarning>
              <div className="question-text" dangerouslySetInnerHTML={{ __html: renderLatex(currentProblem.problem_text) }} suppressHydrationWarning></div>
              {currentProblem.image_file && (
                <div style={{ marginBottom: '15px' }} suppressHydrationWarning>
                  <img 
                    src={currentProblem.image_file.startsWith('/') || currentProblem.image_file.startsWith('http') ? currentProblem.image_file : `/images/${currentProblem.image_file}`} 
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
                  placeholder="Answer"
                  value={answers[currentProblem.problem_id]?.value || ''}
                  onChange={(e) => handleValueChange(currentProblem.problem_id, e.target.value)}
                  disabled={isSubmitting}
                  suppressHydrationWarning
                />
                {currentProblem.requires_unit && (
                  <input
                    type="text"
                    className="question-unit-input"
                    placeholder="Unit"
                    value={answers[currentProblem.problem_id]?.unit || ''}
                    onChange={(e) => handleUnitChange(currentProblem.problem_id, e.target.value)}
                    disabled={isSubmitting}
                    title="Enter unit (e.g. m/s, kN m, m^2, ms)"
                    suppressHydrationWarning
                  />
                )}
              </div>
            </div>

            <div className="format-guide-container" suppressHydrationWarning>
              <div 
                className="format-guide-header" 
                onClick={() => setShowGuide(!showGuide)}
                suppressHydrationWarning
              >
                <span>ℹ️ Answer & Unit Format Guidelines (Moodle Standards)</span>
                <span>{showGuide ? '▲ Hide' : '▼ Show'}</span>
              </div>
              {showGuide && (
                <div className="format-guide-content" suppressHydrationWarning>
                  <div className="format-grid" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      <strong>Number format (90% score):</strong>
                      <p style={{ margin: '5px 0' }}>Tolerance: ±1%. Separate decimals with a dot (.), not a comma.</p>
                      <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        <li><strong>Allowed:</strong> <code>15.2</code>, <code>5E-2</code>, <code>1.6E7</code>, <code>10^-3</code>, <code>10^4</code>, <code>5.3*10^4</code></li>
                        <li><strong>Not allowed:</strong> <code>E-3</code>, <code>1E(-3)</code>, <code>1.5E^2</code>, <code>4.1 E 5</code>, <code>1.6x10^5</code>, <code>5,1*E6</code></li>
                      </ul>
                    </div>
                    <div suppressHydrationWarning>
                      <strong>Unit format (10% score):</strong>
                      <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        <li><strong>Multiplication:</strong> Space (e.g. <code>50 kN m</code>). Asterisks/dots not supported.</li>
                        <li><strong>Division:</strong> Slash <code>/</code> or negative exponent (e.g. <code>10 m/s</code> or <code>10 m s^(-1)</code>).</li>
                        <li><strong>Powers:</strong> Caret <code>^</code> (e.g. <code>4.7 m^2</code>, <code>8 kN m^(-2)</code>).</li>
                        <li><strong>Brackets:</strong> Only use brackets with negative powers (<code>s^(-2)</code>). Do NOT write <code>m/s^(2)</code> or <code>(m)</code> (awards 0).</li>
                        <li><strong>Prefixes:</strong> Case-sensitive (<code>kN</code>, <code>MPa</code>, <code>ms</code>). Equivalence supported (<code>5 s = 5000 ms</code>).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }} suppressHydrationWarning>
              {currentIdx > 0 && (
                <button className="moodle-btn" style={{ background: '#6c757d' }} onClick={handlePrev} suppressHydrationWarning>Previous page</button>
              )}
              {currentIdx < exam.problems.length - 1 ? (
                <button className="moodle-btn moodle-btn-primary" onClick={handleNext} suppressHydrationWarning>Next page</button>
              ) : (
                <button className="moodle-btn moodle-btn-primary" onClick={handleFinishAttempt} suppressHydrationWarning>Finish attempt</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div suppressHydrationWarning>
          <h3 suppressHydrationWarning>Summary of attempt</h3>
          <table className="summary-table" suppressHydrationWarning>
            <thead suppressHydrationWarning>
              <tr suppressHydrationWarning>
                <th suppressHydrationWarning>Question</th>
                <th suppressHydrationWarning>Status</th>
              </tr>
            </thead>
            <tbody suppressHydrationWarning>
              {exam.problems.map((p, i) => (
                <tr key={p.problem_id} suppressHydrationWarning>
                  <td style={{ color: 'var(--nu-link)', cursor: 'pointer' }} onClick={() => { setCurrentIdx(i); setShowSummary(false); }} suppressHydrationWarning>{i + 1}</td>
                  <td suppressHydrationWarning>{isAnswered(p.problem_id) ? 'Answer saved' : 'Not yet answered'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} suppressHydrationWarning>
            <button className="moodle-btn" style={{ background: '#6c757d' }} onClick={() => setShowSummary(false)} suppressHydrationWarning>Return to attempt</button>
            <button className="moodle-btn moodle-btn-primary" onClick={() => setShowModal(true)} disabled={isSubmitting} suppressHydrationWarning>Submit all and finish</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" suppressHydrationWarning>
          <div className="modal-content" suppressHydrationWarning>
            <h3 style={{ marginTop: 0 }} suppressHydrationWarning>Submit all your answers and finish?</h3>
            <p suppressHydrationWarning>Once you submit your answers, you won't be able to change them.</p>
            {unansweredCount > 0 && (
              <div className="modal-warning" suppressHydrationWarning>
                Questions without a response: {unansweredCount}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }} suppressHydrationWarning>
              <button className="moodle-btn" style={{ background: '#6c757d' }} onClick={() => setShowModal(false)} suppressHydrationWarning>Cancel</button>
              <button className="moodle-btn moodle-btn-primary" onClick={submitAll} disabled={isSubmitting} suppressHydrationWarning>Submit all and finish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }} suppressHydrationWarning>Loading exam...</div>}>
      <ExamContent />
    </Suspense>
  );
}
