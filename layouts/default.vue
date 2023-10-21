<template>
  <div class="flex flex-grow h-screen">
    <div class="shrink-0 w-20 bg-[#FFA825] text-white py-12" role="navigation" aria-label="เมนู">
      <PartialsNav />
    </div>
    <div class="shrink-0 flex-grow min-w-[calc(100%-5rem)] max-w-full overflow-auto h-screen py-10 px-8" role="main" aria-label="เนื้อหา">
      <slot />
    </div>
  </div>
</template>


<script setup>
  const route = useRoute()
  useHead({
    title: `DDPM E-Learning - ${route.meta.title}`,
    meta: [{ property: 'og:title', content: `DDPM E-Learning - ${route.meta.title}` }],
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