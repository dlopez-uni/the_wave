export function serializeWorkspace(workspace) {
  if (!workspace) return []

  const rootBlocks = workspace.getTopBlocks(true)
  return rootBlocks.map((block) => serializeBlockTree(block))
}

function serializeBlockTree(block) {
  if (!block) return null

  const fields = {}
  for (const input of block.inputList || []) {
    for (const field of input.fieldRow || []) {
      if (field?.name) {
        fields[field.name] = block.getFieldValue(field.name)
      }
    }
  }

  const children = []
  for (const input of block.inputList || []) {
    if (input.connection) {
      const target = input.connection.targetBlock()
      if (target) {
        const child = serializeBlockTree(target)
        if (child) children.push(child)
      }
    }
  }

  const nextBlock = block.getNextBlock()
  if (nextBlock) {
    const nextSerialized = serializeBlockTree(nextBlock)
    if (nextSerialized) children.push(nextSerialized)
  }

  return {
    type: block.type,
    id: block.id,
    fields,
    children,
    parentType: block.getParent()?.type || null
  }
}

export function getMissionProgressScore(workspace, targetBlockType) {
  if (!workspace || !targetBlockType) return 0

  const blocks = workspace.getAllBlocks(false)
  const targetBlocks = blocks.filter((b) => b.type === targetBlockType)

  if (targetBlocks.length === 0) return 0

  const isConnectedToMainFlow = targetBlocks.some((block) => {
    let parent = block.getParent()
    while (parent) {
      if (parent.type === 'arduino_setup' || parent.type === 'arduino_loop') {
        return true
      }
      parent = parent.getParent()
    }
    return false
  })

  return isConnectedToMainFlow ? 1 : 0.5
}

export function buildContextSummary({ serializedTree, currentLevel, isConnected, pinStates }) {
  const levelSummary = `Mision: ${currentLevel?.title || 'sin nivel'}. Objetivo: ${currentLevel?.target || 'sin objetivo'}.`
  const hardwareSummary = `Arduino conectado: ${isConnected ? 'si' : 'no'}. LED pin13: ${pinStates?.[13] ? 'encendido' : 'apagado'}.`
  const blocksSummary = `Bloques: ${JSON.stringify(serializedTree)}`

  return `${levelSummary} ${hardwareSummary} ${blocksSummary}`
}
