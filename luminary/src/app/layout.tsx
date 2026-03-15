// src/app/layout.tsx
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luminary — Photo Archive',
  description: 'Your personal photo album with AI-powered features',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-stone-50 text-stone-900">{children}</body>
      </html>
    </ClerkProvider>
  );
}
