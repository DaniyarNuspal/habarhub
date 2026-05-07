import { badWords } from './badWords';

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export function checkBadWords(payload) {
  const content = [
    normalizeValue(payload.title),
    normalizeValue(payload.description),
    normalizeValue(payload.tags),
    normalizeValue(payload.phone),
    normalizeValue(payload.whatsapp)
  ]
    .join(' ')
    .toLowerCase();

  const matchedWord = badWords.find((word) => content.includes(word.toLowerCase())) || '';

  return {
    matchedWord,
    ok: !matchedWord
  };
}
