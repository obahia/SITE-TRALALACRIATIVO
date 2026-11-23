// Traduz erros do Supabase Auth para PT-PT e diz ao utilizador o que fazer a seguir.
// `kind` permite à UI mostrar a ação certa (recuperar senha, reenviar email, etc.).

const BY_CODE = {
  invalid_credentials: {
    kind: 'invalid_credentials',
    message: 'Email ou palavra-passe incorretos.',
  },
  email_not_confirmed: {
    kind: 'email_not_confirmed',
    message: 'Ainda não confirmou o email. Abra o link que enviámos para a sua caixa de correio (veja também o spam).',
  },
  user_already_exists: {
    kind: 'user_already_exists',
    message: 'Já existe uma conta com este email. Entre com a sua palavra-passe ou recupere-a.',
  },
  email_exists: {
    kind: 'user_already_exists',
    message: 'Já existe uma conta com este email. Entre com a sua palavra-passe ou recupere-a.',
  },
  weak_password: {
    kind: 'weak_password',
    message: 'A palavra-passe é demasiado fraca. Use pelo menos 6 caracteres, com letras e números.',
  },
  same_password: {
    kind: 'same_password',
    message: 'A nova palavra-passe tem de ser diferente da anterior.',
  },
  over_email_send_rate_limit: {
    kind: 'rate_limit',
    message: 'Enviámos demasiados emails seguidos. Aguarde alguns minutos e tente de novo.',
  },
  over_request_rate_limit: {
    kind: 'rate_limit',
    message: 'Demasiadas tentativas. Aguarde alguns minutos e tente de novo.',
  },
  email_address_invalid: {
    kind: 'email_invalid',
    message: 'Este email não é válido.',
  },
  signup_disabled: {
    kind: 'signup_disabled',
    message: 'Os registos estão temporariamente fechados. Contacte-nos por telefone ou Instagram.',
  },
  otp_expired: {
    kind: 'link_expired',
    message: 'O link expirou. Peça um novo.',
  },
};

const BY_MESSAGE = [
  [/invalid login credentials/i, 'invalid_credentials'],
  [/email not confirmed/i, 'email_not_confirmed'],
  [/already registered|already exists/i, 'user_already_exists'],
  [/rate limit|too many/i, 'over_request_rate_limit'],
  [/password should be|weak password/i, 'weak_password'],
  [/should be different/i, 'same_password'],
  [/expired/i, 'otp_expired'],
];

export function describeAuthError(error) {
  if (!error) return { kind: 'unknown', message: 'Não foi possível concluir o pedido. Tente de novo.' };

  if (error.code && BY_CODE[error.code]) return BY_CODE[error.code];

  const raw = String(error.message || '');
  const match = BY_MESSAGE.find(([pattern]) => pattern.test(raw));
  if (match) return BY_CODE[match[1]];

  if (/failed to fetch|network/i.test(raw)) {
    return { kind: 'network', message: 'Sem ligação ao servidor. Verifique a internet e tente de novo.' };
  }

  // Mensagens que nós próprios lançámos já vêm em português.
  return { kind: 'unknown', message: raw || 'Não foi possível concluir o pedido. Tente de novo.' };
}

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
