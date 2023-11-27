<template>
    <div>
        <PartialsTitle title="ยืม - คืน" @add="modalAdd = true" />
        <div class="mt-8">
            <div class="search-bar flex justify-between items-center mb-2">
                <div>
                    <UButtonGroup size="lg" orientation="horizontal">
                        <UButton label="รายการคำขอ" color="white" />
                        <UButton label="รายการที่ยืม" color="white" />
                        <UButton label="รายการที่คืน" color="white" />
                        <UButton label="รายการที่ค้าง" color="white" />
                    </UButtonGroup>
                </div>
                <div class="w-96">
                    <UInput v-model="textSearch" placeholder="ค้นหาจากชื่อผู้ยืม, เบอร์โทรศัพท์" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
            </div>
            <div class="text-right">
                <UButton class="ml-auto" icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray"/>
            </div>
            <UTable 
                v-model="selected" 
                :columns="columns" 
                :rows="lists.data" 
                :loading="pending" 
                :loading-state="{ label: 'กำลังโหลด ...' }" 
                :empty-state="{ label: 'ไม่พบรายการ' }"
            > 
                <template #id-data="{ row, index }">
                    <div >{{  index + 1 }}</div>
                </template>

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
                  :total="lists.total" 
                />
            </div>
           
        </div>

    </div>

    <UModal v-model="modalAdd" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UForm :state="form" @submit="submitRequest">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            ยืม-คืนพัสดุ
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <div class="flex mb-4">
                    <UFormGroup label="วันที่ยืม" name="start_date" size="xl" class="w-1/3">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelStartDate" />
                            <template #panel="{ close }">
                                <FormDatePicker v-model="form.date_begin" @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="วันที่คืน" name="end_date" size="xl" class="w-1/3">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelEndDate" />
                            <template #panel="{ close }">
                                <FormDatePicker v-model="form.date_end" @close="close" />
                            </template>
                        </UPopover>
                    </UFormGroup>
                </div>

                <div class="grid grid-cols-4 gap-8 mb-4">
                    <UFormGroup label="ผู้ยืม" name="req_by_user_id" size="xl">
                        <UInput v-model="form.req_by_user_id" placeholder="" required/>
                    </UFormGroup>
                    <UFormGroup label="ศูนย์เขต" name="location_unit" size="xl">
                       <UInput v-model="form.location_unit" placeholder="" />
                    </UFormGroup>
                    <UFormGroup label="อีเมล" name="emal_req" size="xl">
                       <UInput v-model="form.emal_req" placeholder="" />
                    </UFormGroup>
                    <UFormGroup label="เบอร์โทรศัพท์" name="phone_req" size="xl">
                       <UInput v-model="form.phone_req" placeholder="" />
                    </UFormGroup>
                </div>
                <div class="mb-4"> 
                    <UFormGroup label="วัตถุประสงค์" name="telephone" size="xl">
                       <UTextarea :rows="5" placeholder="" v-model="form.purpose_desc" />
                    </UFormGroup>
                </div>

                <div class="text-lg font-bold mb-2"> อุปกรณ์ที่ต้องการยืม </div>
                <div class="p-8 pt-4 mb-2 border rounded-lg grid grid-cols-2 gap-2" v-for="item in form.items">
                    <UFormGroup label="ประเภทอุปกรณ์" name="telephone" size="xl">
                        <USelectMenu 
                            :options="products" 
                            placeholder="อุปกรณ์" 
                            size="xl"
                            searchable
                            searchable-placeholder="ค้นหาอุปกรณ์"
                        />
                    </UFormGroup>
                    <UFormGroup label="อุปกรณ์" name="telephone" size="xl">
                        <USelectMenu 
                            :options="products" 
                            placeholder="อุปกรณ์" 
                            v-model="item.item_id"
                            size="xl"
                            searchable
                            searchable-placeholder="ค้นหาอุปกรณ์"
                        />
                    </UFormGroup>
                   
                    <UFormGroup label="จำนวน" name="telephone" size="xl">
                       <UInput v-model="item.qty" placeholder="กรอกจำนวน" />
                    </UFormGroup>
                </div>

                <div class="p-8 border rounded-lg text-center cursor-pointer" @click="addItem">
                    <Icon name="material-symbols:add-rounded" size="60" />
                </div>

                <template #footer>
                    <div class="flex items-center justify-end space-x-4">
                        <UButton color="amber" label="บันทึก" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                        <UButton color="gray" @click="modalAdd = false" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="modelDeleteConfirm">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">แจ้งเตือนการยืนยัน</div>
          </template>

          <div class="font-bold text-xl text-center">คุณต้องการยืนยันที่จะลบข้อมูลนี้ใช่หรือไม่</div>

          <template #footer>
              <div class="flex justify-between">
                  <button type="button" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="deleteItem">ยืนยัน</button>
                  <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modelDeleteConfirm = false">ยกเลิก</button>
              </div>
          </template>
        </UCard>
    </UModal>
</template>

<script setup>
    const modalAdd = ref(false)
    const textSearch = ref('')

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'req_date',
        label: 'ว/ด/ป'
    }, {
        key: 'title',
        label: 'เวลา'
    }, {
        key: 'email',
        label: 'อุปกรณ์'
    }, {
        key: 'req_by_fullname',
        label: 'ผู้ยืม'
    }, {
        key: 'department_id',
        label: 'หน่วยงาน'
    }, {
        key: 'priority',
        label: 'ศูนย์เขต'
    }, {
        key: 'phone',
        label: 'โทรศัพท์'
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
            click: () => {
                modalAdd.value = true; 
                form.value = row;
            }
        }, {
            label: 'อนุมัติ',
            icon: 'i-heroicons-archive-box-20-solid'
        },{
            label: 'ลบ',
            icon: 'i-heroicons-trash-20-solid',
            click: () => {
                modelDeleteConfirm.value = true; 
                itemDelete.value = row.req_id;
            }
        }]
        ]

    const page = ref(1)
    const pageCount = ref(20)
    const pageTotal = computed(() => lists.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))


    const selected = ref([])

    const dateTime = ref(new Date())
    const labelDateTime = computed(() => dateTime.value.toLocaleDateString('th', { year: 'numeric', month: 'long', day: 'numeric' }) + ' เวลา ' + date.value.toLocaleTimeString('th', { hour: "2-digit", minute: "2-digit" }))


    const startDate = ref(new Date())
    const labelStartDate = computed(() => startDate.value.toLocaleDateString('th', { year: 'numeric', month: 'long', day: 'numeric' }))

    const endDate = ref(new Date())
    const labelEndDate = computed(() => endDate.value.toLocaleDateString('th', { year: 'numeric', month: 'long', day: 'numeric' }))

    const products = ['อุปกรณ์ 1', 'อุปกรณ์ 2']

    const form = ref({
        req_id: '',
        req_date: '',
        req_by_user_id: '',
        phone_req:'',
        emal_req: '',
        date_begin: startDate,
        date_end: endDate,
        purpose_id:"",//รหัสวัตถุประสงค์
        purpose_desc:"",//คำบรรยายวัตถุประสงค์ 
        location:"",//สถานที่ใช้งาน
        location_unit:"",//ศูนย์เขต  
        description:"",//รายละเอียด  
        created_by:"tammon.y", //ผู้ทำรายการ
        modified_by: "",
        items: [{
            item_id: '',
            qty: '',

        }]
    })

    const addItem = () => {
        form.value.items.push({ 
            item_id: '',
            qty: ''
        })
    }

    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await postApi('/api/hd/request/ListBorrow', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Status":""//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
            })

            return {
                total: data.length,
                data: data.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
            }
        }, {
            watch: [page, pageCount, textSearch]
        }
    )

    const modelDeleteConfirm = ref(false)
    const itemDelete = ref()

    const deleteItem = async () => {
        const res = await deleteRequestApi(itemDelete.value)


        modelDeleteConfirm.value = false

        refresh()
    }

    const submitRequest = async () => {
        const res = await postApi('/api/hd/request/SaveBorrow', {
            RequestHead: form.value,
            RequestItem: form.value.items
        })
    }
</script>

<style lang="scss" scoped>

</style>