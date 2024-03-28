<template>
   <div>
        <PartialsTitle title="คำขอดู CCTV" url-back="/settings/cctv" :text-button="`เพิ่ม${typeLabel}`" :title-breadcrum="typeLabel" @add="emit('add')" :priority="false" />
        <div class="mt-8">
            <div class="search-bar flex justify-center items-center mb-2">
                <div class="min-w-3xl w-96">
                    <UInput placeholder="ค้นหา" v-model="search" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
                <UButton icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray"/>
            </div>
            <slot />
        </div>

    </div>

</template>

<script setup>
    const props = defineProps(['type', 'modelValue'])

    const emit = defineEmits(['add', 'update:model-value'])

    const search = computed({
        get: () => props.modelValue,
        set: (value) => {
            emit('update:model-value',  value)
        }
    })
  
    const typeLabel = computed(() => {
        switch (props.type) {
            case 'case':
                return 'กรณี'
            case 'building':
                return 'อาคาร'
            case 'floor':
                return 'ชั้น'
            default:
                return 'วัตถุประสงค์'
        }
    })
    
  
</script>

<style lang="scss" scoped>

</style>