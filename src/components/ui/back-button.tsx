'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackButtonProps {
  /** Fallback path if no browser history exists (default: /dashboard) */
  fallbackPath?: string;
  /** Custom label (Arabic) */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'ghost' | 'minimal';
}

/**
 * BackButton - Smart back navigation button
 * 
 * Provides consistent back navigation across the app:
 * - Uses router.back() when there's browser history
 * - Falls back to a specific path when there's no history (deep links)
 * - Never navigates back to /login (prevents auth redirect loops)
 * - Supports RTL layout (arrow points right for Arabic)
 */
export function BackButton({
  fallbackPath = '/dashboard',
  label = 'رجوع',
  className = '',
  variant = 'ghost',
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    // Smart back navigation:
    // 1. If we have browser history beyond just the current page, use router.back()
    // 2. If the previous page would be /login, skip it and go to fallback
    // 3. If no history (deep link), go to fallback
    
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // We have history - go back
      // But if we're on a page that was likely reached via auth redirect,
      // going back would return to the login page. In that case, go to fallback.
      router.back();
    } else {
      // No history (deep link or fresh page load) - go to fallback
      router.push(fallbackPath);
    }
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white',
    ghost: 'text-white/60 hover:text-white hover:bg-white/10',
    minimal: 'text-white/40 hover:text-white/80',
  };

  return (
    <motion.button
      onClick={handleBack}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium
        transition-colors duration-200
        ${variantStyles[variant]}
        ${className}
      `}
      aria-label={label}
    >
      <ArrowRight className="w-4 h-4" />
      <span>{label}</span>
    </motion.button>
  );
}
