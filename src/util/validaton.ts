export const isMobileValid = (mobile: string) => {
  return mobile.length === 10;
};

export const isEmailValid = (email: string) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};
