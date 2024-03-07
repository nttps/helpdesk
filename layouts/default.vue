<template>
  <PartialsNav />
  <div class="bg-[#FFA825] px-10  pt-4">
      
    <div class="mx-auto p-4 min-h-[calc(100vh-98px-1rem)] bg-white rounded-xl" role="main" aria-label="เนื้อหา">
      <slot />
    </div>
  </div>
  <div class=" fixed bottom-10 right-10">
    <UButton size="xl" :ui="{ rounded: 'rounded-full' }" color="blue" label="DX" :to="config.public.homeUrl" />
  </div>
</template>


<script setup>
  const route = useRoute()
  const config = useRuntimeConfig()
  useHead({
    title: `E-Helpdesk`,
    meta: [{ property: 'og:title', content: `E-Helpdesk` }],
    htmlAttrs: {
      lang: 'en'
    },
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png'
      }
    ]
  })
</script>


<style>
  * {
    font-family: 'Kanit', sans-serif;
  }
</style>