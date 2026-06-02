export type OrderInput = {
  employeeName: string
  department: string
  justification: string
  priority: string
  items: { name: string; quantity: number; unitValue: number }[]
}

export type ValidationErrors = Partial<{
  employeeName: string
  department: string
  justification: string
  priority: string
  items: string
  total: string
}>

const VALID_PRIORITIES = ['low', 'medium', 'high'] as const
const MAX_TOTAL_PLN = 5000

export function validateOrder(input: OrderInput): { ok: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {}

  if (!input.employeeName?.trim()) errors.employeeName = 'Imię i nazwisko jest wymagane'
  if (!input.department?.trim()) errors.department = 'Dział jest wymagany'
  if (!input.justification?.trim()) errors.justification = 'Uzasadnienie jest wymagane'

  if (!VALID_PRIORITIES.includes(input.priority as (typeof VALID_PRIORITIES)[number])) {
    errors.priority = 'Priorytet musi być: low, medium lub high'
  }

  if (!input.items || input.items.length === 0) {
    errors.items = 'Zamówienie musi zawierać co najmniej jeden przedmiot'
  } else {
    const invalid = input.items.find(
      (item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20
    )
    if (invalid) {
      errors.items = 'Ilość każdego przedmiotu musi być liczbą całkowitą od 1 do 20'
    }
  }

  if (!errors.items && input.items?.length > 0) {
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitValue, 0)
    if (total > MAX_TOTAL_PLN && input.priority !== 'high') {
      errors.total = `Łączna wartość zamówienia (${total.toFixed(2)} PLN) przekracza ${MAX_TOTAL_PLN} PLN. Zmień priorytet na "high" lub zmniejsz zamówienie.`
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
