import './globals.css';

export const metadata = {
  title: 'THEATRON 2026 | A Theatre & Cinema Experience',
  description: 'A Theatre & Cinema Experience presented by IMMERSE × Team Resolution at Chennai Institute of Technology.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#040303', margin: 0, padding: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Montserrat:wght@300;400;500;700;800;900&family=Playfair+Display:ital,wght@0,600;1,400;1,600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #040303 !important; color: #f2ece1; overflow: hidden; }
        `}} />
      </head>
      <body style={{ backgroundColor: '#040303', margin: 0, padding: 0, width: '100%', height: '100%', overflow: 'hidden' }}>{children}</body>
    </html>
  );
}

