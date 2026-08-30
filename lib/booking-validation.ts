export function validateName(value: string) {
  const name = value.trim();
  if (name.length < 2) return "Enter your name.";
  if (name.length > 80 || !/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) {
    return "Use letters, spaces, apostrophes, or hyphens only.";
  }
  return "";
}

export function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

export function validatePhone(value: string) {
  return /^(?:\+91)?\d{10}$/.test(normalizePhone(value))
    ? ""
    : "Enter 10 digits, with an optional +91.";
}
