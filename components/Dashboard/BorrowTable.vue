<template>

    <UTable 
        v-model="selected" 
        :columns="columns" 
        :rows="listBorrow.data" 
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
        <UForm :state="form" @submit="submitRequest">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            อนุมัติยืม-คืนพัสดุ
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalApprove = false;" />
                    </div>
                </template>


                <div class="relative">
                    <div class="absolute right-2 top-0">
                        <UBadge size="lg" :label="form.status" :color="form.status == 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)' ? 'red' : 'emerald'" variant="subtle" />
                    </div>

                    <div v-if="form.status === 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)'" class="text-red-600 mb-8">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status1_reason || form.status2_reason }}</div>
                    </div>
                    <FormBorrow :form="form" :auth="auth" />

                    
                    

                </div>
                
             

                <template #footer v-if="form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)' || form.status == 'รอ ผอ.ทส.ตรวจสอบ'">
                    <div class="flex items-center justify-end space-x-4" >
                        <UButton color="green" label="อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(true)" />
                        <UButton color="red" label="ไม่อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(false)" />
                        <UButton color="gray" @click="modalApprove = false; " label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
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
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalConfirmApprove = false;">ยกเลิก</button>
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
    const props = defineProps(['modelValue', 'pending', 'listBorrow', 'pageFrom'])
    const emit = defineEmits(['update:model-value', 'refresh'])


    const modalConfirmApprove = ref(false)

    const columns = [{
        key: 'id',
        label: 'ลำดับที่',
        sortable: false
    }, {
        key: 'req_date',
        label: 'ว/ด/ป'
    }, {
        key: 'req_by_user_id',
        label: 'ผู้ยืม'
    },{
        
        key: 'count_item',
        label: 'จำนวนอุปกรณ์ที่ยืม'
    }, {
        key: 'department_id',
        label: 'หน่วยงาน'
    }, {
        key: 'phone_req',
        label: 'โทรศัพท์'
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


            if(row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติยืมพัสดุประจำหน่วยงาน' && g.isInGroup === true) || row.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true) || row.status == 'รอ ผอ.ทส.ตรวจสอบ' && auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true)) {
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

    const form = ref({})
    const modalApprove = ref(false)

    const fetchEditData = async (id, approve = false, isReturn = false) => {

        dataApprove.value.ReqID = id
        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)

        form.value = data.requestHead
        form.value.items = data.requestItemType
        form.value.borrowItems = data.requestItem


        form.value.location_unit = data.requestHead.location_unit ||  data.requestHead.department_id 


        form.value.items.map(async e => {
            const data = e

            data.inventory = await getListItems('', '', data.item_type)

            return data
        })
       
        if(approve) {
            modalApprove.value = true;
        }else if(isReturn) {
            dataReturn.value.ReqID = id
            modalReturn.value = true
        }
    }
    const submitRequest = async () => {
        const res = await postApi('/hd/request/SaveBorrow', {
            RequestHead: form.value,
            RequestItemType: form.value.items.map(item => {

                return {
                    item_type: item.item_type, //MasterType (HD_ITEMTYPE)
                    item_cate: item.item_cate,//MasterType (HD_ITEMCATE)
                    qty: parseInt(item.qty),
                    brand:"",
                }
            }),
            RequestItem:  form.value.borrowItems.map(item => {
                return {
                    item_id: item.item_id, //MasterType (HD_ITEMTYPE)
                    serial_number: item.serial_number,//MasterType (HD_ITEMCATE)
                    qty: 1,
                }
            }),
        })

        
        if(res.outputAction.result === 'ok') {
            emit('refresh')
        }
    }

    const submitApprove = async () => {

        if(form.value.status === 'รอตรวจสอบ(ทส.)') {
            submitRequest()
        }

        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

        modalConfirmApprove.value = false
        modalApprove.value = false
        emit('refresh')
    }

     const approveRequest = (approve) => {
        dataApprove.value.Action = approve ? "อนุมัติ" : "ปฏิเสธ"
        modalConfirmApprove.value = true
    }

</script>