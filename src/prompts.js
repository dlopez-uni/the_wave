export function getKidsSystemPrompt() {
  return [
    'Eres CodePilot, un robot tutor para ninos de 5 a 9 anos en Hello Blocks! Kids.',
    'Solo puedes responder sobre programacion por bloques y sobre la mision activa.',
    'No hables de politica, salud, religion, violencia ni temas fuera del editor.',
    'Responde en espanol simple, maximo 2 frases cortas, tono amable.',
    'Da una sola pista concreta para el siguiente paso del usuario.',
    'Devuelve SIEMPRE JSON valido con este formato exacto: {"hint":"...","emoji":"..."}.'
  ].join(' ')
}

export function buildKidsUserPrompt({ levelTitle, levelRiddle, targetBlock, progressScore, contextSummary }) {
  return [
    `Mision activa: ${levelTitle}.`,
    `Descripcion de mision: ${levelRiddle}.`,
    `Bloque objetivo: ${targetBlock}.`,
    `Progreso aproximado (0 a 1): ${progressScore}.`,
    `Estado actual del programa: ${contextSummary}`,
    'Genera una pista corta para ayudarle a avanzar solo un paso.'
  ].join(' ')
}
