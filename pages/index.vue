<template>
    <div>
        <PartialsTitle title="ยืม - คืน" @add="add" />
        <div>
            <div class="search-bar flex justify-between my-4">
                <div>
                <UButtonGroup size="lg" orientation="horizontal">
                    <UButton label="รายการคำขอ" color="white" />
                    <UButton label="รายการที่ยืม" color="white" />
                    <UButton label="รายการที่คืน" color="white" />
                    <UButton label="รายการที่ค้าง" color="white" />
                </UButtonGroup>
                </div>
                <div>

                </div>
            </div>
            <UTable 
                v-model="selected" 
                :columns="columns" 
                :rows="rows" 
                :loading="pending" 
                :loading-state="{ label: 'กำลังโหลด ...' }" 
                :empty-state="{ label: 'ไม่พบรายการ' }"> 
                <template #actions-data="{ row }">
                    <UDropdown :items="items(row)" :popper="{ placement: 'bottom-start' }">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
            <div class="flex flex-wrap justify-between items-center px-3 pt-3.5">
                <div>
                  <span class="text-sm leading-5">
                    กำลังแสดง
                    <span class="font-medium">{{ pageFrom }}</span>
                    ถึง
                    <span class="font-medium">{{ pageTo }}</span>
                    จาก
                    <span class="font-medium">{{ pageTotal }}</span>
                    รายการ
                  </span>
                </div>


                <UPagination 
                  v-model="page" 
                  :page-count="pageCount" 
                  :total="people.length" 
                />
            </div>
           
        </div>

    </div>

    <UModal v-model="modalAdd" fullscreen prevent-close>
        <UForm :state="{}">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            แบบคำร้องขอดูหรือสำรองไฟล์ภาพจากกล้องวงจรปิด (CCTV)
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

            
                <h3 class="font-bold leading-6 text-xl mb-4">รายละเอียดผู้ยื่นนคำร้อง</h3>
                <div class="grid grid-cols-2 gap-8 bg-zinc-300/80 p-8 rounded-xl mb-4">
                    <UFormGroup label="ชื่อ-นามสกุล" name="type" size="xl">
                        <UInput placeholder="you@example.com" />
                    </UFormGroup>
                    <UFormGroup label="ตำแหน่ง" name="type" size="xl">
                       <UInput placeholder="you@example.com" />
                    </UFormGroup>
                    <UFormGroup label="หน่วยงาน" name="type" size="xl">
                       <UInput placeholder="you@example.com" />
                    </UFormGroup>
                    <UFormGroup label="เบอร์โทร" name="type" size="xl">
                       <UInput placeholder="you@example.com" />
                    </UFormGroup>
                </div>
                <div class="flex">
                    <h3 class="font-bold leading-6 text-xl mb-4">รายละเอียดคำร้อง</h3>
                </div>
                <div class="grid grid-cols-2 gap-8 bg-zinc-300/80 p-8 rounded-xl">
                    <div>
                        <div class="grid grid-cols-2 mb-4">
                            <UFormGroup label="วันที่ยื่นคำร้อง" name="type" size="xl">
                                <UPopover :popper="{ placement: 'bottom-start' }">
                                    <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDate" />
                                    <template #panel="{ close }">
                                        <FormDatePicker v-model="date" @close="close" />
                                    </template>
                                </UPopover>
                            </UFormGroup>
                            <UFormGroup label="ความสำคัญ" name="type" size="xl">
                                
                            </UFormGroup>
                        </div>
                        <UFormGroup label="สถานที่" class="mb-4" name="type" size="xl">
                            <UTextarea :rows="4" name="input" placeholder="กรอกรายละเอียดสถานที่ ..." />
                        </UFormGroup>
                        <div class="grid grid-cols-2 mb-4">
                            <UFormGroup label="ตั้งแต่วันที่" class="mb-4" name="type" size="xl">
                                <UPopover :popper="{ placement: 'bottom-start' }">
                                    <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDateTime" />
                                    <template #panel="{ close }">
                                        <FormDatePicker v-model="dateTime" :date-time="true" @close="close" />
                                    </template>
                                </UPopover>
                            </UFormGroup>
                            <UFormGroup label="ถึงวันที่" name="type" size="xl">
                                <UPopover :popper="{ placement: 'bottom-start' }">
                                    <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDateTime" />
                                    <template #panel="{ close }">
                                        <FormDatePicker v-model="dateTime" :date-time="true" @close="close" />
                                    </template>
                                </UPopover>
                            </UFormGroup>

                        </div>
                    </div>
                    <div>
                         <UFormGroup label="วัตถุประสงค์" class="mb-4" name="type" size="xl">
                            <UInput placeholder="you@example.com" />
                        </UFormGroup>
                        <UFormGroup label="อาคาร" class="mb-4" name="type" size="xl">
                            <UInput placeholder="you@example.com" />
                        </UFormGroup>
                        <UFormGroup label="ชั้น" class="mb-4" name="type" size="xl">
                            <UInput placeholder="you@example.com" />
                        </UFormGroup>
                        <div class="grid grid-cols-2 gap-4 items-center mb-4">
                            <UFormGroup label="กรณี" name="type" size="xl">
                                <UInput placeholder="กรณีอื่น ๆ" />
                                
                            </UFormGroup>
                            <UInput placeholder="กรณีอื่น ๆ" size="xl" />
                        </div>
                    </div>
                </div>
                <template #footer>
                    <div class="flex items-center justify-end">
                        <UButton color="amber" label="บันทึก" type="submit" size="xl" :ui="{ rounded: 'rounded-xl' }"/>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>
</template>

<script setup>
    const modalAdd = ref(false)
    const add = () => {
        modalAdd.value = true
    }

    const people = [{
        id: 1,
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        email: 'lindsay.walton@example.com',
        role: 'Member'
    }, {
        id: 2,
        name: 'Courtney Henry',
        title: 'Designer',
        email: 'courtney.henry@example.com',
        role: 'Admin'
    }, {
        id: 3,
        name: 'Tom Cook',
        title: 'Director of Product',
        email: 'tom.cook@example.com',
        role: 'Member'
    }, {
        id: 4,
        name: 'Whitney Francis',
        title: 'Copywriter',
        email: 'whitney.francis@example.com',
        role: 'Admin'
    }, {
        id: 5,
        name: 'Leonard Krasner',
        title: 'Senior Designer',
        email: 'leonard.krasner@example.com',
        role: 'Owner'
    }, {
        id: 6,
        name: 'Floyd Miles',
        title: 'Principal Designer',
        email: 'floyd.miles@example.com',
        role: 'Member'
    }]

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'name',
        label: 'ว/ด/ป'
    }, {
        key: 'title',
        label: 'รายการคำขอ'
    }, {
        key: 'email',
        label: 'ผู้ส่งคำขอ'
    }, {
        key: 'role',
        label: 'หน่วยงาน'
    }, {
        key: 'priority',
        label: 'ความสำคัญ'
    }, {
        key: 'status',
        label: 'สถานะ'
    }, {
        key: 'actions'
    }]

    const items = (row) => [
        [{
            label: 'รายละเอียดคำขอ',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => console.log('Edit', row.id)
        }, {
            label: 'อนุมัติ',
            icon: 'i-heroicons-archive-box-20-solid'
        },{
            label: 'ลบ',
            icon: 'i-heroicons-trash-20-solid'
        }]
        ]

    const page = ref(1)
    const pageCount = ref(20)
    const pageTotal = computed(() => people.length)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
    const rows = computed(() => {
        return people.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
    })

    const selected = ref([])

    const dateTime = ref(new Date())
    const labelDateTime = computed(() => dateTime.value.toLocaleDateString('th', { year: 'numeric', month: 'long', day: 'numeric' }) + ' เวลา ' + date.value.toLocaleTimeString('th', { hour: "2-digit", minute: "2-digit" }))


    const date = ref(new Date())
    const labelDate = computed(() => date.value.toLocaleDateString('th', { year: 'numeric', month: 'long', day: 'numeric' }))
</script>

<style lang="scss" scoped>

</style>