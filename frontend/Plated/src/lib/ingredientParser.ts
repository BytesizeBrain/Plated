export function parseIngredient(line: string) {
  const m = line.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+(.+)$/)
  if (!m) throw new Error('Invalid format')
  return { qty: parseFloat(m[1]), unit: m[2].toLowerCase(), item: m[3].trim() }
}
