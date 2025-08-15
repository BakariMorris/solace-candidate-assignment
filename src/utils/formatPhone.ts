export function formatPhoneNumber(phoneNumber: string | number): string {
  const phoneStr = phoneNumber.toString().replace(/\D/g, '');
  
  if (phoneStr.length === 10) {
    return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
  }
  
  if (phoneStr.length === 11 && phoneStr.startsWith('1')) {
    const tenDigit = phoneStr.slice(1);
    return `+1 (${tenDigit.slice(0, 3)}) ${tenDigit.slice(3, 6)}-${tenDigit.slice(6)}`;
  }
  
  return phoneNumber.toString();
}