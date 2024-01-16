<template>
    <div class="h-screen flex items-center justify-center relative" style="background: linear-gradient(90deg, rgba(255,168,0,1) 0%, rgba(255,168,0,1) 46%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%);">
    
        <div class="bg-white px-10 z-10 min-w-[500px]">
            <slot />
        </div>
    </div>
</template>

<script setup>
  const route = useRoute()
  useHead({
    title: `E-Helpdesk - Login `,
    meta: [{ property: 'og:title', content: `E-Helpdesk - ${route.meta.title}` }],
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

<style lang="scss" scoped>

</style>