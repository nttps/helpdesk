<template>
    <div>
        <PartialsTitle title="อุปกรณ์" url-back="/settings/inventory" :text-button="`เพิ่มประเภท`" title-breadcrum="ประเภท" @add="addNew" :priority="false" />
        <div class="mt-8">
            <div class="search-bar flex justify-center items-center mb-2">
                <div class="min-w-3xl w-96">
                    <UInput placeholder="ค้นหา" v-model="search" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
                <UButton icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray"/>
            </div>
            <UTable 
                v-model="selected" 
                :columns="columns" 
                :rows="rows" 
                :loading="pending" 
                :loading-state="{ label: 'กำลังโหลด ...' }" 
                :empty-state="{ label: 'ไม่พบรายการ' }"
            > 

                <template #id-data="{ row, index }">
                    <div >{{ pageFrom + index }}</div>
                </template>

                <template #actions-data="{ row }">
                    <UButton color="amber" variant="ghost" icon="i-heroicons-pencil-solid"  @click="fetchEditData(row.valueTXT)" />
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
                  :total="types.length" 
                />
            </div>
        </div>
    </div>
    <UModal v-model="modalAdd"  :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form" :schema="schema" @submit="submit">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            เพิ่มประเภท
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <UFormGroup label="ประเภท" name="description1" size="xl">
                    <UInput v-model="form.description1" placeholder="" />
                </UFormGroup>
                
                <template #footer>
                    <div class="flex items-center justify-end space-x-2">
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

    import { object, string } from 'yup'
    definePageMeta({
        middleware: ["auth"]
    })


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
    const pageCount = ref(10)
    
    const selected = ref([])
    const pageTotal = computed(() => types.value.length)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

    const modelDeleteConfirm = ref(false)
    const itemDelete = ref(null)

    const rows = computed(() => {
        return  types.value.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
    })

    
   
    const { data: types, pending, refresh } = await useAsyncData('types', () => getMasterType(`HD_ITEMTYPE`, search.value)
        , {
            default: () => [],
            watch: [page, search, pageCount]
        }
    )

    const modalAdd = ref(false)

    const form = ref({
        MasterTypeID: "HD_ITEMTYPE",
        valueTXT: `HD_ITEMTYPE_${Math.random().toString(16).slice(2)}`,
        description1: "", 
        description2: ""
    })

    const addNew = () => {
        form.value ={
            masterTypeID:"HD_ITEMTYPE",
            valueTXT: `HD_ITEMTYPE_${Math.random().toString(16).slice(2)}`,
            description1:"",
        }
        modalAdd.value = true
    }

    const schema = object({
        description1: string().required('กรอกรายประเภทอุุปกรณ์'),
    })

    const auth = useAuthStore();

    const submit = async () => {
        const res = await addMasterType(form.value)
        refresh()
        resetForm()
    }
  
    const deleteItem = async () => {
        const res = await deleteMasterType({
            MasterTypeID:"HD_ITEMTYPE",
            Value: itemDelete.value,
            DeletedBy:auth.username
        })

         modelDeleteConfirm.value = false

        refresh()
       
    }

    const fetchEditData = async (value) => {
        const data = await postApi(`/MasterType/GetValue`, {
            MasterTypeID:"HD_ITEMTYPE",
            Value: value

        })
        form.value = data
        modalAdd.value = true; 
    }

    const resetForm = () => {
       
        form.value ={
            masterTypeID:"HD_ITEMTYPE",
            valueTXT: `HD_ITEMTYPE_${Math.random().toString(16).slice(2)}`,
            description1:"",
        }

        modalAdd.value = false

       
    }


     const closeModal = () => {
        resetForm()
    }
</script>