<template>
    <div>
        <PartialsTitle title="ผู้ใช้งาน" url-back="/settings" title-breadcrum="ตั้งค่า" noAdd/>
        <div class="mt-8">
            <div class="search-bar flex justify-center items-center mb-2">
                <div class="min-w-3xl w-96">
                    <UInput placeholder="ค้นหา" v-model="textSearch" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
                <UButton icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray"/>
            </div>
            <UTable 
                v-model="selected" 
                :columns="columns" 
                :rows="lists.userInfo" 
                :loading="pending" 
                :loading-state="{ label: 'กำลังโหลด ...' }" 
                :empty-state="{ label: 'ไม่พบรายการ' }"
            > 

                <template #id-data="{ row, index }">
                    <div >{{  pageFrom + index }}</div>
                </template>

                <template #actions-data="{ row }">
                    <UButton color="amber" variant="ghost" icon="i-heroicons-eye-20-solid"  @click="fetchEditData(row)"/>
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
                  :total="lists.pageInfo.total" 
                />
            </div>
        </div>
    </div>
    <UModal v-model="modalAdd"  :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form"  @submit="submit">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            ข้อมูล User
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <UFormGroup label="ชื่อผู้ใช้งาน ( Username )" name="description1" size="xl">
                    <UInput v-model="form.username" disabled readonly />
                </UFormGroup>
                <UFormGroup label="ชื่อ - นามสกุล" name="description1" size="xl">
                    <UInput v-model="form.fullName" disabled readonly />
                </UFormGroup>
                <UFormGroup label="ตำแหน่ง" name="description1" size="xl">
                    <UInput v-model="form.positionID" disabled readonly />
                </UFormGroup>

                <div class="mt-4">
                    <div class="mb-2 font-bold">กลุ่มผู้ใช้งาน</div>
                    <UCheckbox :label="group.name" :value="group.userGroupID" v-for="group in form.groups" @change="changeGroup" :model-value="group.x"/>
                </div>

                <template #footer>
                    <div class="flex items-center justify-end space-x-2">
                        <UButton color="gray" @click="modalAdd = false; closeModal()" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>

        <UModal v-model="modelConfirm">
            <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <div class="text-center">แจ้งเตือนการยืนยัน</div>
            </template>

            <div class="font-bold text-xl text-center">คุณต้องการเปลี่ยนแปลงกลุ่มผู้ใช้งานใช่หรือไม่</div>

            <template #footer>
                <div class="flex justify-between">
                    <button type="button" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="groupSubmit">ยืนยัน</button>
                    <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modelConfirm = false">ยกเลิก</button>
                </div>
            </template>
            </UCard>
        </UModal>
    </UModal>

   

    
</template>


<script setup>
    definePageMeta({
        middleware: ["auth"]
    })


    const textSearch = ref('')

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'username',
        label: 'ชื่อผู้ใช้งาน ( Username )'
    }, {
        key: 'positionID',
        label: 'ตำแหน่ง'
    }, {
        key: 'departmentDesc',
        label: 'แผนก'
    }, {
        key: 'actions',
         label: 'จัดการกลุ่ม'
    }]

    const allGroups = ref([])

    const search = ref('')
    const page = ref(1)
    const pageCount = ref(20)

    const modelConfirm = ref(false)
    const itemDelete = ref(null)

    
    const selected = ref([])
    const pageTotal = computed(() => lists.value.pageInfo.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
    
    onMounted(() => {
        fetchGroups()
    })

    const fetchGroups = async () => {
        const data = await getApi('/Person/ListUserGroup?appid=HELP DESK')

        console.log(data);
        allGroups.value = data
    }

    const selectGroup = ref(null)
    const stateGroup = ref(false)
    const userGroup = ref(false)



    const checkGroup =(group , groups) => {
        if(groups)
            return !!groups.some(g => g.userGroupID === group.userGroupID)
    }

    const changeGroup = async (e) => {

        stateGroup.value = e.target.checked
        selectGroup.value = e.target.value
        userGroup.value = form.value.username

       
        modelConfirm.value = true
    }

    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await postApi('/Person/ListUserInfoWithPage', {
                "Search": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "skip": page.value > 1 ? pageCount.value : 0,//วันที่แจ้งซ่อมเริ่ม
                "take": pageCount.value,//ถึงวันที่ซ่อม
            })

            return data
        }, {
            watch: [page, pageCount, textSearch]
        }
    )

    const groupSubmit = async() => {
        if(!stateGroup.value) {
            const data = await deleteApi('/Person/DeleteUserFromGroup', {
                "Username": userGroup.value,
                "GroupID": selectGroup.value,
                "AppID":"HELP DESK"
            })
        }else {
            const data = await postApi('/Person/AddUserToGroup', {
                "Username":  userGroup.value,
                "GroupID":selectGroup.value,
                "AppID":"HELP DESK"
            })
        }

        modelConfirm.value = false

    }

     
    const modalAdd = ref(false)

    const form = ref({})

    const fetchEditData = async (value) => {
        const data = await getApi(`/Person/ListUserInGroup?username=${value.username}&appid=HELP DESK`)
       
        form.value = value
        form.value.groups = data
        modalAdd.value = true; 
    }

    const closeModal = () => {
        form.value = {}
    }


    const submit = async () => {
        const res = await addMasterType(form.value)

        if(res.outputAction.result === 'ok') {
            modalAdd.value = false
            refresh()
            form.value = {
                MasterTypeID: "HD_REPAIR_PURPOSE",
                ValueTXT: `REPAIR_PURPOSE_${Math.random().toString(16).slice(2)}`,
                description1: "", 
                description2: ""
            }
            
        }
    }
  
    const deleteItem = async () => {
        const res = await deleteMasterType({
            MasterTypeID:"HD_REPAIR_PURPOSE",
            Value: itemDelete.value,
            DeletedBy:"tammon.y"
        })

        modelConfirm.value = false
        refresh()
    }
</script>