import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merging helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * አውቶማቲክ ልዩ የተማሪ መታወቂያ (Unique Student ID) ማመንጫ
 * ምሳሌ፦ AXR-STU-8821
 */
export function generateStudentCustomId(): string {
  const random4Digits = Math.floor(1000 + Math.random() * 9000);
  return `AXR-STU-${random4Digits}`;
}

/**
 * አሃዛዊ Telegram/Web User ID ማመንጫ (ተማሪው የቴሌግራም ID ከሌለው)
 */
export function generateNumericUserId(): number {
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

/**
 * የኢትዮጵያ ስልክ ቁጥር ትክክለኛነት ማረጋገጫ (Validation)
 * ይሰራል፦ 0911223344, 0711223344, +251911223344
 */
export function validateEthiopianPhone(phone: string): boolean {
  const regex = /^(?:\+251|0)[79]\d{8}$/;
  return regex.test(phone.trim());
}

/**
 * የኢሜይል አድራሻ ትክክለኛነት ማረጋገጫ
 */
export function validateEmail(email: string): boolean {
  const regex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
  return regex.test(email.trim());
}

/**
 * የገንዘብ መጠን በ ETB ቅርጸት ማስተካከያ
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

/**
 * የቀን አቀራረብ ማስተካከያ (Readable Date)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}