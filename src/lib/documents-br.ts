// Validação e mascaramento de CPF/CNPJ (dígitos verificadores).

function allSameDigit(d: string): boolean {
  return /^(\d)\1+$/.test(d);
}

export function isValidCpf(input: string): boolean {
  const d = input.replace(/\D/g, '');
  if (d.length !== 11 || allSameDigit(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function isValidCnpj(input: string): boolean {
  const d = input.replace(/\D/g, '');
  if (d.length !== 14 || allSameDigit(d)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export function isValidDocument(input: string): boolean {
  const d = input.replace(/\D/g, '');
  if (d.length === 11) return isValidCpf(d);
  if (d.length === 14) return isValidCnpj(d);
  return false;
}

// Mostra só os 2 últimos dígitos, para quem não tem acesso ao documento completo.
export function maskDocument(doc: string | null | undefined): string | null {
  if (!doc) return doc ?? null;
  const d = doc.replace(/\D/g, '');
  if (d.length < 4) return '••••';
  return '•'.repeat(Math.max(d.length - 2, 4)) + d.slice(-2);
}
