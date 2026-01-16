declare global {
  interface String {
    toUpperCaseCurrency(this: string): string;
    toLowerCaseCurrency(this: string): string;
    toLocaleUpperCaseCurrency(this: string): string;
    toLocaleLowerCaseCurrency(this: string): string;
  }
}

String.prototype.toUpperCaseCurrency = function () {
  if (/[A-Z]/.test(this.toString())) return this;
  return this.toUpperCase();
};

String.prototype.toLowerCaseCurrency = function () {
  if (/[a-z]/.test(this.toString())) return this;
  return this.toLowerCase();
};

String.prototype.toLocaleUpperCaseCurrency = function () {
  if (/[A-Z]/.test(this.toString())) return this;
  return this.toLocaleUpperCase();
};

String.prototype.toLocaleLowerCaseCurrency = function () {
  if (/[a-z]/.test(this.toString())) return this;
  return this.toLocaleLowerCase();
};

export {};
