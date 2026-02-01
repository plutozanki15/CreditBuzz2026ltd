// Generate a unique activation code for withdrawal
export const generateActivationCode = (): string => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excluded I and O to avoid confusion
  const digits = "0123456789";
  
  // Format: XFC + 6 random alphanumeric characters
  let code = "XFC";
  
  for (let i = 0; i < 6; i++) {
    // Alternate between letters and digits for better variety
    if (i % 2 === 0) {
      code += digits[Math.floor(Math.random() * digits.length)];
    } else {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
  }
  
  return code;
};
