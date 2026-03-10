import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TFit — AI Fitness OS',
  description:
    'Privacy-first, adaptive AI fitness coaching. Personalized training, nutrition, and recovery — every single day.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
