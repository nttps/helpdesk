<template>
    <div class="flex justify-between">
        <div class="flex items-center space-x-2">
            <UButton v-if="props.titleBreadcrum" icon="i-heroicons-arrow-left-circle-20-solid" :padded="false" size="xl" variant="link" @click="navigateTo(props.urlBack)" />
            <h2 class="text-xl font-bold">{{ props.title }}</h2>
            <UBadge v-if="props.titleBreadcrum" color="blue" variant="outline">{{ props.titleBreadcrum }}</UBadge>
        </div>

        
        <div v-if="props.noAdd === undefined">
            <UButton
                icon="i-heroicons-pencil-square"
                size="sm"
                color="gray"
                variant="outline"
                label="ความสำคัญ"
                :trailing="false"
                class="mr-4"
                v-if="props.priority"
            />
            <UButton
                icon="i-heroicons-plus-20-solid"
                size="sm"
                variant="solid"
                :label="props.textButton ? props.textButton : `เพิ่มคำขอ`"
                :trailing="false"
                class="bg-blue-600 hover:bg-blue-700"
                @click="$emit('add')"
            />
        </div>
    </div>
</template>

<script setup>
    const props = defineProps(['title', 'noAdd', 'titleBreadcrum', 'urlBack', 'textButton', 'priority'])
    const emit = defineEmits(['add'])
</script>

<style lang="scss" scoped>

</style>