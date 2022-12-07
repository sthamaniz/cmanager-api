export const generateRandomNumber = (length: number = 8) => {
  const string = '0123456789';
  const chars = string.split('');
  return [...Array(length)]
    .map((i) => chars[(Math.random() * chars.length) | 0])
    .join('');
};

export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};
