export interface DiscountResult {
    coins: number;
    percent: number;
    discountAmount: number;
    finalFee: number;
    total_joined: number;
    pending_count: number;
}

export function calculateUserDiscount(
    verifiedInvites: number,
    totalInvites: number,
    baseFee: number
): DiscountResult {
    const coins = Math.min(verifiedInvites, 10);
    const percent = coins * 10;
    const discountAmount = (baseFee * percent) / 100;
    const finalFee = Math.max(0, baseFee - discountAmount);
    const pending_count = Math.max(0, totalInvites - verifiedInvites);

    return {
        coins,
        percent,
        discountAmount,
        finalFee,
        total_joined: totalInvites,
        pending_count,
    };
}