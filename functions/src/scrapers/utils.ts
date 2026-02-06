export function parseNumber(text: string): number {
  return parseFloat(text.replace(/\s/g, '').replace(',', '.')) || 0;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    dateStyle: 'full',
  });
}

export function formatTimeFR(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    timeStyle: 'short',
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * baseDelay;
      await sleep(delay);
    }
  }
  throw new Error('Retry exhausted');
}
