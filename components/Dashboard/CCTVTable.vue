<template>

    <UTable 
        v-model="selected" 
        :columns="columns" 
        :rows="listCCTV.data" 
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
                            รายการคำขอ
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalApprove = false" />
                    </div>
                </template>

                <div>
                    <div class="flex justify-between mb-2">
                        <div class="flex justify-between w-full">
                            <h3 class="font-bold leading-6 text-xl">รายละเอียดคำร้อง</h3>
                            <UBadge size="lg" :label="form.status" :color="form.status == 'ปฏิเสธ' ? 'red' : 'emerald'" variant="subtle" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <div class="grid grid-cols-2 mb-2">
                                <UFormGroup label="วันที่ยื่นคำร้อง" name="type" size="xl">
                                    <div class="text-zinc-700">{{ labelDateRequest }}</div>
                                </UFormGroup>
                                <UFormGroup label="ความสำคัญ" name="type" size="xl">
                                    <div class="text-zinc-700">{{ form.urgent_level  }}</div>
                                </UFormGroup>
                            </div>
                            <UFormGroup label="สถานที่" class="mb-4" name="type" size="xl">
                                <div class="text-zinc-700">{{ form.location != "" ? form.location : '-' }}</div>
                            </UFormGroup>
                            <div class="grid grid-cols-2 mb-4">
                                <UFormGroup label="ตั้งแต่วันที่" class="mb-4" name="type" size="xl">
                                    <div class="text-zinc-700">{{ labelDateTimeBegin }}</div>
                                </UFormGroup>
                                <UFormGroup label="ถึงวันที่" name="type" size="xl">
                                    <div class="text-zinc-700"> {{ labelDateTimeEnd }}</div>
                                </UFormGroup>
                            </div>
                        </div>
                        <div>
                            <UFormGroup label="วัตถุประสงค์" class="mb-2" name="type" size="xl">
                                <div class="text-zinc-700">{{ form.purpose_desc }}</div>
                            </UFormGroup>
                            <div class="grid grid-cols-2 gap-x-4 w-full">
                                <UFormGroup label="อาคาร" class="mb-4" name="type" size="xl">
                                    <div class="text-zinc-700">{{ form.building_id }}</div>
                                </UFormGroup>
                                <UFormGroup label="ชั้น" class="mb-4" name="type" size="xl">
                                    <div class="text-zinc-700">{{ form.floor }}</div>
                                </UFormGroup>
                            </div>
                            <UFormGroup label="กรณี" name="type" size="xl">
                                <div class="text-zinc-700">{{ form.case_desc === 'กรณีอื่น ๆ' ? form.case_desc_other : form.case_desc }}</div>
                            </UFormGroup>
                        </div>
                    </div>

                    <h3 class="font-bold leading-6 text-xl mb-4">รายละเอียดผู้ยื่นคำร้อง</h3>
                    <div class="grid grid-cols-2 gap-8">
                        <UFormGroup label="ชื่อ-นามสกุล" name="type" size="xl">
                            <div class="text-zinc-700">{{ form.req_by_fullname }}</div>
                        </UFormGroup>
                        <UFormGroup label="เบอร์โทรศัพท์" name="phone_req" size="xl">
                            <div class="text-zinc-700">{{ form.phone_req }}</div>
                        </UFormGroup>
                    </div>

                    <div v-if="form.status === 'ปฏิเสธ'" class="text-red-600">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status1_reason || form.status2_reason }}</div>
                    </div>
                </div>

                <template #footer >
                    <div class="flex items-center justify-end space-x-4" >
                        <UButton color="green" label="อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(true)" />
                        <UButton color="red" label="ไม่อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(false)" />
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
    </UModal>

</template>

<script setup>
    import moment from 'moment'
    const props = defineProps(['modelValue', 'pending', 'listCCTV', 'pageFrom'])
    const emit = defineEmits(['update:model-value', 'refresh'])


    const selected = computed({
        get: () => props.modelValue,
        set: (value) => {
            emit('update:model-value',  value)
        }
    })

    const auth = useAuthStore()

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'req_date',
        label: 'ว/ด/ป'
    }, {
        key: 'req_by_user_id',
        label: 'ผู้ส่งคำขอ'
    }, {
        key: 'department_id',
        label: 'หน่วยงาน'
    }, {
        key: 'urgent_level',
        label: 'ความสำคัญ'
    }, {
        key: 'status',
        label: 'สถานะ'
    }, {
        key: 'actions'
    }]

    const items = (row) => {

        let btn = []

        if(row.status == 'รออนุมัติ(ผอ.ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติการขอดู CCTV (ทส.)' && g.isInGroup === true) || row.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการขอดู CCTV (ทส.)' && g.isInGroup === true)) {
            btn.push({
                label: 'อนุมัติ',
                icon: 'i-heroicons-archive-box-20-solid',
                click: () => fetchEditData(row.req_id, true)
            })
        }
        return [btn]
    }

   
        
    const modalApprove = ref(false)
    const modalConfirmApprove = ref(false)
    const dataApprove = ref({
        ReqID:"",  
        Action:"",//สถานะมี 2 สถานะคือ  (อนุมัติ , ปฏิเสธ)
        ActiondBy: auth.username,//อนุมัติหรือปฏิเสธโดย
        Reason:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

    const approveRequest = (approve) => {
        dataApprove.value.Action = approve ? "อนุมัติ" : "ปฏิเสธ"
        modalConfirmApprove.value = true
    }

    const form = ref({})

     const dateTimeBegin = ref(new Date())
    const labelDateTimeBegin = computed(() => moment(form.value.date_begin).format('DD/MM/YYYY hh:mm:ss'))


    const dateTimeEnd = ref(new Date())
    const labelDateTimeEnd = computed(() => moment(form.value.date_end).format('DD/MM/YYYY hh:mm:ss'))


    const dateRequest = ref(new Date())
    const labelDateRequest = computed(() => moment(form.value.req_date).format('DD/MM/YYYY'))

    const fetchEditData = async (id, approve = false, view = false) => {

        dataApprove.value.ReqID = id
        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)
        form.value = data.requestHead
        if(!approve) {
            modalAdd.value = true; 
        }else {
            modalApprove.value = true;
        }
    }
    
    const submitApprove = async () => {
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        modalConfirmApprove.value = false
        modalApprove.value = false

        
        emit('refresh')
    }
</script>

<style lang="scss" scoped>

</style>