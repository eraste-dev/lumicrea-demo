import bronze from '~/assets/images/home/finition-bronze.webp'
import canon from '~/assets/images/home/finition-canon.webp'
import acier from '~/assets/images/home/finition-acier.webp'
import blancMat from '~/assets/images/home/finition-blanc-mat.webp'
import laitonBrosse from '~/assets/images/home/finition-laiton-brosse.webp'
import noirBrosse from '~/assets/images/home/finition-noir-brosse.webp'

// Photos du site actuel, une par finition (mêmes scène et lumière).
// Les clés sont les ids de finitions de data/finishes.ts.
export const finishPhotos: Record<string, string> = {
  'bronze': bronze,
  'canon': canon,
  'acier': acier,
  'blanc-mat': blancMat,
  'laiton-brosse': laitonBrosse,
  'noir-brosse': noirBrosse
}
