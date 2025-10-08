import { describe, it, expect } from 'vitest'
import { parseIngredient } from './ingredientParser'

describe('parseIngredient', () => {
  it('parses qty unit item', () => {
    expect(parseIngredient('2 cups spinach'))
      .toEqual({ qty: 2, unit: 'cups', item: 'spinach' })
  })

  it('handles decimals', () => {
    expect(parseIngredient('0.5 tbsp salt'))
      .toEqual({ qty: 0.5, unit: 'tbsp', item: 'salt' })
  })

  it('throws on bad format', () => {
    expect(() => parseIngredient('spinach')).toThrow('Invalid format')
  })
})
