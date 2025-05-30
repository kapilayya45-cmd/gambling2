/**
 * Format a date string into a readable format (e.g., "May 30, 2023")
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr || 'TBD';
  }
}

/**
 * Format a time string into a readable format (e.g., "14:30")
 */
export function formatTime(timeStr: string): string {
  try {
    // If it's a full ISO string, extract just the time portion
    if (timeStr.includes('T')) {
      timeStr = timeStr.split('T')[1];
    }
    
    // If it's just hours:minutes:seconds, format it
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    // Create a Date object to use toLocaleTimeString
    const date = new Date();
    date.setHours(hour, minute);
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeStr || 'TBD';
  }
} 