export function isDateInRange(dateStr: string, range: string): boolean {
  if (!dateStr || range === 'all') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  
  const now = new Date();
  
  if (range === 'today') {
    return d.toDateString() === now.toDateString();
  }
  
  if (range === 'this-week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    return d >= startOfWeek && d <= now;
  }

  if (range === 'this-month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  
  if (range === 'last-month') {
    let m = now.getMonth() - 1;
    let y = now.getFullYear();
    if (m < 0) {
      m = 11;
      y--;
    }
    return d.getMonth() === m && d.getFullYear() === y;
  }
  
  if (range === 'this-quarter') {
    const currentQ = Math.floor(now.getMonth() / 3);
    const qStartMonth = currentQ * 3;
    const startOfQ = new Date(now.getFullYear(), qStartMonth, 1);
    return d >= startOfQ && d.getFullYear() === now.getFullYear();
  }
  
  if (range === 'this-year') {
    let startY = now.getFullYear();
    if (now.getMonth() < 3) startY--;
    const startOfFY = new Date(startY, 3, 1);
    const endOfFY = new Date(startY + 1, 2, 31, 23, 59, 59);
    return d >= startOfFY && d <= endOfFY;
  }
  
  if (range === 'last-year') {
    let startY = now.getFullYear() - 1;
    if (now.getMonth() < 3) startY--;
    const startOfFY = new Date(startY, 3, 1);
    const endOfFY = new Date(startY + 1, 2, 31, 23, 59, 59);
    return d >= startOfFY && d <= endOfFY;
  }

  return true;
}
