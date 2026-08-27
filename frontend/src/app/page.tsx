"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="moodle-container" suppressHydrationWarning>
      <div className="moodle-breadcrumb" suppressHydrationWarning>
        Physics I for Scientists and Engineers with Laboratory-Recitation,Sections-1-2-3-5-7-8-9-11-12-13-14-16-17-18-19-20-Fall 2026 / General / Trial exam
      </div>
      
      <div className="moodle-title" suppressHydrationWarning>
        <span style={{ fontSize: '2rem', color: '#e83e8c', marginRight: '10px' }}>📋</span>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Trial exam</h2>
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
