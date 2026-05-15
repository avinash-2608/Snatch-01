export function generateReferralCode() {
  const letters = 'SNATCH'.split('');
  const numbers = '0123456789'.split('');
  const allChars = [...letters, ...numbers];
  
  // Create an array to hold 7 unique characters
  const codeChars = [];
  
  while (codeChars.length < 7) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    const selectedChar = allChars[randomIndex];
    
    if (!codeChars.includes(selectedChar)) {
      codeChars.push(selectedChar);
    }
  }
  
  return codeChars.join('');
}
