<template>
    <SettingsCCTV type="case" @add="modalAdd = true"  v-model="search">

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
                    <UButton color="amber" variant="ghost" icon="i-heroicons-pencil-solid" @click="fetchEditData(row.valueTXT)" />
                    <UButton color="red" variant="ghost" icon="i-heroicons-trash-20-solid" @click="modelDeleteConfirm = true; itemDelete = row.valueTXT" />
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
           
    </SettingsCCTV>

    <UModal v-model="modalAdd"  :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form" :schema="schema" @submit="submit">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            เพิ่มชื้นส่วน
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <UFormGroup label="หมวดหมู่" name="parentValue" size="xl" class="mb-2">
                    <USelectMenu 
                        v-model="form.parentValue"
                        :options="categories" 
                        value-attribute="valueTXT" 
                        option-attribute="description1" 
                        placeholder="หมวดหมู่" 
                        searchable
                        searchable-placeholder="ค้นหาหมวดหมู่"
                    />
                </UFormGroup>

                <UFormGroup label="ประเภท" name="parentValue" size="xl" class="mb-2">
                    <USelectMenu 
                        v-model="form.parentValue"
                        :options="categories" 
                        value-attribute="valueTXT" 
                        option-attribute="description1" 
                        placeholder="ประเภท" 
                        searchable
                        searchable-placeholder="ค้นหาประเภท"
                    />
                </UFormGroup>

                <UFormGroup label="ชิ้นส่วน" name="description1" size="xl">
                    <UTextarea v-model="form.description1" placeholder="" autoresize :rows="8" />
                </UFormGroup>
                
                <template #footer>
                    <div class="flex items-center justify-end space-x-2">
                        <UButton color="amber" label="บันทึก" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                        <UButton color="gray" @click="modalAdd = false; closeModal()" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
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

    import { object, string } from 'yup'
    definePageMeta({
        middleware: ["auth"]
    })
    const auth = useAuthStore();


    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'description1',
        label: 'รายการ'
    }, {
        key: 'actions'
    }]

    const search = ref('')
    const page = ref(1)
    const pageCount = ref(20)
    
    const selected = ref([])
    const pageTotal = computed(() => lists.value.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
    
    const modelDeleteConfirm = ref(false)
    const itemDelete = ref(null)
   
    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await getMasterType(`HD_CCTV_REASON`, search.value)

            if(search.value !== ''  && page.value > 1 ) {
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

    const modalAdd = ref(false)
    const form = ref({
        MasterTypeID: "HD_CCTV_REASON",
        ValueTXT: `CCTV_REASON_${Math.random().toString(16).slice(2)}`,
        description1: "", 
        description2: "",
        parentID: "HD_ITEMTYPE",
        parentValue: ""
    })

    const fetchEditData = async (value) => {
        const data = await postApi(`/MasterType/GetValue`, {
            MasterTypeID:"HD_CCTV_REASON",
            Value: value

        })
        form.value = data
        modalAdd.value = true; 
    }


    const closeModal = () => {
        form.value = {
            MasterTypeID: "HD_CCTV_REASON",
            ValueTXT: `CCTV_REASON_${Math.random().toString(16).slice(2)}`,
            description1: "",
            description2: "",
            parentID: "HD_ITEMTYPE",
            parentValue: ""
        }
    }

    const schema = object({
        description1: string().required('กรอกรายละเอียดกรณี'),
    })


    const submit = async () => {
        const res = await addMasterType(form.value)

        if(res.outputAction.result === 'ok') {
            modalAdd.value = false

            form.value = {
                MasterTypeID: "HD_CCTV_REASON",
                ValueTXT: `CCTV_REASON_${Math.random().toString(16).slice(2)}`,
                description1: "", 
                description2: "",
                parentID: "HD_ITEMTYPE",
                parentValue: ""
            }
            refresh()
        }
    }

    const deleteItem = async () => {
        const res = await deleteMasterType({
            MasterTypeID:"HD_CCTV_REASON",
            Value: itemDelete.value,
            DeletedBy: auth.username
        })

        modelDeleteConfirm.value = false

        refresh()
    }

    
  
</script>