const configuredRate = Number(import.meta.env.VITE_USD_TO_CDF_RATE || 2800);
export const USD_TO_CDF_RATE =
  Number.isFinite(configuredRate) && configuredRate > 0 ? configuredRate : 2800;

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCdf(amountUsd: number): string {
  const cdf = Math.round((amountUsd * USD_TO_CDF_RATE) / 100) * 100;
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(cdf) + " CDF";
}

export function formatPrice(amountUsd: number): string {
  return formatUsd(amountUsd) + " · " + formatCdf(amountUsd);
}
