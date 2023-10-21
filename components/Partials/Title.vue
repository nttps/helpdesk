<template>
    <div class="flex justify-between">
        <h2 class="text-xl font-bold">{{ props.title }}</h2>
        <div>
            <UButton
                icon="i-heroicons-pencil-square"
                size="sm"
                color="gray"
                variant="outline"
                label="ความสำคัญ"
                :trailing="false"
                class="mr-4"
            />
            <UButton
                icon="i-heroicons-plus-20-solid"
                size="sm"
                variant="solid"
                label="เพิ่มคำขอ"
                :trailing="false"
                class="bg-blue-600 hover:bg-blue-700"
                @click="$emit('add')"
            />
        </div>
    </div>
</template>

<script setup>
    const props = defineProps(['title'])
    const emit = defineEmits(['add'])
</script>

<style lang="scss" scoped>

</style>