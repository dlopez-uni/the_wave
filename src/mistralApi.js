const MISTRAL_MODEL = 'mistral-small-latest'

export async function getMissionHint({ systemPrompt, userPrompt }) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        temperature: 0.4,
        max_tokens: 220,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Mistral API returned empty content')
    }

    const parsed = JSON.parse(content)
    return {
      hint: parsed.hint || 'Prueba con un bloque sencillo en Al empezar para avanzar.',
      emoji: parsed.emoji || '🤖'
    }
  } catch (error) {
    console.error('Error pidiendo pista a Mistral:', error)
    return {
      hint: 'Prueba a revisar tu mision: busca el bloque clave y conectalo dentro de Al empezar o Siempre.',
      emoji: '🛠️'
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
