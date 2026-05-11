'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ShopPage from '@/components/shop/ShopPage';
import { useEffect } from 'react';

export default function ShopPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild, setSelectedChild } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handlePurchase = async (itemType: string, itemId: string, cost: number, currency: 'coins' | 'gems') => {
    if (!selectedChild) return;
    const updates: Record<string, number> = {};
    if (currency === 'coins') updates.coins = Math.max(0, selectedChild.coins - cost);
    else updates.gems = Math.max(0, selectedChild.gems - cost);
    const res = await fetch(`/api/children/${selectedChild.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (data.success) setSelectedChild(data.data);
  };

  if (isLoading || !isAuthenticated || !selectedChild) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return (
    <ShopPage
      currentChild={{
        id: selectedChild.id,
        name: selectedChild.name,
        displayName: selectedChild.displayName,
        avatarId: selectedChild.avatarId,
        coins: selectedChild.coins,
        gems: selectedChild.gems,
        points: selectedChild.points,
        level: selectedChild.level,
      }}
      onBack={() => router.push('/dashboard')}
      onPurchase={handlePurchase}
    />
  );
}
