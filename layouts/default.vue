<template>
  <div class="bg-[#FFA825] px-2 py-2">
      <NuxtLink class="flex items-center gap-1.5">
        <img src="~/assets/images/logo.png" class="w-[50px]" alt="ระบบขอรับบริการด้าน IT Support">
        <div class="text-xl 2xl:text-2xl ml-2">
            <div>ระบบขอรับบริการด้าน IT Support</div> 
            <div class="text-white">กรมป้องกันและบรรเทาสาธารณภัย</div> 
        </div>
    </NuxtLink>
  </div>
  <div class="flex flex-grow h-[calc(100vh-80px)] overflow-hidden">
    <div class="shrink-0 w-20 bg-[#FFA825] text-white pb-4" role="navigation" aria-label="เมนู">
      <PartialsNav />
    </div>
    <div class="shrink-0 flex-grow max-w-[calc(100%-5rem)] overflow-auto h-screen  py-10 px-8" role="main" aria-label="เนื้อหา">
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
    title: `ระบบขอรับบริการด้าน IT Support`,
    meta: [{ property: 'og:title', content: `ระบบขอรับบริการด้าน IT Support` }],
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