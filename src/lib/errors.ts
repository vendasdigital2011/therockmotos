// Erros da aplicação.
//
// AppError = regra de negócio com mensagem SEGURA para mostrar ao usuário
// (ex.: "Moto não encontrada"). Qualquer outro erro (Prisma, rede, bug) é
// interno: o cliente recebe só a mensagem fixa da rota, e o detalhe vai para o log.

export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 422) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

// Mensagem que pode ir na resposta. Só AppError expõe o texto; o resto usa o fallback.
export function publicMessage(error: unknown, fallback: string): string {
  return error instanceof AppError ? error.message : fallback;
}
