const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function encodeBase62(num: number): string {
  if (num === 0) {
    return chars[0];
  }

  let result = "";
  let n = num;

  while (n > 0) {
    const remainder = n % chars.length;
    result = chars[remainder] + result;
    n = Math.floor(n / chars.length);
  }

  return result;
}