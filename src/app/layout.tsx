import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'DnD GenLab Assistant',
  description: 'Помощник мастеров настольных ролевых игр D&D 5e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="mt-16 py-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>Uses 5e SRD (CC BY 4.0). Compatible content, not affiliated with Wizards of the Coast.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

