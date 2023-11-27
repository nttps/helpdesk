<template>
   <div>
        <PartialsTitle title="คำขอ CCTV" url-back="/settings/cctv" :text-button="`เพิ่ม${typeLabel}`" :title-breadcrum="typeLabel" @add="emit('add')" :priority="false" />
        <div class="mt-8">
            <div class="search-bar flex justify-center items-center mb-2">
                <div class="min-w-3xl w-96">
                    <UInput placeholder="ค้นหา" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
                <UButton icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray"/>
            </div>
            <slot />
        </div>

    </div>

</template>

<script setup>
    const props = defineProps(['type'])

    const emit = defineEmits(['add'])
  
    const typeLabel = computed(() => props.type === 'case' ? 'กรณี' : 'วัตถุประสงค์')
    
  
</script>

<style lang="scss" scoped>

</style>