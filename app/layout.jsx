import './globals.css';

export const metadata = {
  title: 'THEATRON 2026 | A Theatre & Cinema Experience',
  description: 'A Theatre & Cinema Experience presented by IMMERSE × Team Resolution at Chennai Institute of Technology.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Montserrat:wght@300;400;500;700;800;900&family=Playfair+Display:ital,wght@0,600;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

