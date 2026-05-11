'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/auth-store';
import { useAuthGuard, useSmartBack } from '@/lib/navigation';
import SettingsPage from '@/components/settings/SettingsPage';

export default function SettingsPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, isLoading, selectedChild, setSelectedChild } = useAuthGuard();
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useAppStore();
  const { goBack } = useSmartBack('/dashboard');

  const handleUpdateProfile = async (updates: Partial<{ displayName: string; avatarId: string; favoriteColor: string }>) => {
    if (!selectedChild) return;
    try {
      const res = await fetch(`/api/children/${selectedChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) setSelectedChild(data.data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading || !isAuthenticated || !selectedChild) return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-slate-900 via-slate-800 to-emerald-900"><div className="text-white/50">جاري التحميل...</div></div>;

  return (
    <SettingsPage
      child={selectedChild}
      onBack={goBack}
      onUpdateProfile={handleUpdateProfile}
      soundEnabled={soundEnabled}
      musicEnabled={musicEnabled}
      toggleSound={toggleSound}
      toggleMusic={toggleMusic}
    />
  );
}
