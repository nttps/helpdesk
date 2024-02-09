<template>
    <div>
        <PartialsTitle title="ยืม - คืน" @add="modalAdd = true" />
        <div class="mt-8">
            <div class="search-bar flex justify-between items-center mb-2">
                <div>
                    <UButtonGroup size="lg" orientation="horizontal">
                        <UButton :label="status.name" v-for="status in statusList" @click="switchStatus(status.name)" :color="statusActive === status.name ? `${status.color}` : 'white'">
                            <template #leading>
                                <UBadge :label="status.count" :color="statusActive === status.name ? 'white' : status.color" />
                            </template>
                        </UButton>
                    </UButtonGroup>
                </div>
                <div class="w-96">
                    <UInput v-model="textSearch" placeholder="ค้นหาจากชื่อผู้ยืม, เบอร์โทรศัพท์" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
            </div>
            <div class="flex items-center justify-end space-x-2">
                <div>
                    <UButton
                        icon="i-heroicons-plus-20-solid"
                        size="sm"
                        variant="solid"
                        color="green"
                        label="อนุมัติ"
                        :trailing="false"
                        class="mr-2"
                        @click="approveHandle"
                    />
                    <!-- <UButton
                        icon="i-heroicons-plus-20-solid"
                        size="sm"
                        variant="solid"
                        color="red"
                        label="ไม่อนุมัติ"
                        :trailing="false"
                        @click="rejectHandle"
                    /> -->
                </div>
                <UButton icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray" @click="exportFile"/>
            </div>
            <UTable 
                v-model="selectedRows" 
                :columns="columns" 
                :rows="lists.data" 
                :loading="pending" 
                :loading-state="{ label: 'กำลังโหลด ...' }" 
                :empty-state="{ label: 'ไม่พบรายการ' }"
                @update:model-value="updateSelected"
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

    <UModal v-model="modalAdd" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form" @submit="submitRequest">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            ยืม-คืนพัสดุ
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false; resetForm()" />
                    </div>
                </template>

                
                <FormBorrow :form="form" @addItem="addItem" create/>

                <template #footer v-if="form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)' || form.status == undefined">
                    <div class="flex items-center justify-end space-x-4">
                        <UButton color="amber" label="บันทึก" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                        <UButton color="gray" @click="modalAdd = false; resetForm()" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="modalApprove" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form" @submit="submitRequest">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            อนุมัติยืม-คืนพัสดุ
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalApprove = false; resetForm()" />
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
                    <FormBorrow :form="form" />

                    
                </div>
                
             

                <template #footer v-if="form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)'">
                    <div class="flex items-center justify-end space-x-4" >
                        <UButton color="green" label="อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(true)" />
                        <UButton color="red" label="ไม่อนุมัติ" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" @click="approveRequest(false)" />
                        <UButton color="gray" @click="modalApprove = false; resetForm()" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
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


    <UModal v-model="modalReturn" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form" @submit="modalConfirmReturn = true">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            แจ้งคืนพัสดุ
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalReturn = false" />
                    </div>
                </template>

                
                <div class="text-lg font-bold mb-2"> อุปกรณ์ที่ต้องการคืน </div>
                <UCheckbox v-model="dataReturn.returnAll" name="notifications" label="คืนทั้งหมด" :ui="{label:'text-base font-bold', wrapper: 'items-center'}" />
                <div class="p-8 pt-4 mb-2 border items-center rounded-lg grid grid-cols-4 gap-2 relative" v-for="item in form.items" v-if="!dataReturn.returnAll">
                    <UFormGroup label="ประเภทอุปกรณ์" name="item_type" size="xl">
                        {{ item.item_type }}
                    </UFormGroup>
                    <UFormGroup label="อุปกรณ์" name="inventory" size="xl">
                        {{ item.item_name }}
                    </UFormGroup>

                    <UFormGroup label="ที่ยืม" name="qty" size="xl">
                        {{ item.qty }}
                    </UFormGroup>
                    <UFormGroup label="คืนแล้ว" name="qty" size="xl">
                        {{ item.qty_return }}
                    </UFormGroup>

                    <UFormGroup label="จำนวนที่ต้องการคืน" name="qty" size="xl" v-if="item.qty_remain > 0">
                        <UInput v-model="item.return_qty" @update:model-value="e => checkMaxReturn(e, item.item_id, item.qty)" placeholder="กรอกจำนวนที่ต้องการคืน" required/>
                    </UFormGroup>
                    <div  class="text-xl font-bold absolute right-2 top-2" :class="{ 'text-red-600': item.qty_remain > 0, 'text-green-500': item.qty_remain === 0 }">
                        {{ item.qty_remain > 0 ? 'ยังคืนไม่ครบ' : 'คืนครบแล้ว' }}
                    </div>
                    
                </div>

                <template #footer>
                    <div class="flex items-center justify-end space-x-4">
                        <UButton color="green" label="แจ้งคืนพัสดุ" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }" />
                        <UButton color="gray" @click="modalReturn = false; resetForm()" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
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
                            <button type="submit" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="submitReturn">ตกลง</button>
                            <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalConfirmReturn = false">ยกเลิก</button>
                        </div>
                    </template>
                </UCard>
            </UForm>
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

    <UModal v-model="modalPrint">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">Print รายละเอียด</div>
          </template>

          <div class="font-bold text-xl text-center">คุณต้องการยืนยันที่จะลบข้อมูลนี้ใช่หรือไม่</div>

          <template #footer>
              <div class="flex justify-between">
                  <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalPrint = false">ยกเลิก</button>
              </div>
          </template>
        </UCard>
    </UModal>

    <UModal v-model="modalAlertApproveAll">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">แจ้งเตือนการยืนยัน</div>
          </template>

          <div class="font-bold text-xl text-center">ต้องการยืนยันอนุมัติข้อมูลทั้งหมดใช่หรือไม่</div>

          <template #footer>
              <div class="flex justify-between">
                  <button type="button" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="approveAll">ยืนยัน</button>
                  <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalAlertApproveAll = false">ยกเลิก</button>
              </div>
          </template>
        </UCard>
    </UModal>

    <UModal v-model="modalAlertNotApproveAll">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">แจ้งเตือนการยืนยัน</div>
          </template>

          <div class="font-bold text-xl text-center">ต้องการไม่อนุมัติข้อมูลทั้งหมดใช่หรือไม่</div>

          <template #footer>
              <div class="flex justify-between">
                  <button type="button" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="notApproveAll">ยืนยัน</button>
                  <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalAlertNotApproveAll = false">ยกเลิก</button>
              </div>
          </template>
        </UCard>
    </UModal>

    <UModal v-model="alertSelect">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">เลือกข้อมูลก่อร</div>
          </template>

          <div class="font-bold text-xl text-center">กรุณาเลือกข้อมูลการยืนยันก่อน</div>

          <template #footer>
              <div class="flex justify-center">
                  <button type="button" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="alertSelect = false">ตกลง</button>
              </div>
          </template>
        </UCard>
    </UModal>

    
</template>

<script setup>
    import moment from 'moment'
    moment.locale('th')

    definePageMeta({
        middleware: ["auth"]
    })

    const auth = useAuthStore();


    const modalAdd = ref(false)
    const alertSelect = ref(false)
    const modalPrint = ref(false)
    const modalApprove = ref(false)
    const modalReturn = ref(false)
    const modalConfirmApprove = ref(false)
    const modalConfirmReturn = ref(false)
    const textSearch = ref('')
    const modalAlertApproveAll = ref(false)
    const modalAlertNotApproveAll = ref(false)
    const statusSearch = ref('')
    const statusList = ref([{
        name : 'รายการทั้งหมด',
        count: 0,
        color: 'blue'
    }, {
        name : 'รายการรออนุมัติ',
        count: 0,
        color: 'red'
    }, {
        name : 'รายการที่กำลังยืม',
        count: 0,
        color: 'yellow'
    }, {
        name : 'รายการที่ค้าง',
        count: 0,
        color: 'yellow'
    }, {
        name : 'รายการที่คืนแล้ว',
        count: 0,
        color: 'green'
    }, {
        name : 'รายการที่ถูกปฎิเสธ',
        count: 0,
        color: 'gray'
    }])
    const statusActive = ref('รายการทั้งหมด')

    const dataApprove = ref({
        ReqID:"",  
        Action:"",//สถานะมี 2 สถานะคือ  (อนุมัติ , ปฏิเสธ)
        ActiondBy:auth.username,//อนุมัติหรือปฏิเสธโดย
        Reason:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

     const dataReturn = ref({
        ReqID: "",
        ActiondBy:auth.username,
        returnAll: false
    })

    const approveRequest = (approve) => {
        dataApprove.value.Action = approve ? "อนุมัติ" : "ปฏิเสธ"
        modalConfirmApprove.value = true
    }

    const columns = [{
        key: 'id',
        label: 'ลำดับที่',
        sortable: false
    }, {
        key: 'req_date',
        label: 'ว/ด/ป'
    }, {
        key: 'item_name',
        label: 'อุปกรณ์'
    }, {
        key: 'req_by_user_id',
        label: 'ผู้ยืม'
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

  


    const items = (row) => {

        let btn = [{
                label: 'รายละเอียดคำขอ',
                icon: 'i-heroicons-pencil-square-20-solid',
                click: () => fetchEditData(row.req_id)
            },{
                label: 'พิมพ์',
                icon: 'i-heroicons-printer',
                click: () => fetchPrintData(row.req_id)
            }]


            if(row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติยืมพัสดุประจำหน่วยงาน' && g.isInGroup === true) || row.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)) {
                btn.push({
                    label: 'อนุมัติ',
                    icon: 'i-heroicons-archive-box-20-solid',
                    click: () => fetchEditData(row.req_id, true)
                },{
                    label: 'ลบ',
                    icon: 'i-heroicons-trash-20-solid',
                    click: () => {
                        modelDeleteConfirm.value = true; 
                        itemDelete.value = row.req_id;
                    }
                })
            }
            if(auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)) {
                btn.push( {
                    label: 'คืนพัสดุ',
                    icon: 'i-heroicons-archive-box-20-solid',
                    click: () => fetchEditData(row.req_id, false, true)
                })
            }
            
        return [btn]
    }

    const page = ref(1)
    const pageCount = ref(20)
    const pageTotal = computed(() => lists.value.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))


    const selectedRows = ref([])
    const selectApprove = ref([])
    const startDate = ref(new Date())
    const endDate = ref(new Date())
    const form = ref({
        req_id: '',
        req_date: moment(new Date()).format('YYYY-MM-DD'),
        req_by_user_id: auth.username.length === 13 ? auth.username: '',
        req_by_fullname: auth.username.length === 13 ? auth.user.currentUserInfo.fullName : '',
        phone_req:auth.user.currentUserInfo.tel,
        emal_req: auth.username.length === 13 ? auth.user.currentUserInfo.email : '',
        date_begin: startDate.value,
        date_end: endDate.value,
        purpose_id:"",//รหัสวัตถุประสงค์
        purpose_desc:"",//คำบรรยายวัตถุประสงค์ 
        location:"",//สถานที่ใช้งาน
        location_unit:"",//ศูนย์เขต  
        description:"",//รายละเอียด  
        created_by:auth.username, //ผู้ทำรายการ
        modified_by: "",
        status: "",
        department_id: auth.username.length === 13 ? auth.user.currentUserInfo.departmentID : '',
        items: [{
            item_id: '',
            qty: '',
            item_type: '',
            inventory: []

        }]
    })

    const rejectHandle = () => {
        if(selectedRows.value.length === 0) {
            alertSelect.value = true
            return
        }
        modalAlertNotApproveAll.value = true
    }
     
    const approveHandle = () => {


        if(selectedRows.value.length === 0) {
            alertSelect.value = true
            return
        }
        modalAlertApproveAll.value = true
    }



    const forDeletion = ['คืน', 'ปฏิเสธจาก(ทส.)', 'ปฏิเสธจากหน่วยงาน', 'ส่งมอบใช้งาน']

    const updateSelected = (row) => {
       
        selectedRows.value = row
    }

    const closeModal = () => {
        resetForm()
    }

    onMounted(() => {
        countStatus()
    })
    const addItem = () => {
        form.value.items.push({ 
            item_id: '',
            qty: '',
            item_type: ''
        })
    }

    const resetForm = () => {
        form.value = {
            req_id: '',
            req_date: moment(new Date()).format('YYYY-MM-DD'),
            req_by_user_id: auth.username.length === 13 ? auth.username: '',
            req_by_fullname: auth.username.length === 13 ? auth.user.currentUserInfo.fullName : '',
            phone_req:auth.user.currentUserInfo.tel,
            emal_req: auth.username.length === 13 ? auth.user.currentUserInfo.email : '',
            date_begin: startDate.value,
            date_end: endDate.value,
            purpose_id:"",//รหัสวัตถุประสงค์
            purpose_desc:"",//คำบรรยายวัตถุประสงค์ 
            location:"",//สถานที่ใช้งาน
            location_unit:"",//ศูนย์เขต  
            description:"",//รายละเอียด  
            created_by:auth.username, //ผู้ทำรายการ
            modified_by: "",
            department_id: auth.username.length === 13 ? auth.user.currentUserInfo.departmentID : '',
            items: [{
                item_id: '',
                qty: '',
                item_type: '',
                inventory: []

            }]
        }
    }

    const switchStatus = (status) => {
        page.value = 1
        const active = coditionStatus(status)

        statusActive.value = status
        statusSearch.value = active
    }

    const countStatus = () => {
        statusList.value.forEach(async s => { 

            const status = coditionStatus(s.name)
            const data = await postApi('/hd/request/ListBorrow', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Status": status//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
            })
            s.count = data.length
        })

    }

    const coditionStatus = (status) => {
        let statusSearch
        switch (status) {
            case 'รายการทั้งหมด':
                statusSearch = ''
                break;
            case 'รายการรออนุมัติ':
                statusSearch = 'รออนุมัติหน่วยงาน,รอตรวจสอบ(ทส.)'
                break;
            case 'รายการคำขอยืม':
                statusSearch = 'ส่งมอบใช้งาน'
                break;
            case 'รายการที่ค้าง':
                statusSearch = 'รายการคงค้าง'
                break;
            case 'รายการที่คืนแล้ว':
                statusSearch = 'คืน'
                break;
            case 'รายการที่ถูกปฎิเสธ':
                statusSearch = 'ปฏิเสธจาก(ทส.),ปฏิเสธจากหน่วยงาน'
                break;
            default:
                break;
        }
        return statusSearch
    }
    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await postApi('/hd/request/ListBorrow', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Status":statusSearch.value//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
            })
            if(textSearch.value !== ''  && page.value > 1 ) {
                page.value = 1
            }
            return {
                total: data.length,
                data: data.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
            }
        }, {
            watch: [page, pageCount, textSearch, statusSearch]
        }
    )
  
    const modelDeleteConfirm = ref(false)
    const itemDelete = ref()

    const deleteItem = async () => {
        const res = await deleteRequestApi(itemDelete.value)


        modelDeleteConfirm.value = false

        refresh()
    }

    const submitRequest = async () => {

        console.log(form.value.items);
        const res = await postApi('/hd/request/SaveBorrow', {
            RequestHead: form.value,
            RequestItem: form.value.items.map(item => {
                return {
                    item_id: item.item_id,
                    qty: parseInt(item.qty)
                }
            })
        })

        
        if(res.outputAction.result === 'ok') {
            refresh()
        }

        modalAdd.value = false
        resetForm()
    }
    

    const checkMaxReturn = (value, id, max) => {
        const item = form.value.items.find(item => item.item_id === id)


        item.return_qty = value > max ? max : value
    }
    

    const dataPrint = ref('')
    const fetchPrintData = async (id) => {

        const data = await getApi(`/hd/Request/PrintDocument?req_id=${id}`)

        dataPrint.value = data.printPreviewUrl

        navigateTo(data.printPreviewUrl, {
            external: true,
            open: true
        })

    }
    const fetchEditData = async (id, approve = false, isReturn = false) => {

        dataApprove.value.ReqID = id
        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)

        form.value = data.requestHead
        form.value.items = data.requestItem

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
        }else {
            modalAdd.value = true; 
        }

    }

    const submitApprove = async () => {
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

        modalConfirmApprove.value = false
        modalApprove.value = false
        refresh()
        resetForm()
    }

    const submitReturn = async () => {

        const returnItems = form.value.items.map(item => {
            return {
                item_id: item.item_id,
                qty_return: item.return_qty,
            }
        })
        dataReturn.value.items = returnItems

        const res = await postApi('/hd/request/SetReturn', dataReturn.value)

        modalReturn.value = false
        modalConfirmReturn.value = false
        refresh()
        resetForm()
    }

    const approveAll = async () => {
        const dataApproveed =  selectedRows.value.filter(re => re.status != 'ปฏิเสธ' && re.status != 'ปฏิเสธจาก(ทส.)' && re.status != 'อนุมัติ').map(re => re.req_id).join(',')
        
        dataApprove.value.Action = 'อนุมัติ'
        dataApprove.value.ReqID = dataApproveed

        modalAlertApproveAll.value = false
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

        refresh()
        countStatus()

        selectedRows.value = []


    }

    const notApproveAll = async () => {
        const dataApproveed =  selectedRows.value.filter(re => re.status != 'ปฏิเสธ' && re.status != 'ปฏิเสธจาก(ทส.)' && re.status != 'อนุมัติ').map(re => re.req_id).join(',')
        
        dataApprove.value.Action = 'ปฏิเสธ'
        dataApprove.value.ReqID = dataApproveed

        modalAlertNotApproveAll.value = false
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

        refresh()
        countStatus()

        selectedRows.value = []


    }

     const exportFile = async () => {

        const config = useRuntimeConfig();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
            "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
            "DateEnd": null,//ถึงวันที่ซ่อม
            "Status":statusSearch.value//รอตรวจสอบ(ทส.),รออนุมัติ(ผอ.ทส.) 
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(config.public.apiUrl + '/hd/request/ExportBorrowExcel', requestOptions)
        .then( res => res.blob() )
        .then( re => {
            var file = URL.createObjectURL(re);

            var a = document.createElement('a');
            a.href = file;
            a.download = "รายการคำขอยืม-คืน.xlsx";
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();    
            a.remove();  //afterwards we remove the element again      
        });

      
        
        
    }
    
</script>

<style lang="scss" scoped>

</style>