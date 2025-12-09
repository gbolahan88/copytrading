type StakeType = "PERCENTAGE" | "FIXED";

export function computeCopierStake({
  masterStake, // e.g., amount master staked (number)
  copierStakeType, // "PERCENTAGE" | "FIXED"
  copierStakeAmount, // if PERCENTAGE: percent (e.g. 10 -> 10%). if FIXED: absolute amount
  riskMultiplier = 1.0,
}: {
  masterStake: number;
  copierStakeType: StakeType;
  copierStakeAmount: number;
  riskMultiplier?: number;
}) {
  if (copierStakeType === "FIXED") {
    return (copierStakeAmount || 0) * (riskMultiplier || 1);
  }

  // PERCENTAGE
  const pct = (copierStakeAmount ?? 0) / 100;
  return masterStake * pct * (riskMultiplier || 1);
}

/**
 * Compute profit for copier given payout/return or result.
 * This depends on how Deriv reports returns. A generic approach:
 *
 * followerProfit = (payout - stake)  OR
 * followerProfit = stake * (payoutMultiplier - 1)
 *
 * Provide actual trade fields and adapt this function.
 */
export function computeProfit({ stake, payout }: { stake: number; payout: number }) {
  // payout is gross return (stake + profit) in many APIs; adjust as needed
  return payout - stake;
}
