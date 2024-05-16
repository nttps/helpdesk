<template>

    <UTable 
        :columns="columns" 
        :rows="listRepair.data" 
        :loading="pending" 
        :loading-state="{ label: 'กำลังโหลด ...' }" 
        :empty-state="{ label: 'ไม่พบรายการ' }"
        :ui="{ td: { base: 'whitespace-normal' }}"
        by="req_id"
    > 
        <template #checkbox-header="{ row, index }">
            <UCheckbox :model-value="indeterminate || selected.length === listRepair.data.length" :indeterminate="indeterminate" aria-label="Select all" @change="onChange" />
        </template>
    
        <template #checkbox-data="{ row, index }">
            <UCheckbox v-if="(row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน' && g.isInGroup === true) ) || (row.status == 'รอตรวจสอบ(ทส.)' &&  auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))" v-model="selected" :value="row" aria-label="Select row" @click.stop />
        </template>
        <template #id-data="{ row, index }">
            <div>{{ pageFrom + index }}</div>
        </template>

        <template #item_name-data="{ row }">
            <div>{{ row.item_type == 'อื่น ๆ' ? row.item_id : row.item_name }}</div>
        </template>

        <template #req_date-data="{ row }">
            <div>{{ moment(row.req_date).format('DD/MM/YYYY') }}</div>
        </template>
        <template #req_by_user_id-data="{ row }">
            <div>{{ row.req_by_fullname ? row.req_by_fullname : row.req_by_user_id }}</div>
        </template>
        <template #item_type_icon-data="{ row }">
            <UTooltip :text="row.item_cate_desc">
                <UAvatar :src="row.item_cate_icon" size="md" />
            </UTooltip>
        </template>

        
        <template #status-data="{ row }">
            <div class="font-bold text-black">{{ row.status }}</div>
            <div class="text-red-600 font-bold" v-if="row.status == 'ปฏิเสธจากหน่วยงาน' || row.status == 'ปฏิเสธจาก(ทส.)'">
                <div>เหตุผลการไม่อนุมัติ</div>  

                <div>{{ row.status2_reason || row.status1_reason }}</div>
            </div>
            <div class="text-xs text-red-600" v-if="row.latest_status_date">เมื่อ {{ moment(row.latest_status_date).format('DD/MM/YYYY เวลา HH:mm') }}</div>
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
                            {{ (isView ? 'รายการแจ้งปัญหา' : 'อนุมัติรายการแจ้งปัญหา') }}
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
                        <UFormGroup label="หมวดหมู่" name="dCenter" size="md">
                            {{ form.item_cate_desc }}
                        </UFormGroup>
                        <UFormGroup label="ประเภท" name="dCenter" size="md">
                            {{ form.item_type_desc }}
                        </UFormGroup>
                        <UFormGroup label="อุปกรณ์" name="dCenter" size="md">
                           {{ itemSelect(form.item_id)?.serial_number || 'ไม่มี Serial Number'}} - {{ itemSelect(form.item_id)?.item_name}} 
                        </UFormGroup>
                    </div>

                    
                    <UFormGroup label="ขอรับบริการด้าน" size="xl" class="mb-8">
                        <div class="pl-4 my-2">
                            <UCheckbox color="primary" 
                                :id="service.description1"
                                v-model="service.is_select" 
                                :label="service.description1" 
                                disabled
                                class="mb-2" 
                                :ui="{container: 'flex items-center h-6', base: 'h-5 w-5 dark:checked:bg-current dark:checked:border-transparent dark:indeterminate:bg-current dark:indeterminate:border-transparent disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent'}"
                                v-for="(service, index) in form.services"
                            />
                        </div>
                    </UFormGroup>
                    <UFormGroup label="อาการเสีย/ปัญหา" name="dCenter" size="md" class="mb-6">
                        {{ form.description }}
                    </UFormGroup>

                    <div v-if="form.status === 'ส่งซ่อม'">
                        <UFormGroup label="ซ่อมโดย" name="ActiondBy" size="xl" class="mb-4">
                            <UInput v-model="form.fix_by" placeholder="" required/>
                        </UFormGroup>
                        <UFormGroup label="ผลการแก้ไข" name="Result_report" size="xl">
                            <UTextarea v-model="form.result_report" placeholder="" required/>
                        </UFormGroup>
                    </div>


                  
                    <div v-if="form.status === 'ปฏิเสธจากหน่วยงาน'" class="text-red-600">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status1_reason || form.status2_reason }}</div>
                    </div>
                </div>

                <template #footer v-if="!isView">
                    <div class="flex items-center justify-end space-x-4">
                        <UButton v-if="form.status === 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId.includes('ผู้ตรวจสอบการแจ้งซ่อม(ทส.)') && g.isInGroup === true) || form.status === 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId.includes('ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน') && g.isInGroup === true)" color="green" label="อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(true)" />
                        <UButton v-else color="green" label="แจ้งซ่อมเสร็จ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="modalFinish = true" />
                        <UButton v-if="form.status === 'ส่งซ่อม'" label="บันทึกผลการแก้ไข" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="submit" />
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
                        <UFormGroup label="ซ่อมโดย" name="ActiondBy" size="xl" class="mb-4">
                            <UInput v-model="form.fix_by" placeholder="" required/>
                        </UFormGroup>
                        <UFormGroup v-if="form.item_cate != '' && form.item_type != ''" label="ชิ้นส่วนที่เสีย" name="Result_report" size="xl" class="mb-4">
                            <USelectMenu
                                v-model="form.fix_spare_id"
                                value-attribute="spare_id" 
                                option-attribute="spare_name" 
                                searchable
                                searchable-placeholder="เลือกชื้นส่วนที่เสีย"
                                
                                :options="spares"  size="xl"
                            >
                            <template #empty>
                                <div class="text-red-600 text-cemter">ยังไม่มีชิ้นส่วนในหมวดหมู่ และประเภทอุปกรณ์นี้ กรุณาเพิ่มเติมข้อมูล</div>
                            </template>
                            </USelectMenu>
                        </UFormGroup>
                        <UFormGroup label="สรุปผลการแก้ไข" name="Result_report" size="xl">
                            <UTextarea v-model="form.result_report" placeholder="" required/>
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
        key: 'checkbox',
        label: '',
        sortable: false
    },{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'req_date',
        label: 'วันที่ส่งคำขอ'
    }, {
        key: 'item_type_icon',
        label: 'หมวดหมู่'
    }, {
        key: 'item_name',
        label: 'อุปกรณ์'
    }, {
        key: 'description',
        label: 'ความเสีย/ปัญหา'
    }, {
        key: 'item_desc',
        label: 'รายการขอรับบริการ'
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

    const indeterminate = computed(() => selected.value && selected.value.length > 0 && selected.value.length < props.listRepair.data.length);

    const auth = useAuthStore()

    const items = (row) => {

        let btn = [{
            label: 'พิมพ์',
            icon: 'i-heroicons-printer',
            click: () => fetchPrintData(row.req_id)
        }]

        if((row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน' && g.isInGroup === true) ) || (row.status == 'รอตรวจสอบ(ทส.)' &&  auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
            btn.push({
                label: 'อนุมัติ',
                icon: 'i-heroicons-archive-box-20-solid',
                click: () => fetchEditData(row.req_id, true)
            })
        }

        if(row.status == 'รออนุมัติหน่วยงาน' || (row.status == 'รอตรวจสอบ(ทส.)' &&  auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
            btn.push({
                label: 'ลบ',
                icon: 'i-heroicons-trash-20-solid',
                click: () => {
                    modelDeleteConfirm.value = true; 
                    itemDelete.value = row.req_id;
                }
            })
        }

        if(row.status == 'ส่งซ่อม' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้แจ้งซ่อมเสร็จ' && g.isInGroup == true)) {
            btn.push({
                label: 'บันทึกผลการแก้ไข',
                icon: 'i-heroicons-archive-box-20-solid',
                click: () => fetchEditData(row.req_id, true)
            })
        }

        return [btn]
    }

    onMounted(() => {
        fetchCateItems()

    })

    const itemSelect = (value) => {
        return inventoryitems.value.find(item => item.item_id === value)
    }
  
     function onChange(event) {http://127.0.0.1:3000/
      if (event.target.checked) {
        selectAllRows();
      } else {
        selected.value = [];
      }
    }


    const dataApprove = ref({
        ReqID:"",  
        Action:"",//สถานะมี 2 สถานะคือ  (อนุมัติ , ปฏิเสธ)
        ActiondBy:auth.username,//อนุมัติหรือปฏิเสธโดย
        Reason:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

    const servicesType = ref([])
    const contactType = ref([])
    const itemsType = ref([])
    const inventoryitems = ref([])
    const spares = ref([])
    const itemsCate = ref([])
    const isView = ref(false)
    const users = ref([])


    const submit = async () => {

        form.value.modified_by = auth.user.currentUserInfo?.fullName
        form.value.modified_date = moment().format('YYYY-MM-DDTHH:mm:ss')
       
        const res = await postApi('/hd/request/SaveRepair', {
            RequestHead: form.value,
            RequestService: form.value.services.map(service => {
                return {
                    is_select: service.is_select || false,
                    service_type: service.valueTXT
                }
            })
        })

        if(form.value.files.length > 0) {
            await uploadFile(res.requestHead.req_id)
        }

        if(res.outputAction.result === 'ok') {
            emit('refresh')
            users.value = []
        }

        modalApprove.value = false

       
    }

    const fetchTypeContact = async () => {
        contactType.value = await getMasterType(`HD_CONTACT`, '')
    }
    const fetchTypeService = async () => {
        servicesType.value = await getMasterType(`HD_SERVICE_TYPE`, '')
    }
    const fetchCateItems = async () => {
        itemsCate.value = await getMasterType(`HD_ITEMCATE`, '')
    }

    const fetchTypeItems = async (cate) => {

        itemsType.value = await getMasterType(`HD_ITEMTYPE`, '', cate)
    }
   
    const fetchInventory = async () => {
        inventoryitems.value = await getListItems('', '', form.value.item_type, form.value.item_cate)
    }
   
    const fetchSpares = async () => {
        spares.value = await getSpares('', form.value.item_type, form.value.item_cate)
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
        dataFinish.value.Result_report = ''
        dataFinish.value.ActiondBy = ''

        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)
        form.value = data.requestHead
        form.value.files = data.files

        dataFinish.value.SpareID = data.requestHead.fix_spare_id
        
        await fetchTypeItems(form.value.item_cate)

        await fetchInventory()

        await fetchSpares()
        
        form.value.services = data.requestService.map(service => {
            return {
                valueTXT: service.service_type,
                is_select: service.is_select,
                description1: servicesType.value.find(s => s.valueTXT === service.service_type).description1
            }
        })


        if(approve || (form.value.status == 'รอตรวจสอบ(ทส.)' &&  auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
            modalApprove.value = true;
        }

        isView.value = view

    }

    
    const submitApprove = async () => {
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        console.log(res);

        modalConfirmApprove.value = false
        modalApprove.value = false

        emit('refresh')
    }
    

     const submitFinish = async () => {
        dataFinish.value.Result_report = form.value.result_report
        dataFinish.value.ActiondBy = form.value.fix_by
        dataFinish.value.SpareID = form.value.fix_spare_id

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