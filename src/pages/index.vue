<script setup lang="ts">
const page = ref<HTMLElement | null>(null)
usePageMotion(page)

// chapitres du rail de navigation (les ids sont posés sur les sections)
const chapters = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'reveal', label: 'La matière' },
  { id: 'finitions', label: 'Finitions' },
  { id: 'collections', label: 'Collections' },
  { id: 'produit-phare', label: 'Produit phare' },
  { id: 'interieur', label: 'En situation' },
  { id: 'composer', label: 'Composer' },
  { id: 'showroom', label: 'Showroom' }
]
</script>

<template>
  <div ref="page">
    <SectionRail :chapters="chapters" />
    <HomeHero />
    <HomeMarquee />
    <HomeStory />
    <HomeFinishes />
    <HomeNumbers />
    <HomeCollections />
    <HomeFeatured />
    <HomeSituation />
    <HomeExpertise />
    <HomeConfigurator />
    <HomeProjects />
    <HomeReviews />
    <HomeShowroom />
    <HomeConclusion />
  </div>
</template>
