export function validateName(value: string) {
  const name = value.trim();
  if (name.length < 2) return "Enter your name.";
  if (name.length > 80 || !/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) {
    return "Use letters, spaces, apostrophes, or hyphens only.";
  }
  return "";
}

export function normalizePhone(value: string) {
  return `+91${value}`;
}

export function validatePhone(value: string) {
  return /^\d{10}$/.test(value)
    ? ""
    : "Enter exactly 10 digits.";
}
