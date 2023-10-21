<template>
    <div>
        <PartialsTitle title="ยืม-คืนพัสดุ" @add="add" />
    </div>



    <UModal v-model="modalAdd" fullscreen prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <div class="flex items-center">
                    <h3 class="text-lg text-center font-semibold leading-6 text-gray-900 dark:text-white">
                        แบบขอยืม-คืน และอุปกรณ์
                    </h3>
                    <UButton color="yellow" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalAdd = false" />
                </div>
            </template>

            <UForm>

                <div class="flex space-x-4">
                    <div class="w-1/5 ">
                        <UFormGroup label="คำร้องขอ" name="type" size="xl">
                            <div class="flex space-x-4">
                                <URadio v-for="method of methods" :key="method.name" v-model="selected" v-bind="method" />
                            </div>
                        </UFormGroup>
                    </div>
                    <UFormGroup label="วันที่ยืม" name="type" class="w-2/5" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" color="gray" variant="outline" class="md:w-4/5" size="md" :label="label" />
                            <template #panel="{ close }">
                                <FormDatePicker v-model="date" @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="วันที่คืน" name="type" class="w-2/5" size="xl">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" color="gray" variant="outline" class="md:w-4/5" size="md" :label="label" />
                            <template #panel="{ close }">
                                <FormDatePicker v-model="date" :date-time="true" @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                </div>
                 <div class="flex space-x-4">
                    <UFormGroup label="ผู้ยืม" name="type" size="xl">
                        
                    </UFormGroup>
                    <UFormGroup label="วันที่ยืม" name="type" class="w-2/5" size="xl">
                       
                    </UFormGroup>
                    <UFormGroup label="วันที่คืน" name="type" class="w-2/5" size="xl">
                       
                    </UFormGroup>
                </div>
                
            </UForm>
        </UCard>
    </UModal>
</template>

<script setup>
    const modalAdd = ref(false)
    const add = () => {
        modalAdd.value = true
    }

    const methods = [{
        name: 'borrow',
        value: 'borrow',
        label: 'ยืม'
    }, {
        name: 'return',
        value: 'return',
        label: 'คืน'
    }]

    const date = ref(new Date())
    const label = computed(() => date.value.toLocaleDateString('th', { year: 'numeric', month: 'long', day: 'numeric' }) + ' เวลา ' + date.value.toLocaleTimeString('th', { hour: "2-digit", minute: "2-digit" }))
</script>

<style lang="scss" scoped>

</style>