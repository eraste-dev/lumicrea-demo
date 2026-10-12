export interface Finish {
  id: string
  name: string
  // teinte approximative pour l'aperçu, pas une valeur de marque
  tone: string
  // reflet clair utilisé pour le dégradé de la plaque (aperçu 2D)
  highlight: string
  // réponse de la matière pour le rendu 3D
  metalness: number
  roughness: number
}
