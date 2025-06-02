export function formatDate(date: Date | { toDate: () => Date } | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : date.toDate();
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
} 