<template>

    <UTable 
        v-model="selected" 
        :columns="columns" 
        :rows="listRepair.data" 
        :loading="pending" 
        :loading-state="{ label: 'กำลังโหลด ...' }" 
        :empty-state="{ label: 'ไม่พบรายการ' }"
        by="req_id"
    > 
        <template #id-data="{ row, index }">
            <div >{{ pageFrom + index }}</div>
        </template>

        <template #department_id-data="{ row }">
            <div>{{ row.department_id ?? '-' }}</div>
        </template>

        <template #req_by_user_id-data="{ row }">
            <div>{{ row.req_by_fullname ? row.req_by_fullname : row.req_by_user_id }}</div>
        </template>
        

        <template #req_date-data="{ row }">
            <div>{{ moment(row.req_date).format('DD/MM/YYYY') }}</div>
        </template>

        <template #actions-data="{ row }">
            <UDropdown :items="items(row)" :popper="{ placement: 'bottom-start' }">
                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
            </UDropdown>
        </template>
    </UTable>
    

    <UModal v-model="modalApprove" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UForm :state="form">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            อนุมัติรายการแจ้งซ่อม
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalApprove = false;" />
                    </div>
                </template>


                <div class="relative">
                    <div class="absolute right-2 top-2">
                        <UBadge size="lg" :label="form.status" :color="form.status == 'ปฏิเสธจากหน่วยงาน' ? 'red' : 'emerald'" variant="subtle" />
                    </div>
                

                    <div class="grid grid-cols-3 gap-8 mb-4">
                        <UFormGroup label="วันที่" name="start_date" size="md">
                            {{ labelDate }}
                        </UFormGroup>
                        <UFormGroup label="ผู้แจ้ง" name="req_by_user_id" size="md">
                            {{ form.req_by_fullname }}
                        </UFormGroup>
                        <UFormGroup label="เบอร์โทรศัพท์" name="telephone" size="md">
                        {{ form.phone_req }}
                        </UFormGroup>
                    </div>

                    <div class="grid grid-cols-3 gap-8 mb-4">
                        <UFormGroup label="ประเภทอุปกรณ์" name="dCenter" size="md">
                            {{ form.item_type }}
                        </UFormGroup>
                        <UFormGroup label="อุปกรณ์" name="dCenter" size="md">
                            {{ form.item_name }}
                        </UFormGroup>
                    </div>
                    <UFormGroup label="อาการเสีย/ปัญหา" name="dCenter" size="md" class="mb-6">
                        {{ form.description }}
                    </UFormGroup>

                    <div v-if="form.status === 'ปฏิเสธจากหน่วยงาน'" class="text-red-600">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status1_reason || form.status2_reason }}</div>
                    </div>
                </div>

                <template #footer>
                    <div class="flex items-center justify-end space-x-4">
                        <UButton v-if="form.status === 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId.includes('ผู้ตรวจสอบการแจ้งซ่อม(ทส.)') && g.isInGroup === true) || form.status === 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId.includes('ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน') && g.isInGroup === true)" color="green" label="อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(true)" />
                        <UButton v-else color="green" label="แจ้งซ่อมเสร็จ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="modalFinish = true" />
                        <UButton color="red" v-if="form.status !== 'ส่งซ่อม'"  label="ไม่อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(false)" />
                        <UButton color="gray" @click="modalApprove = false;" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>

        <UModal v-model="modalConfirmApprove" prevent-close>
            <UForm :state="dataApprove" @submit="submitApprove">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="text-center">แจ้งเตือนการยืนยัน</div>
                    </template>

                    <div class="font-bold text-xl text-center" v-if="dataApprove.Action === 'อนุมัติ'">อนุมัติข้อมูลนี้ใช่หรือไม่</div>

                    <div v-else>
                        
                        <div class="text-red-600 font-bold text-xl text-center">ไม่อนุมัติรายการนี้ใช่หรือไม่</div>
                        <UFormGroup label="กรอกเหตุผล" name="Reason" size="xl">
                            <UTextarea v-model="dataApprove.Reason" placeholder="" required/>
                        </UFormGroup>
                    </div>


                    <template #footer>
                        <div class="flex justify-between">
                            <button type="submit" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white">ตกลง</button>
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalConfirmApprove = false">ยกเลิก</button>
                        </div>
                    </template>
                </UCard>
            </UForm>
        </UModal>

        <UModal v-model="modalFinish" prevent-close>
            <UForm :state="dataFinish" @submit="submitFinish">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="text-center">แจ้งเตือนการยืนยัน</div>
                    </template>
                    <div>
                        <UFormGroup label="ซ่อมโดย" name="ActiondBy" size="xl">
                            <UTextarea v-model="dataFinish.ActiondBy" placeholder="" required/>
                        </UFormGroup>
                        <UFormGroup label="ผลการแก้ไข" name="Result_report" size="xl">
                            <UTextarea v-model="dataFinish.Result_report" placeholder="" required/>
                        </UFormGroup>
                    </div>


                    <template #footer>
                        <div class="flex justify-between">
                            <button type="submit" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white">ตกลง</button>
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalFinish = false">ยกเลิก</button>
                        </div>
                    </template>
                </UCard>
            </UForm>
        </UModal>
    </UModal>


    <UModal v-model="modalConfirmApprove" prevent-close>
        <UForm :state="dataApprove" @submit="submitApprove">
            <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="text-center">แจ้งเตือนการยืนยัน</div>
                </template>

                <div class="font-bold text-xl text-center" v-if="dataApprove.Action === 'อนุมัติ'">อนุมัติข้อมูลนี้ใช่หรือไม่</div>

                <div v-else>
                    
                    <div class="text-red-600 font-bold text-xl text-center">ไม่อนุมัติรายการนี้ใช่หรือไม่</div>
                    <UFormGroup label="กรอกเหตุผล" name="Reason" size="xl">
                        <UTextarea v-model="dataApprove.Reason" placeholder="" required/>
                    </UFormGroup>
                </div>


                <template #footer>
                    <div class="flex justify-between">
                        <button type="submit" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white">ตกลง</button>
                        <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalConfirmApprove = false;">ยกเลิก</button>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>
</template>


<script setup>

    import moment from 'moment'
    const props = defineProps(['modelValue', 'pending', 'listRepair', 'pageFrom'])
    const emit = defineEmits(['update:model-value', 'refresh'])


     onMounted(() => {
        fetchTypeService()
        fetchTypeContact()

    })

    const modalConfirmApprove = ref(false)

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'req_date',
        label: 'ว/ด/ป'
    }, {
        key: 'item_name',
        label: 'อุปกรณ์'
    }, {
        key: 'description',
        label: 'ความเสีย/ปัญหา'
    }, {
        key: 'req_by_user_id',
        label: 'ผู้แจ้ง'
    }, {
        key: 'department_id',
        label: 'หน่วยงาน'
    }, {
        key: 'phone_req',
        label: 'โทรศัพท์'
    }, {
        key: 'fix_by',
        label: 'ผู้ซ่อม'
    }, {
        key: 'result_report',
        label: 'ผลการแก้ไข'
    }, {
        key: 'urgent_level',
        label: 'ความสำคัญ'
    }, {
        key: 'status',
        label: 'สถานะ'
    }, {
        key: 'actions'
    }]
    const selected = computed({
        get: () => props.modelValue,
        set: (value) => {
            emit('update:model-value',  value)
        }
    })

    const auth = useAuthStore()

    const items = (row) => {

        let btn = []


            if((row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน' && g.isInGroup === true) ) || (row.status == 'รอตรวจสอบ(ทส.)' &&  auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
            btn.push({
                label: 'อนุมัติ',
                icon: 'i-heroicons-archive-box-20-solid',
                click: () => fetchEditData(row.req_id, true)
            })
        }
            
        return [btn]
    }

  
    


    const dataApprove = ref({
        ReqID:"",  
        Action:"",//สถานะมี 2 สถานะคือ  (อนุมัติ , ปฏิเสธ)
        ActiondBy:auth.username,//อนุมัติหรือปฏิเสธโดย
        Reason:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

    const servicesType = ref([])
    const contactType = ref([])

    const fetchTypeContact = async () => {
        contactType.value = await getMasterType(`HD_CONTACT`, '')
    }
    const fetchTypeService = async () => {
        servicesType.value = await getMasterType(`HD_SERVICE_TYPE`, '')
    }

    const form = ref({})
    const modalApprove = ref(false)
    const modalFinish = ref(false)
    const dataFinish = ref({
        ReqID:"",  
        ActiondBy:"",//อนุมัติหรือปฏิเสธโดย
        Result_report:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

    const labelDate = computed(() => moment(form.value.req_date).format('DD/MM/YYYY'))

    const fetchEditData = async (id, approve = false, view = false) => {
        dataApprove.value.ReqID = id
        dataFinish.value.ReqID = id

        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)
        form.value = data.requestHead

        
        form.value.services = data.requestService.map(service => {
            return {
                valueTXT: service.service_type,
                is_select: service.is_select,
                description1: servicesType.value.find(s => s.valueTXT === service.service_type).description1
            }
        })


        if(!approve) {
            modalAdd.value = true; 
        }else {
            modalApprove.value = true;
        }

    }

    
    const submitApprove = async () => {
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        console.log(res);

        modalConfirmApprove.value = false
        modalApprove.value = false

        emit('refresh')
    }
    

    const submitFinish = async () => {
        const res = await postApi('/hd/request/FinishRepair', dataFinish.value)

        modalApprove.value = false
        modalFinish.value = false
        emit('refresh')
    }


   

    const approveRequest = (approve) => {
        dataApprove.value.Action = approve ? "อนุมัติ" : "ปฏิเสธ"
        modalConfirmApprove.value = true
    }

</script>