'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { TIERS } from '@/lib/credits';

type TierName = keyof typeof TIERS;

export default function PricingPage() {
  const [loading, setLoading] = useState<TierName | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (tier: TierName) => {
    setLoading(tier);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/payment/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка оплаты');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const tiersList = Object.entries(TIERS).map(([key, config]) => ({
    id: key as TierName,
    ...config,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Тарифы</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Выберите тариф, который подходит для ваших кампаний
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-md mx-auto p-4 bg-secondary/10 border border-secondary rounded-lg text-secondary text-center animate-fade-in">
          ✓ Оплата успешна! Перенаправление на профиль...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto p-4 bg-danger/10 border border-danger rounded-lg text-danger text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {tiersList.map((tier) => {
          const isPopular = tier.id === 'pro';
          
          return (
            <Card
              key={tier.id}
              className={`relative ${
                isPopular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-xs font-bold">
                  ПОПУЛЯРНЫЙ
                </div>
              )}

              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold capitalize">{tier.name}</h3>
                
                <div className="space-y-1">
                  <div className="text-4xl font-bold">
                    {tier.price === 0 ? (
                      'Бесплатно'
                    ) : (
                      <>
                        {tier.price} ₽<span className="text-lg text-gray-400">/мес</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {(tier.tokens / 1000).toLocaleString()}K токенов
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-left">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-secondary mr-2">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? 'primary' : 'ghost'}
                  className="w-full"
                  onClick={() => handleSubscribe(tier.id)}
                  loading={loading === tier.id}
                  disabled={loading !== null}
                >
                  {tier.price === 0 ? 'Бесплатный тариф' : 'Подписаться'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <Card className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Часто задаваемые вопросы</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">Что такое токены?</h3>
            <p className="text-gray-400 text-sm">
              Токены — это единицы расхода для генерации контента. Примерно 1 токен ≈ 4 символа. 
              Средняя кампания занимает ~5000 токенов, NPC ~1000 токенов, сцена ~1500 токенов.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Можно ли изменить тариф?</h3>
            <p className="text-gray-400 text-sm">
              Да, вы можете повысить или понизить тариф в любое время. 
              Неиспользованные токены не переносятся при смене тарифа.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Что происходит при превышении лимита?</h3>
            <p className="text-gray-400 text-sm">
              При превышении лимита токенов генерация будет недоступна до следующего месяца 
              или пока вы не обновите тариф.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Это тестовая версия?</h3>
            <p className="text-gray-400 text-sm">
              Да, это MVP с mock-платежной системой. В продакшене будет реальная интеграция 
              с YooKassa или CloudPayments.
            </p>
          </div>
        </div>
      </Card>

      {/* Attribution */}
      <div className="text-center text-sm text-gray-500 animate-fade-in">
        <p>Все цены указаны в российских рублях и включают НДС</p>
      </div>
    </div>
  );
}

