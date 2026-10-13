import { SITE_CONFIG } from './constants';

export interface DiscountResult {
    coins: number;
    percent: number;
    discountAmount: number;
    finalFee: number;
    total_joined: number;
    pending_count: number;
}

/**
 * Calculates user discount percentage, earned coins, and remaining payable course fee.
 */
export function calculateUserDiscount(
    verifiedInvites: number = 0,
    totalInvites: number = 0,
    baseFee: number = SITE_CONFIG.courseFee || 1000
): DiscountResult {
    const safeVerified = Math.max(0, verifiedInvites || 0);
    const safeTotal = Math.max(0, totalInvites || 0);

    // Max 10 coins = 100% Discount (Free Course)
    const coins = Math.min(safeVerified, 10);
    const percent = coins * 10;
    const discountAmount = (baseFee * percent) / 100;
    const finalFee = Math.max(0, baseFee - discountAmount);
    const pending_count = Math.max(0, safeTotal - safeVerified);

    return {
        coins,
        percent,
        discountAmount,
        finalFee,
        total_joined: safeTotal,
        pending_count,
    };
}

/**
 * Pre-Registration Referral Link Generator
 * Generates official referral links for students before or after full registration.
 */
export function generatePreRegReferralLink(identifier: string | number): string {
    const cleanId = String(identifier).trim();
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : (SITE_CONFIG.siteUrl || 'https://aserproduction.tech');

    return `${baseUrl}/register?ref=${cleanId}`;
}