// Verificação do reCAPTCHA v3 no servidor

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

interface RecaptchaResponse {
  success: boolean
  score: number
  action: string
  challenge_ts: string
  hostname: string
  'error-codes'?: string[]
}

export async function verificarRecaptcha(token: string): Promise<{ valido: boolean; score: number }> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('RECAPTCHA_SECRET_KEY não configurada')
    // Em desenvolvimento, permite passar sem reCAPTCHA
    if (process.env.NODE_ENV === 'development') {
      return { valido: true, score: 1.0 }
    }
    return { valido: false, score: 0 }
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const data: RecaptchaResponse = await response.json()

    // Log para debug
    console.log('reCAPTCHA Response:', {
      success: data.success,
      score: data.score,
      action: data.action,
      errorCodes: data['error-codes']
    })

    // Score de 0.0 a 1.0 (1.0 = muito provável ser humano)
    // Usando score 0.3 para ser mais tolerante
    const scoreMinimo = 0.3

    return {
      valido: data.success && data.score >= scoreMinimo,
      score: data.score || 0
    }
  } catch (error) {
    console.error('Erro ao verificar reCAPTCHA:', error)
    // Em caso de erro, permite o login (fallback)
    return { valido: true, score: 0.5 }
  }
}
