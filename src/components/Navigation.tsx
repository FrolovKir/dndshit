'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from './Button';

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Не показывать навигацию на странице входа
  if (pathname === '/login') {
    return null;
  }

  const links = [
    { href: '/', label: 'Дашборд' },
    { href: '/balance', label: '⚖️ Балансировщик' },
    { href: '/shops', label: '🏪 Магазины' },
    { href: '/tables', label: '🎲 Таблицы' },
    { href: '/improvisation', label: '⚡ Импровизация' },
    { href: '/visualize', label: '🎨 Визуализация' },
    { href: '/profile', label: 'Профиль' },
    { href: '/pricing', label: 'Тарифы' },
    { href: '/export', label: 'Экспорт' },
  ];

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎲</span>
            <span className="font-bold text-xl text-primary">DnD GenLab</span>
          </Link>

          <div className="flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-700">
                <span className="text-sm text-gray-400">
                  👤 {user.name}
                </span>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm"
                >
                  Выход
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

