<template>
    <div class="h-screen flex items-center justify-center relative" style="background: linear-gradient(90deg, rgba(255,168,0,1) 0%, rgba(255,168,0,1) 46%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%);">
        <img src="~/assets/images/bg-login.png" class="absolute top-0 w-full h-full object-contain">
        <div class="bg-white px-10 z-10 min-w-[500px]">
            <slot />
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>