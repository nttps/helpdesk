<template>
    <div>
        <PartialsTitle title="คลังอุปกรณ์" no-add />
        <div class="mt-8">
            <div class="search-bar flex justify-between mb-2">
                <div class="w-96">
                    <UInput placeholder="ค้นหาจากชื่ออุปกรณ์" v-model="search" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
                <div>
                    <UButton
                        icon="i-heroicons-plus-20-solid"
                        size="md"
                        variant="solid"
                        label="อุปกรณ์"
                        :trailing="false"
                        @click="addItem"
                    />
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
                <template #is_in_warranty-data="{ row }">
                    <div class="text-center">
                        <UBadge size="xs" :label="row.is_in_warranty ? 'อยู่ในประกัน' : 'ไม่อยู่ในประกัน'" :color="row.is_in_warranty ? 'emerald' : 'red'" variant="subtle" />
                    </div>
                </template>
                <template #status-data="{ row }">
                    <div class="text-center">
                        <UBadge size="xs" :label="row.status" :color="row.status === 'ว่าง' ? 'emerald' : 'red'" variant="solid" />
                    </div>
                </template>
                
                <template #id-data="{ row, index }">
                    <div class="text-center">{{  index + 1 }}</div>
                </template>
                <template #actions-data="{ row }">
                    <UButton color="amber" variant="ghost" icon="i-heroicons-pencil-solid" @click="fetchEditData(row.item_id)"/>
                    <UButton color="red" variant="ghost" icon="i-heroicons-trash-20-solid" @click="modelDeleteConfirm = true; itemDelete = row.item_id" />
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
        <UForm :state="form" @submit="submit" :schema="schema">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            คลังอุปกรณ์
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <div class="grid grid-cols-5 gap-8 mb-4">
                    <UFormGroup label="ชื่อ" name="item_name" size="xl">
                        <UInput v-model="form.item_name" placeholder="" required />
                    </UFormGroup>
                    <UFormGroup label="ประเภทอุปกรณ์" name="item_type" size="xl" >
                        <USelectMenu 
                            :options="itemsType" 
                            placeholder="เลือกประเภทอุปกรณ์" 
                            size="xl"
                            v-model="form.item_type"
                            value-attribute="description1" 
                            option-attribute="description1" 
                            searchable
                            searchable-placeholder="ค้นหาประเภทอุปกรณ์"
                        />
                    </UFormGroup>
                    <UFormGroup label="หมวดหมู่" name="item_type" size="xl" >
                        <USelectMenu 
                            :options="itemsCate" 
                            placeholder="เลือกหมวดหมู่" 
                            size="xl"
                            v-model="form.item_cate"
                            value-attribute="description1" 
                            option-attribute="description1" 
                            searchable
                            searchable-placeholder="ค้นหาประเภทอุปกรณ์"
                        />
                    </UFormGroup>
                   
                    <UFormGroup label="ยีห้อ" name="brand" size="xl">
                       <UInput v-model="form.brand" placeholder="" />
                    </UFormGroup>
                    <UFormGroup label="รุ่น" name="model" size="xl">
                       <UInput v-model="form.model" placeholder="" />
                    </UFormGroup>
                  
                </div>
                <div class="grid grid-cols-3 gap-x-8 gap-y-4 mb-4 items-center">
                    <UFormGroup label="Serial Number" name="serial_number" size="xl">
                        <UInput v-model="form.serial_number" placeholder="" />
                    </UFormGroup>
                     <UFormGroup label="เลขที่สัญญา" name="contract" size="xl">
                        <UInput v-model="form.contract" placeholder="" />
                    </UFormGroup>

                    <UFormGroup label="ยังอยู่ในช่วงรับประกัน" name="is_in_warranty" class="flex space-x-4 items-center" size="xl">
                        <UToggle color="primary" v-model="form.is_in_warranty" :model-value="form.is_in_warranty" />

                        

                        <UFormGroup label="" name="warranty_expiration_date" v-if="form.is_in_warranty">
                            <UPopover :popper="{ placement: 'bottom-start' }" >
                                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" size="md" :label="labelDateExpire" />
                                <template #panel="{ close }">
                                    <FormDatePicker v-model="form.warranty_expiration_date" @close="close" required/>
                                </template>
                            </UPopover>
                        </UFormGroup>
                    </UFormGroup>
                    
                    <UFormGroup label="หมายเหตุ" name="remark" size="xl">
                        <UInput v-model="form.remark" placeholder="" />
                    </UFormGroup>
                </div>

                <div>   
                    <UFormGroup label="ผลการตรวจสอบอุปกรณ์" name="is_active" class="flex space-x-4 items-center" size="xl">
                        <UToggle color="primary" v-model="form.is_active" />
                    </UFormGroup>
                </div>

               
                <template #footer>
                    <div class="flex items-center justify-end">
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
    import moment from 'moment'
    import { number, object, string } from 'yup'
    moment.locale('th')
    const modalAdd = ref(false)

    definePageMeta({
        middleware: ["auth"]
    })
    const auth = useAuthStore();


    const modelDeleteConfirm = ref(false)
   

    const columns = [{
        key: 'id',
        label: 'ลำดับที่',
        class: 'text-center'
    }, {
        key: 'item_name',
        label: 'อุปกรณ์'
    }, {
        key: 'item_type',
        label: 'ประเภท'
    }, {
        key: 'item_cate',
        label: 'หมวดหมู่'
    }, {
        key: 'brand',
        label: 'ยีห้อ'
    }, {
        key: 'model',
        label: 'รุ่น'
    }, {
        key: 'serial_number',
        label: 'Serial Number'
    }, {
        key: 'contract',
        label: 'เลขสัญญา'
    }, {
        key: 'is_in_warranty',
        label: 'การรับประกัน',
        class: 'text-center'
    }, {
        key: 'status',
        label: 'สถานะ',
        class: 'text-center'
    }, {
        key: 'actions'
    }]

    const page = ref(1)
    const pageCount = ref(20)
    const pageTotal = computed(() => lists.value.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
    const selected = ref([])
    const search = ref('')
   
    const itemsType = ref()
    const itemsCate = ref()


    onMounted(() => {
        getItemType()
        getItemCate()

    })
    

    const getItemType = async () => {
        const res = await getMasterType('HD_ITEMTYPE', '', '')

        itemsType.value = res
    }

    const getItemCate = async () => {
        const res = await getMasterType('HD_ITEMCATE', '', '')

        itemsCate.value = res
    }

    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await getListItems(search.value, '')

            if( search.value !== ''  && page.value > 1) {
                page.value = 1
            }
            return {
                total: data.length,
                data: data.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
            }
        }, {
            watch: [page, search, pageCount]
        }
    )

    const empty = {
        item_id:"",//กรณีเพิ่มใหม่ให้ปล่อยว่างถ้า แก้ไขให้ใส่ค่าพัสดุที่ต้องการ update
        item_ref:"",//รหัสอ้างอิง ใช้แทนรหัสพัสดุ
        item_name:"",//ชื่อพัสดุ
        item_type:"",// ประเภท ส่งค่าจาก dropdown  ที่มากจาก masterTypeID =HD_ITEMTYPE
        item_cate: "",
        brand:"",//ยี่ห้อพัสดุ
        model:"",//รุ่น
        serial_number:"",
        is_in_warranty: false,
        warranty_expiration_date: null,
        remark:"",  
        contact:"",//เบอร์ติดต่อ
        contract:"",//เลขที่สัญญา 
        created_by:auth.username,//current user login 
        modified_by:"",//current user login กรณีที่ต้องการแก้ไข
        qty_bal: "1",
        is_active: true
    }

    const form = ref(empty)

    const addItem = () => {
        form.value = {
            item_id:"",//กรณีเพิ่มใหม่ให้ปล่อยว่างถ้า แก้ไขให้ใส่ค่าพัสดุที่ต้องการ update
            item_ref:"",//รหัสอ้างอิง ใช้แทนรหัสพัสดุ
            item_name:"",//ชื่อพัสดุ
            item_type:"",// ประเภท ส่งค่าจาก dropdown  ที่มากจาก masterTypeID =HD_ITEMTYPE
            item_cate: "",
            brand:"",//ยี่ห้อพัสดุ
            model:"",//รุ่น
            serial_number:"",
            is_in_warranty: false,
            warranty_expiration_date: null,
            remark:"",  
            contact:"",//เบอร์ติดต่อ
            contract:"",//เลขที่สัญญา 
            created_by:auth.username,//current user login 
            modified_by:"",//current user login กรณีที่ต้องการแก้ไข
            qty_bal: "1",
            is_active: true
        }
        modalAdd.value = true
    }

      
    const schema = object({
        warranty_expiration_date: string().nullable(true).when('is_in_warranty', {
            is: (is_in_warranty) =>  is_in_warranty === true,
            then: (schema) => schema.required('ระบุวันที่หมดประกัน'),
        }),
    })

    const labelDateExpire = computed(() => form.value.warranty_expiration_date ? moment(form.value.warranty_expiration_date).format('DD/MM/YYYY') : 'หมดประกันวันที่')

    const fetchEditData = async (id) => {
        const data = await getApi(`/hd/Items/GetDocSet?item_id=${id}`)
        form.value = data.itemInfo

        modalAdd.value = true
    }

    const submit = async () => {

    console.log('test');
        const res = await postApi('/hd/Items/Save', form.value)

        if(res.outputAction.result === 'ok') {
            refresh()
        }
        modalAdd.value = false
    }


    const itemDelete = ref()


    const deleteItem = async () => {
        const res = await deleteApi('/hd/Items/DeleteDoc', {
            ItemID: itemDelete.value,//รหัสสินค้า
            DeletedBy:auth.username//current user login
        })

        modelDeleteConfirm.value = false

        refresh()
    }

</script>

<style lang="scss" scoped>

</style>