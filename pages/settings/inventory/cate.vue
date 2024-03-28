<template>
    <div>
        <PartialsTitle title="อุปกรณ์" url-back="/settings/inventory" :text-button="`เพิ่มหมวดหมู่`" title-breadcrum="หมวดหมู่" @add="addNew" :priority="false" />
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

                 <template #iconUrl-data="{ row }">
                    <UAvatar :src="row.iconUrl" size="md" />
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
                            เพิ่มหมวดหมู่
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <UFormGroup label="หมวดหมู่" name="description1" size="xl" class="mb-2">
                    <UInput v-model="form.description1" placeholder="" />
                </UFormGroup>
                <UFormGroup label="Icon (ขนาด 50*50 px)" name="file" size="xl">
                    <UAvatar :src="previewImage" size="xl" />
                    <UInput type="file" v-model="form.icon" size="sm" @input="pickFile" accept="image/png, image/gif, image/jpeg" />
                </UFormGroup>
                
                
                <template #footer>
                    <div class="flex items-center justify-end space-x-2">
                        <UButton color="amber" label="บันทึก" :loading="loading" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
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
        key: 'iconUrl',
        label: 'Icon'
    },{
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

    
   
    const { data: types, pending, refresh } = await useAsyncData('types', () => getMasterType(`HD_ITEMCATE`, search.value)
        , {
            default: () => [],
            watch: [page, search, pageCount]
        }
    )

    const modalAdd = ref(false)

    const form = ref({
        MasterTypeID: "HD_ITEMCATE",
        valueTXT: `HD_ITEMCATE_${Math.random().toString(16).slice(2)}`,
        description1: "", 
        description2: "",
        image: ""
    })

    const addNew = () => {
        form.value ={
            masterTypeID:"HD_ITEMCATE",
            valueTXT: `HD_ITEMCATE_${Math.random().toString(16).slice(2)}`,
            description1:"",
            image: ""
        }

        previewImage.value = ''
        modalAdd.value = true
    }

    const schema = object({
        description1: string().required('กรอกรายหมวดหมู่อุุปกรณ์'),
    })

    const auth = useAuthStore();
    const previewImage  = ref('');
    const  pickFile = (e) => {
        let file = e.target.files

        form.value.image = file[0]
        if (file && file[0]) {
          let reader = new FileReader
          reader.onload = e => {
            previewImage.value = e.target.result
          }
          reader.readAsDataURL(file[0])
        }
    }

    const loading = ref(false)

    const submit = async () => {
        const res = await addMasterType(form.value)

        if(form.value.image) {
            
            await uploadIcon()
           
        }
        refresh()
        resetForm()
    }

    const uploadIcon = async () => {

        loading.value = true

        console.log(loading.value);
        let data = new FormData();
        data.append('files', form.value.image)

        await postImage(`/MasterType/UploadMasterTypeIcon?masterTypeID=HD_ITEMCATE&value=${form.value.valueTXT}`, data)

         loading.value = false
    }
  
    const deleteItem = async () => {
        const res = await deleteMasterType({
            MasterTypeID:"HD_ITEMCATE",
            Value: itemDelete.value,
            DeletedBy:auth.username
        })

         modelDeleteConfirm.value = false

        refresh()
       
    }

    const fetchEditData = async (value) => {
        const data = await postApi(`/MasterType/GetValue`, {
            MasterTypeID:"HD_ITEMCATE",
            Value: value

        })
        form.value = data
        previewImage.value = data.iconUrl
        modalAdd.value = true; 
    }

    const resetForm = () => {
       
        form.value ={
            masterTypeID:"HD_ITEMCATE",
            valueTXT: `HD_ITEMCATE_${Math.random().toString(16).slice(2)}`,
            description1:"",
        }

        modalAdd.value = false

       
    }


     const closeModal = () => {
        resetForm()
    }
</script>