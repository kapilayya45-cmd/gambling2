// Convert GMT to IST (GMT+5:30)
function convertGMTtoIST(gmtDate: Date): Date {
  return new Date(gmtDate.getTime() + (5.5 * 60 * 60 * 1000));
}

/**
 * Format a date string into a readable format (e.g., "May 30, 2023")
 * Assumes input is in GMT and converts to IST
 */
export function formatDate(dateStr: string): string {
  try {
    const gmtDate = new Date(dateStr);
    const istDate = convertGMTtoIST(gmtDate);
    
    return istDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr || 'TBD';
  }
}

/**
 * Format a time string into a readable format (e.g., "7:30 PM")
 * Assumes input is in GMT and converts to IST
 */
export function formatTime(timeStr: string): string {
  try {
    // If it's a full ISO string, extract just the time portion
    if (timeStr.includes('T')) {
      timeStr = timeStr.split('T')[1];
    }
    
    // If it's just hours:minutes:seconds, format it
    const [hours, minutes] = timeStr.split(':');
    const gmtHour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    // Create a Date object for today with the given GMT time
    const gmtDate = new Date();
    gmtDate.setUTCHours(gmtHour, minute, 0, 0);
    
    // Convert to IST (GMT+5:30)
    const istDate = new Date(gmtDate.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format in 12-hour format with AM/PM
    let istHours = istDate.getHours();
    const istMinutes = istDate.getMinutes();
    const ampm = istHours >= 12 ? 'PM' : 'AM';
    istHours = istHours % 12;
    istHours = istHours ? istHours : 12; // Convert 0 to 12
    
    return `${istHours}:${istMinutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeStr || 'TBD';
  }
}

/**
 * Convert GMT date and time to IST
 * Returns both date and time strings in IST
 */
export function convertToIST(gmtDate: string, gmtTime: string): { date: string; time: string } {
  try {
    // Create a Date object from the GMT date and time
    const dateObj = new Date(`${gmtDate}T${gmtTime}Z`); // Add Z to indicate UTC/GMT
    
    // Convert to IST (GMT+5:30)
    const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format the IST date and time
    const istDateStr = istDate.toISOString().split('T')[0];
    
    // Format time in HH:mm:ss format for 24-hour time
    const hours = istDate.getHours().toString().padStart(2, '0');
    const minutes = istDate.getMinutes().toString().padStart(2, '0');
    const seconds = istDate.getSeconds().toString().padStart(2, '0');
    const istTimeStr = `${hours}:${minutes}:${seconds}`;
    
    return {
      date: istDateStr,
      time: istTimeStr
    };
  } catch (e) {
    console.error('Error converting to IST:', e);
    return { date: gmtDate, time: gmtTime };
  }
} 