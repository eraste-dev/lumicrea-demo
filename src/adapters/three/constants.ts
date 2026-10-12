// plafond du pixel ratio : au-delà, le gain visuel ne vaut pas le coût GPU
export const MAX_PIXEL_RATIO = 2

// amplitude de l'inclinaison au pointeur (radians) et vitesse de rattrapage
export const TILT_RANGE = 0.28
export const TILT_DAMPING = 0.06

// séquence scroll : tour du produit (radians) et distance de la caméra
export const STORY_TURN = 1.1
export const STORY_TILT = 0.22
export const CAMERA_FAR = 3.2
export const CAMERA_NEAR = 2.35
export const CAMERA_DAMPING = 0.08

// vitesse de la transition de couleur entre deux finitions
export const COLOR_DAMPING = 0.12

// éclairage de jour / de soirée (intensités) et vitesse du fondu entre les deux
export const LIGHTS_DAY = { environment: 1.1, key: 3.2, fill: 1.4, warm: 0 }
export const LIGHTS_NIGHT = { environment: 0.3, key: 1.3, fill: 0.3, warm: 6 }
export const LIGHTS_FADE = 0.07

// survol : inclinaison plus marquée, et lumière qui suit le pointeur
export const HOVER_TILT = 0.55
export const HOVER_DAMPING = 0.1
export const LIGHT_REACH = 3.2

// glissement : vitesse (rad/px), butées et retour à la pose (par image)
export const DRAG_SPEED = 0.008
export const DRAG_LIMIT_Y = 1.6
export const DRAG_LIMIT_X = 0.8
export const DRAG_RETURN = 0.94

// tour d'intro au survol : durée, recul de caméra, délai avant de pouvoir le rejouer (ms)
export const SPIN_DURATION = 1400
export const SPIN_PUSH = 0.35
export const SPIN_COOLDOWN = 6000

// en dessous de ce déplacement cumulé (px), un appui est un clic et non un glissement
export const CLICK_THRESHOLD = 4

// touche : angle relevée (allumé) / abaissée (éteint), et vitesse de bascule
export const ROCKER_UP = -0.22
export const ROCKER_DOWN = 0.22
export const ROCKER_DAMPING = 0.22
