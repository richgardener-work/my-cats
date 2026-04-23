export function createSolvedState(n) {
  return Array.from({ length: n * n }, (_, i) => (i === n * n - 1 ? 0 : i + 1))
}

export function isSolved(state, n) {
  return state.every((v, i) => v === (i === n * n - 1 ? 0 : i + 1))
}

export function getBlankPos(state, n) {
  const idx = state.indexOf(0)
  return { row: Math.floor(idx / n), col: idx % n }
}

export function getValidMoves(state, n) {
  const blankIdx = state.indexOf(0)
  const row = Math.floor(blankIdx / n)
  const col = blankIdx % n
  const neighbors = []
  if (row > 0) neighbors.push(blankIdx - n)
  if (row < n - 1) neighbors.push(blankIdx + n)
  if (col > 0) neighbors.push(blankIdx - 1)
  if (col < n - 1) neighbors.push(blankIdx + 1)
  return neighbors
}

export function applyMove(state, n, tileIdx) {
  const blankIdx = state.indexOf(0)
  const next = [...state]
  next[blankIdx] = next[tileIdx]
  next[tileIdx] = 0
  return next
}

export function shuffle(n, moves = 200) {
  let state = createSolvedState(n)
  for (let i = 0; i < moves; i++) {
    const valid = getValidMoves(state, n)
    const pick = valid[Math.floor(Math.random() * valid.length)]
    state = applyMove(state, n, pick)
  }
  if (isSolved(state, n)) return shuffle(n, moves)
  return state
}

export function getStarsForDifficulty(difficulty) {
  return { '3x3': 1, '4x4': 2, '5x5': 3 }[difficulty] ?? 1
}

export function autoSolveMoves(state, n) {
  // BFS solver — only for 3×3; larger grids are intractable
  if (n > 3) return []
  const goal = createSolvedState(n).join(',')
  const start = state.join(',')
  if (start === goal) return []
  const queue = [{ state, path: [] }]
  const visited = new Set([start])
  while (queue.length) {
    const { state: cur, path } = queue.shift()
    for (const move of getValidMoves(cur, n)) {
      const next = applyMove(cur, n, move)
      const key = next.join(',')
      if (key === goal) return [...path, move]
      if (!visited.has(key)) {
        visited.add(key)
        queue.push({ state: next, path: [...path, move] })
      }
    }
  }
  return []
}
