<template>
  <div class="flex flex-grow h-screen overflow-hidden">
    <div class="shrink-0 w-20 bg-[#FFA825] text-white py-12" role="navigation" aria-label="เมนู">
      <PartialsNav />
    </div>
    <div class="shrink-0 flex-grow min-w-[calc(100%-5rem)] max-w-full overflow-auto h-screen  py-10 px-8" role="main" aria-label="เนื้อหา">
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