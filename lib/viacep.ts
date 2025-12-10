import { EnderecoViaCep } from '@/types'

export async function buscarCEP(cep: string): Promise<EnderecoViaCep | null> {
  const cepLimpo = cep.replace(/\D/g, '')

  if (cepLimpo.length !== 8) {
    return null
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)

    if (!response.ok) {
      return null
    }

    const data: EnderecoViaCep = await response.json()

    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}
