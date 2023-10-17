<template>
  <div>
    <Header />
        <slot />
    <Footer />
  </div>
</template>


<script setup>
  const route = useRoute()
  useHead({
    title: `DDPM E-Learning - ${route.meta.title}`,
    meta: [{ property: 'og:title', content: `DDPM E-Learning - ${route.meta.title}` }]
  })
</script>