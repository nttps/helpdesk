<template>
    <div>
        <PartialsTitle title="ชิ้นส่วน" no-add />
        <div class="mt-8">
            <div class="search-bar flex items-center justify-between mb-2">
                <div class="flex space-x-3">
                    <UInput placeholder="ค้นหาจากชื่อชิ้นส่วน" v-model="search" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                    <USelect placeholder="ค้นหาจากสถานะ" :options="['ทั้งหมด', 'ว่าง', 'ไม่ว่าง']" v-model="searchStatus"  size="xl"/>
                </div>
                <div>
                    <UButton
                        icon="i-heroicons-plus-20-solid"
                        size="md"
                        variant="solid"
                        label="ชิ้นส่วน"
                        :trailing="false"
                        @click="addItem"
                    />
                </div>
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
        <UForm :state="form" @submit="submit">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            คลังชิ้นส่วน
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <UFormGroup label="หมวดหมู่" name="item_type" size="xl" class="mb-4">
                    <USelectMenu 
                        :options="itemsCate" 
                        placeholder="เลือกหมวดหมู่" 
                        size="xl"
                        v-model="form.spare_cate"
                        value-attribute="valueTXT" 
                        option-attribute="description1" 
                        @update:model-value="getItemType"
                        searchable
                        searchable-placeholder="ค้นหาประเภทชิ้นส่วน"
                    />
                </UFormGroup>
                <UFormGroup label="ประเภทชิ้นส่วน" name="item_type" size="xl" class="mb-4" >
                    <USelectMenu 
                        :options="itemsType" 
                        placeholder="เลือกประเภทชิ้นส่วน" 
                        size="xl"
                        v-model="form.spare_type"
                        value-attribute="valueTXT" 
                        option-attribute="description1" 
                        searchable
                        searchable-placeholder="ค้นหาประเภทชิ้นส่วน"
                    />
                </UFormGroup>
                
                <UFormGroup label="ชื้นส่วน" name="brand" size="xl" class="mb-4">
                    <UInput v-model="form.spare_name" placeholder="" />
                </UFormGroup>
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
        key: 'spare_cate_desc',
        label: 'หมวดหมู่'
    }, {
        key: 'spare_type_desc',
        label: 'ประเภท'
    }, {
        key: 'spare_name',
        label: 'ชิ้นส่วน'
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
    const searchStatus = ref('ทั้งหมด')
   
    const itemsType = ref()
    const itemsCate = ref()


    onMounted(() => {
        getItemCate()
    })
    
    const getItemType = async (cate) => {
        const res = await getMasterType('HD_ITEMTYPE', '', cate)
        itemsType.value = res
    }

    const getItemCate = async () => {
        const res = await getMasterType('HD_ITEMCATE', '', '')
        itemsCate.value = res
    }

    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await getSpares(search.value)

            if( search.value !== ''  && page.value > 1) {
                page.value = 1
            }

            console.log(data);
            return {
                total: data.length,
                data: data.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
            }
        }, {
            watch: [page, search, pageCount, searchStatus]
        }
    )

    const empty = {
        spare_id:"",//กรณีเพิ่มใหม่ให้ปล่อยว่างถ้า แก้ไขให้ใส่รหัสอะไหล่ที่ต้องการ update
        spare_ref:"",//รหัสอ้างอิง ใช้แทนรหัสอะไหล่
        spare_name:"",//ชื่ออะไหล่
        spare_cate:"",//หมวดอุปกรณ์
        spare_type:"",// ประเภท ส่งค่าจาก dropdown  ที่มากจาก masterTypeID =HD_ITEMTYPE
        brand:"",//ยี่ห้ออะไหล่
        model:"",//รุ่น
        serial_number:"",
        remark:"",  
        created_by: auth.username,//current user login 
        modified_by:""//current user login กรณีที่ต้องการแก้ไข
    }

    const form = ref(empty)

    const addItem = () => {
        form.value = {
            spare_id:"",//กรณีเพิ่มใหม่ให้ปล่อยว่างถ้า แก้ไขให้ใส่รหัสอะไหล่ที่ต้องการ update
            spare_ref:"",//รหัสอ้างอิง ใช้แทนรหัสอะไหล่
            spare_name:"",//ชื่ออะไหล่
            spare_cate:"",//หมวดอุปกรณ์
            spare_type:"",// ประเภท ส่งค่าจาก dropdown  ที่มากจาก masterTypeID =HD_ITEMTYPE
            brand:"",//ยี่ห้ออะไหล่
            model:"",//รุ่น
            serial_number:"",
            remark:"",  
            created_by: auth.username,//current user login 
            modified_by:""//current user login กรณีที่ต้องการแก้ไข
        }
        modalAdd.value = true
    }

    const fetchEditData = async (id) => {
        const data = await getApi(`/hd/spare/GetDocSet?item_id=${id}`)
        form.value = data.itemInfo
        await getItemType(form.value.item_cate)

        modalAdd.value = true
    }

    const submit = async () => {
        const res = await postApi('/hd/spare/Save', form.value)

        if(res.outputAction.result === 'ok') {
            refresh()
        }
        modalAdd.value = false
    }

    const itemDelete = ref()
    const deleteItem = async () => {
        const res = await deleteApi('/hd/spare/DeleteDoc', {
            ItemID: itemDelete.value,//รหัสสินค้า
            DeletedBy:auth.username//current user login
        })

        modelDeleteConfirm.value = false
        refresh()
    }
</script>

<style lang="scss" scoped>

</style>