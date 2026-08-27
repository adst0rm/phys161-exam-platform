import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trial exam',
  description: 'PHYS 161 Trial Exam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <header className="moodle-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} suppressHydrationWarning>
            <div style={{ width: '30px', height: '30px', background: 'url(/images/nu-logo.png) no-repeat center/contain', backgroundColor: 'white', borderRadius: '50%' }} suppressHydrationWarning></div>
            <h1 suppressHydrationWarning>NAZARBAYEV UNIVERSITY</h1>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }} suppressHydrationWarning>
            <span suppressHydrationWarning>Home</span>
            <span suppressHydrationWarning>Dashboard</span>
            <span suppressHydrationWarning>My courses</span>
          </div>
        </header>
        {children}
        <footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', fontSize: '0.9rem', color: '#6c757d', borderTop: '1px solid #dee2e6', lineHeight: '1.6' }} suppressHydrationWarning>
          <div suppressHydrationWarning>
            Created by Adil Yergen. <a href="https://github.com/adst0rm" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nu-link)', textDecoration: 'none' }} suppressHydrationWarning>GitHub</a> | <a href="https://www.instagram.com/_adstorm/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nu-link)', textDecoration: 'none' }} suppressHydrationWarning>Instagram</a>
          </div>
          <div suppressHydrationWarning>
            for any question and recommendations: adil.yergen@nu.edu.kz or telegram username @phys161supportchat
          </div>
        </footer>
      </body>
    </html>
  );
}
