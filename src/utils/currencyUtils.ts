export function numberToWords(amount: number): string {
  const words = new Map([
    [0, ''], [1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four'], [5, 'Five'],
    [6, 'Six'], [7, 'Seven'], [8, 'Eight'], [9, 'Nine'], [10, 'Ten'],
    [11, 'Eleven'], [12, 'Twelve'], [13, 'Thirteen'], [14, 'Fourteen'],
    [15, 'Fifteen'], [16, 'Sixteen'], [17, 'Seventeen'], [18, 'Eighteen'],
    [19, 'Nineteen'], [20, 'Twenty'], [30, 'Thirty'], [40, 'Forty'],
    [50, 'Fifty'], [60, 'Sixty'], [70, 'Seventy'], [80, 'Eighty'],
    [90, 'Ninety']
  ]);

  const convertGroup = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return words.get(n) || '';
    if (n < 100) return (words.get(Math.floor(n / 10) * 10) || '') + (n % 10 !== 0 ? ' ' + words.get(n % 10) : '');
    return (words.get(Math.floor(n / 100)) || '') + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertGroup(n % 100) : '');
  };

  if (amount === 0) return 'Zero';

  const parts = amount.toString().split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parts.length > 1 ? parseInt(parts[1].substring(0, 2)) : 0;

  let result = '';
  
  // Indian Numbering System
  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const hundred = integerPart % 1000;

  if (crore > 0) result += convertGroup(crore) + ' Crore ';
  if (lakh > 0) result += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) result += convertGroup(thousand) + ' Thousand ';
  if (hundred > 0) result += convertGroup(hundred);

  result = result.trim();
  
  if (decimalPart > 0) {
    result += ' and ' + convertGroup(decimalPart) + ' Paise';
  }

  return result + ' Only';
}
