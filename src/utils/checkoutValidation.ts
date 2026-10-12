export interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  postalCode: string
  city: string
  cardNumber: string
  cardHolder: string
  cardExpiry: string
  cardCvc: string
}

export type FormErrors = Partial<Record<keyof CheckoutForm, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const POSTAL_CODE_PATTERN = /^\d{5}$/
const PHONE_DIGITS = 10
const CARD_DIGITS = 16
const CVC_DIGITS = 3
const MONTHS = 12

const digitsOf = (value: string): string => value.replace(/\D/g, '')

export function validateContact(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {}
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Saisissez une adresse e-mail valide.'
  if (!form.firstName.trim()) errors.firstName = 'Votre prénom est requis.'
  if (!form.lastName.trim()) errors.lastName = 'Votre nom est requis.'
  if (form.phone.trim() && digitsOf(form.phone).length < PHONE_DIGITS) {
    errors.phone = 'Numéro de téléphone incomplet.'
  }
  return errors
}

export function validateAddress(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.address.trim()) errors.address = "L'adresse est requise."
  if (!POSTAL_CODE_PATTERN.test(form.postalCode.trim())) errors.postalCode = 'Code postal à 5 chiffres.'
  if (!form.city.trim()) errors.city = 'La ville est requise.'
  return errors
}

// `now` injectable pour rester testable
export function validatePayment(form: CheckoutForm, now: Date = new Date()): FormErrors {
  const errors: FormErrors = {}
  if (digitsOf(form.cardNumber).length !== CARD_DIGITS) errors.cardNumber = 'Numéro de carte à 16 chiffres.'
  if (!form.cardHolder.trim()) errors.cardHolder = 'Nom du titulaire requis.'
  if (!isExpiryValid(form.cardExpiry, now)) errors.cardExpiry = 'Date d\'expiration invalide.'
  if (digitsOf(form.cardCvc).length !== CVC_DIGITS) errors.cardCvc = 'Code à 3 chiffres.'
  return errors
}

function isExpiryValid(value: string, now: Date): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > MONTHS) return false
  // valide jusqu'à la fin du mois d'expiration
  return new Date(year, month, 1) > now
}

export function formatCardNumber(value: string): string {
  return digitsOf(value).slice(0, CARD_DIGITS).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpiry(value: string): string {
  const digits = digitsOf(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
}
