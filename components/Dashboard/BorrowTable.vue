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

        <template #status-data="{ row }">
            <div class="font-bold text-black">{{ row.status }}</div>
            <div class="text-red-600 font-bold" v-if="row.status == 'ปฏิเสธจากหน่วยงาน' || row.status == 'ปฏิเสธจาก(ทส.)'">
                <div>เหตุผลการไม่อนุมัติ</div>  

                <div>{{ row.status2_reason || row.status1_reason }}</div>
            </div>

            <div class="text-xs text-red-600" v-if="row.latest_status_date">เมื่อ {{ moment(row.latest_status_date).format('DD/MM/YYYY เวลา HH:mm') }}</div>
            
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
                        <UBadge v-if="form.status" size="lg" :label="form.status" :color="form.status == 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)' ? 'red' : 'emerald'" variant="subtle" />
                    </div>

                    <div v-if="form.status === 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)'" class="text-red-600 mb-8">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status1_reason || form.status2_reason }}</div>
                    </div>
                    <FormBorrow :form="form" :auth="auth" @addItem="addItem" />
                </div>
                <template #footer v-if="form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)' || form.status == 'รอ ผอ.ทส.ตรวจสอบ'">
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
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalConfirmApprove = false;">ยกเลิก</button>
                        </div>
                    </template>
                </UCard>
            </UForm>
        </UModal>
        <UModal v-model="modelAlertItems">
            <UCard >

                 <h3 class="text-xl text-red-600 text-center font-bold leading-6 dark:text-white">
                            เกิดข้อผิดพลาด กรุณาเลือกอุปกรณ์ที่ให้ยืมก่อนอนุมัติ
                        </h3>
                <template #footer>
                    <div class="flex justify-center">
                         <button type="button" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="modelAlertItems = false;">ตกลง</button>
                    </div>
                </template>
            </UCard>
                
        </UModal>
    </UModal>


    <UModal v-model="modalReturn" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UForm :state="form" @submit="modalConfirmReturn = true">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            {{ modalTitle }}
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalReturn = false" />
                    </div>
                </template>

                
                <div class="text-lg font-bold mb-2"> อุปกรณ์ที่ต้องการทำรายการ </div>
                <UCheckbox v-if="auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)" v-model="dataReturn.returnAll" name="notifications" label="คืนทั้งหมด" :ui="{label:'text-base font-bold', wrapper: 'items-center'}" />
                <div class="p-8 pt-4 mb-2 border rounded-lg flex space-2 relative" v-for="(cate, index) in groupBy(form.borrowItems, 'item_type_desc')" v-if="!dataReturn.returnAll">
                    <div class="w-[100px] font-bold"> {{ index }}</div>

                    <div class="w-full ">
                        <div  v-for="item in cate" class="grid grid-cols-4 gap-2 items-center mb-2 border-b border-black pb-2">
                            <UFormGroup label="อุปกรณ์" name="inventory" size="xl">
                                {{ item.item_name }}
                            </UFormGroup>

                            <div  class="text-xl font-bold ">
                                <div :class="{ 'text-red-600': item.qty_return === 0, 'text-green-500': item.qty_return}">{{ item.qty_return ? 'คืนแล้ว' : 'ยังไม่คืน' }}</div>
                               
                                <div class="text-sm">เวลาคืน {{item.appv_status_ext === 'อนุมัติ' ? moment(item.date_return_ext).format('DD/MM/YYYY') : moment(item.date_end).format('DD/MM/YYYY') }}  <span v-if="item.appv_status_ext === 'อนุมัติ'" class="text-xs text-green-500">(ขยายเวลายืม - คืน)</span> </div>
                               
                                <div v-if="item.appv_status_ext === 'รออนุมัติ'" class="text-sm text-yellow-600"> <span>{{ item.appv_status_ext }}ขยายเวลายืม-คืน </span>
                                    
                                    <div>ไปวันที่ {{ moment(item.date_return_ext).format('DD/MM/YYYY')}}</div></div>
                                <div v-if="item.appv_status_ext === 'ปฏิเสธ'" class="text-sm text-red-600 break-words">ปฏิเสธการยื่นเวลาเนื่องจาก {{ item.appv_status_ext_reason }} </div>

                                <div v-if="auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true) || auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true)">
                                    <UButton label="อนุมัติการยื่นเวลา" v-if="item.appv_status_ext === 'รออนุมัติ'" color="blue" size="xs" @click="setAprroveExtendDate(item)" />
                                    <UButton label="ปฏิเสธ" v-if="item.appv_status_ext === 'รออนุมัติ'" color="red" class="ml-1" size="xs" @click="setAprroveExtendDate(item, false)" />
                                </div>
                                
                            

                               
                            </div>
                            
                            <UButton :color="item.qty_return ? 'red' : 'green'" :label="item.qty_return ? 'ยกเลิกคืนอุปกรณ์นี้' : 'คืนอุปกรณ์นี้'" size="sm" @click="checkMaxReturn((item.qty_return ? 0 : 1), item.item_id)" v-if="((auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true) || auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true))) && modalTitle == 'แจ้งคืนพัสดุ'"/>

                            <div class="self-center">
                                <UButton :label="item.appv_status_ext === '' ? 'ยื่นเวลายืม' : 'เปลี่ยนเวลาคืน'" :color="item.appv_status_ext === '' ? 'primary' : 'white'" v-if="!item.qty_return && modalTitle == 'ขยายเวลายืม-คืน'" size="sm" @click="setDateBorrow(item)" />
                               
                            </div>
                           
                        </div>
                    </div>
                </div>
                <div class="text-red-600 font-bold" v-if="auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติยืมพัสดุประจำหน่วยงาน' && g.isInGroup === true) || auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)">หมายเหตุ : เมื่อกดคืนอุปกรณ์เรียบร้อยแล้ว กรุณาอย่าลืมกดปุ่มแจ้งคืนพัสดุเพื่อยืนยันการคืนทุกครั้ง</div>

           
                <template #footer v-if="auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true) || auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true)">
                    <div class="flex items-center justify-end space-x-4">

                        <UButton color="green" label="แจ้งคืนพัสดุ" v-if="waitingItemComputed.length > 0 || dataReturn.returnAll" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" />
                        <UButton color="gray" @click="modalReturn = false;" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>
        <UModal v-model="modalConfirmReturn" prevent-close>
            <UForm :state="dataApprove" @submit="submitApprove">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="text-center">แจ้งเตือนการยืนยัน</div>
                    </template>

                    <div class="font-bold text-xl text-center">ต้องการทำรายการคืนใช่หรือไม่</div>
                    <template #footer>
                        <div class="flex justify-between">
                            <button type="button" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="submitReturn">ตกลง</button>
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalConfirmReturn = false">ยกเลิก</button>
                        </div>
                    </template>
                </UCard>
            </UForm>

          
        </UModal>
        <UModal v-model="modalSetDate">
            <UForm :state="setDateReturn">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="text-center">ยื่นเวลายืม-คืน อุปกรณ์นี้</div>
                    </template>

                    <label for="">กำหนดเวลาคืน</label>
                    <UPopover :popper="{ placement: 'bottom-start' }">
                        <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDateBorrow" />
                        <template #panel="{ close }">
                            <FormDatePicker v-model="setDateReturn.End" @close="close" />
                        </template>
                    </UPopover>

                    <template #footer>
                        <div class="flex justify-between">
                            <button type="submit" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="submitSetDateReturn">ตกลง</button>
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalSetDate = false">ยกเลิก</button>
                        </div>
                    </template>
                </UCard>
            </UForm>
        </UModal>
        <UModal v-model="modalAprroveSetDate">
            <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="text-center">แจ้งเตือนการยืนยัน</div>
                </template>

                <div class="font-bold text-xl text-center"></div>
                <div class="font-bold text-xl text-center" v-if="setApproveDate.ApproveResult === 'อนุมัติ'">คุณต้องการอนุมัติการขยายเวลาใช่หรือไม่</div>

                <div v-else>
                    
                    <div class="text-red-600 font-bold text-xl text-center">ปฏิเสธการขยายเวลาใช่หรือไม่</div>
                    <UFormGroup label="กรอกเหตุผล" name="Reason" size="xl">
                        <UTextarea v-model="setApproveDate.ApproveReason" placeholder="" required/>
                    </UFormGroup>
                </div>

            <template #footer>
                <div class="flex justify-between">
                    <button type="button" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="confirmApproveSetDate">ยืนยัน</button>
                    <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalAprroveSetDate = false">ยกเลิก</button>
                </div>
            </template>
            </UCard>
        </UModal>
 

        

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
    const noti = useNotifyStore()



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
    const modelDeleteConfirm = ref(false)

       const items = (row) => {

        let btn = [{
                label: 'พิมพ์',
                icon: 'i-heroicons-printer',
                click: () => fetchPrintData(row.req_id)
            },{
                label: 'รายละเอียดคำขอ',
                icon: 'i-heroicons-pencil-square-20-solid',
                click: () => fetchEditData(row.req_id)
            }]


            if(row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติยืมพัสดุประจำหน่วยงาน' && g.isInGroup === true) || row.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true) || row.status == 'รอ ผอ.ทส.ตรวจสอบ' && auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true)) {
                btn.push({
                    label: 'อนุมัติ',
                    icon: 'i-heroicons-archive-box-20-solid',
                    click: () => fetchEditData(row.req_id, true)
                })
            }

            if(row.status == 'รออนุมัติหน่วยงาน' || (row.status == 'รอตรวจสอบ(ทส.)'&& auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)) || (row.status == 'รอ ผอ.ทส.ตรวจสอบ' && auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true))) {
                btn.push({
                    label: 'ลบ',
                    icon: 'i-heroicons-trash-20-solid',
                    click: () => {
                        modelDeleteConfirm.value = true; 
                        itemDelete.value = row.req_id;
                    }
                })
            }

            if((row.status == 'ส่งมอบใช้งาน' || row.status == 'รายการคงค้าง') && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true || auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true))) {
                btn.push( {
                    label: 'คืนพัสดุ',
                    icon: 'i-heroicons-archive-box-20-solid',
                    click: () => fetchEditData(row.req_id, false, true)
                })
            }
            if((row.status == 'ส่งมอบใช้งาน' || row.status == 'รายการคงค้าง')) {
                btn.push( {
                    label: 'ขยายเวลายืม-คืน',
                    icon: 'i-heroicons-archive-box-20-solid',
                    click: () => fetchEditData(row.req_id, false, false, true)
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

    const dataReturn = ref({
        ReqID: "",
        ActiondBy:auth.username,
        returnAll: false,
        items: []
    })

    const waitingItemComputed = computed(() => form.value.borrowItems.filter(item => item.qty_return > 0).map(item => {
        return {
            item_id: item.item_id,
            serial_number: item.serial_number,
            qty_return: item.qty_return,
        }
    }))
    
    const groupBy = (items, key) => items.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [
            ...(result[item[key]] || []),
            item,
            ],
        }), 
        {},
    );

    const form = ref({})
    const modalApprove = ref(false)
    const modalReturn = ref(false)
    const modalConfirmReturn = ref(false)
    const modalSetDate = ref(false)

    const setDateReturn = ref({
        ReqID: "",//กรณีเพิ่มใหม่ไม่ต้องส่งค่ามา แต่ถ้าเป็นการแก้ไขให้เลขเอกสารมา
        LineNum: "",//Line number set null หรือ 0 เพื่อเปลี่ยนวันที่ทุกรายการ
        End: form.value.date_end// ถึงวันที่ 
    })

    const setApproveDate = ref({
        ReqID: "",//กรณีเพิ่มใหม่ไม่ต้องส่งค่ามา แต่ถ้าเป็นการแก้ไขให้เลขเอกสารมา
        LineNum: "",//Line number set null หรือ 0 เพื่อเปลี่ยนวันที่ทุกรายการ
        ApproveBy: auth.username,// ถึงวันที่ 
        ApproveResult: "อนุมัติ",
        ApproveReason: ""

    })

    

    const labelDateBorrow = computed(() => moment(setDateReturn.value.End).format('DD/MM/YYYY'))

    const modalTitle = ref('แจ้งคืนพัสดุ')

    const fetchEditData = async (id, approve = false, isReturn = false, isSetDate = false) => {

        dataApprove.value.ReqID = id
        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)

        form.value = data.requestHead
        form.value.items = data.requestItemType
        form.value.borrowItems = data.requestItem
        form.value.files = data.files



        form.value.location_unit = data.requestHead.location_unit ||  data.requestHead.department_id 


        form.value.items.map(async e => {
            const data = e

            data.inventory = await getListItems('', '', data.item_type, data.item_cate)

            return data
        })
       
        if(approve || form.value.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true) || form.value.status == 'รอ ผอ.ทส.ตรวจสอบ' && auth.user.userInGroups.some(g => g.userGroupId === 'อนุมัติยืมโดย ผอ.ทส.' && g.isInGroup === true)) {
            modalApprove.value = true;
        }else if(isReturn) {
            dataReturn.value.ReqID = id
            modalReturn.value = true
            modalTitle.value = 'แจ้งคืนพัสดุ'

        }else if(isSetDate) {
            dataReturn.value.ReqID = id
            modalReturn.value = true
            modalTitle.value = 'ขยายเวลายืม-คืน'
        }else {
            modalAdd.value = true; 
        }

        

    }

    const addItem = () => {
        form.value.items.push({ 
            item_cate: '',
            qty: '',
            item_type: '',

        })
    }

     const checkMaxReturn = (value, id) => {
        const item = form.value.borrowItems.find(item => item.item_id === id)
        item.qty_return = value
        item.return_pending = true

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

    const modelAlertItems = ref(false)

    const submitApprove = async () => {

        if(form.value.status === 'รอตรวจสอบ(ทส.)' && form.value.borrowItems.length === 0 ) {
            modalConfirmApprove.value = false
            modelAlertItems.value = true
            return
        }

        await submitRequest()
        

        await postApi('/hd/request/ApproveDocument', dataApprove.value)
        await noti.fetchNotify()
        modalConfirmApprove.value = false
        modalApprove.value = false
        emit('refresh')
    }

    const submitReturn = async () => {

        let returnItems = form.value.borrowItems.filter(item => item.qty_return > 0).map(item => {
            return {
                item_id: item.item_id,
                serial_number: item.serial_number,
                qty_return: item.qty_return,
            }
        })

        if(dataReturn.value.returnAll) {
            returnItems =  form.value.borrowItems.map(item => {
                return {
                    item_id: item.item_id,
                    serial_number: item.serial_number,
                    qty_return: item.qty_return,
                }
            })

        }
       
        
        dataReturn.value.items = returnItems


        const res = await postApi('/hd/request/SetReturn', dataReturn.value)
        await noti.fetchNotify()
        modalReturn.value = false
        modalConfirmReturn.value = false
        emit('refresh')
    }

     const approveRequest = (approve) => {
        dataApprove.value.Action = approve ? "อนุมัติ" : "ปฏิเสธ"
        modalConfirmApprove.value = true
    }

    const stateItemSet = ref()
    const setDateBorrow = (item) => {
        setDateReturn.value.ReqID = item.req_id;
        setDateReturn.value.LineNum = item.line_num;
        setDateReturn.value.End = item.date_return_ext || item.date_end;

        stateItemSet.value = item
        

        modalSetDate.value = true
    }

    const modalAprroveSetDate  = ref(false)
    const setAprroveExtendDate = (item, status = true) => {

        setApproveDate.value.ReqID = item.req_id;
        setApproveDate.value.LineNum = item.line_num;
        setApproveDate.value.ApproveResult = status ? 'อนุมัติ': 'ปฏิเสธ';

        modalAprroveSetDate.value = true

    }

    const confirmApproveSetDate = async () => {
        const res = await postApi('/hd/request/SetExtenReturnDateApprove', setApproveDate.value)

        modalAprroveSetDate.value = false

        setApproveDate.value.ApproveReason = ''
        fetchEditData(setApproveDate.value.ReqID, false, true, true)
    }

    const submitSetDateReturn = async () => {
        setDateReturn.value.End = moment(setDateReturn.value.End).format('YYYY-MM-DD');

        stateItemSet.value.date_return_ext = setDateReturn.value.End

        const res = await postApi('/hd/request/SetExtenReturnDate', setDateReturn.value)

        modalSetDate.value = false

        fetchEditData(setDateReturn.value.ReqID, false, false, true)
    }
</script>