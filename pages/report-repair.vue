<template>
    <div>
        <PartialsTitle title="แจ้งซ่อม" @add="add" />
        <div class="mt-8">
            <div class="search-bar flex justify-between mb-2">
                <div>
                    <UButtonGroup size="lg" orientation="horizontal">
                        <UButton label="รายการคำขอ" color="white" />
                        <UButton label="กำลังดำเนินการ" color="white" />
                        <UButton label="รายการที่ปิด" color="white" />
                    </UButtonGroup>
                </div>
                <div class="min-w-3xl">
                    <UInput placeholder="ค้นหา" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
            </div>
            <div class="text-right">
                <UButton class="ml-auto" icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray"/>
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

    <UModal v-model="modalAdd" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UForm :state="{}">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            แบบฟอร์มการแจ้งซ่อม
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <div class="flex mb-4">
                    <UFormGroup label="วันที่" name="start_date" size="xl" class="w-1/3">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDate" />
                            <template #panel="{ close }">
                                <FormDatePicker v-model="date" @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>

                     <UFormGroup label="สถานะ" name="dCenter" size="xl" class="w-1/3">
                       <USelectMenu :options="status" />
                    </UFormGroup>
                </div>

                <div class="grid grid-cols-3 gap-8 mb-8">
                    <UFormGroup label="ผู้แจ้ง" name="type" size="xl">
                        <UInput placeholder="" />
                    </UFormGroup>
                    <UFormGroup label="หน่วยงาน" name="department" size="xl">
                        <USelectMenu 
                            :options="departments" 
                            searchable
                            searchable-placeholder="ค้นหาหน่วยงาน"
                        />
                    </UFormGroup>
                     <UFormGroup label="เบอร์โทรศัพท์" name="telephone" size="xl">
                       <UInput placeholder="" />
                    </UFormGroup>
                    <UFormGroup label="ประเภท" name="dCenter" size="xl">
                       <USelectMenu :options="['ประเภท 1', 'ประเภท 2']" />
                    </UFormGroup>
                    <UFormGroup label="ยีห้อ" name="dCenter" size="xl">
                       <USelectMenu :options="['ยีห้อ 1', 'ยีห้อ 2']" />
                    </UFormGroup>
                     <UFormGroup label="รุ่น" name="dCenter" size="xl">
                       <USelectMenu :options="['รุ่น 1', 'รุ่น 2']" />
                    </UFormGroup>
                </div>
                <UFormGroup label="อาการเสีย/ปัญหา" name="dCenter" size="xl">
                     <UInput />
                </UFormGroup>

                <template #footer>
                    <div class="flex items-center justify-end space-x-4">
                        <UButton color="amber" label="บันทึก" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                        <UButton color="gray" @click="modalAdd = false" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
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
        key: 'name',
        label: 'เวลา'
    }, {
        key: 'title',
        label: 'ความเสีย/ปัญหา'
    }, {
        key: 'email',
        label: 'ผู้แจ้ง'
    }, {
        key: 'role',
        label: 'หน่วยงาน'
    }, {
        key: 'role',
        label: 'โทรศัพท์'
    }, {
        key: 'priority',
        label: 'ผู้ซ่อม'
    }, {
        key: 'priority',
        label: 'ผลการแก้ไข'
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

    const status = ['ไม่อนุมัติ', 'อนุมัติ']

    const departments = ['Wade Cooper', 'Arlene Mccoy', 'Devon Webb', 'Tom Cook', 'Tanya Fox', 'Hellen Schmidt', 'Caroline Schultz', 'Mason Heaney', 'Claudie Smitham', 'Emil Schaefer']
</script>

<style lang="scss" scoped>

</style>