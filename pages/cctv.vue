<template>
    <div>
        <PartialsTitle title="คำขอดู CCTV" @add="modalAdd = true" />
        <div class="mt-8">
            <div class="search-bar flex justify-between mb-2">
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
                    <UInput placeholder="ค้นหา" v-model="textSearch" size="xl" icon="i-heroicons-magnifying-glass-20-solid" />
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
                        v-if="auth.isNotUser"
                    />
                </div>
                <UButton class="ml-auto" icon="i-heroicons-printer-solid" :ui="{ icon: {size: { xl: 'w-10 h-10'}}}" square variant="link" size="xl" color="gray" @click="exportFile"/>
            </div>
            <UTable 
                v-model="selected" 
                :columns="columns" 
                :rows="lists.data" 
                :loading="pending" 
                :loading-state="{ label: 'กำลังโหลด ...' }" 
                :empty-state="{ label: 'ไม่พบรายการ' }"
            > 
                <template #id-data="{ row, index }">
                    <div>{{ pageFrom + index }}</div>
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

    <UModal v-model="modalAdd"  :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}" @close="closeModal">
        <UForm :state="form" @submit="submit">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            แบบคำร้องขอดูหรือสำรองไฟล์ภาพจากกล้องวงจรปิด (CCTV)
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="xl" class="-my-1" @click="modalAdd = false" />
                    </div>
                </template>

                <div class="relative">
                    <div class="absolute right-2 top-0">
                        <UBadge size="lg" :label="form.status" :color="form.status == 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)' ? 'red' : 'emerald'" variant="subtle" />
                    </div>

                    <div v-if="form.status === 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)'" class="text-red-600 mb-2">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status2_reason || form.status1_reason }}</div>
                    </div>

            
                    <h3 class="font-bold leading-6 text-xl mb-4">รายละเอียดผู้ยื่นคำร้อง</h3>
                    <div class="grid grid-cols-2 gap-8 bg-zinc-300/80 p-8 rounded-xl mb-4 relative">
                        <UFormGroup label="ชื่อ-นามสกุล" name="type" size="xl">
                            <UInput v-model="form.req_by_fullname" placeholder="กรอกชื่อเพื่อค้นหา" @input="searchUserId" :disabled="(form.status === 'ปฏิเสธ' && form.status === 'อนุมัติ' && form.status === 'ปฏิเสธจาก(ทส.)')" />

                            <div class="bg-white divide-y-2 rounded absolute z-10" v-if="users.length">

                                <div v-for="user in users" class="cursor-pointer hover:bg-slate-300 p-2 " @click="selectUserName(user)">{{ user.fullName }} - {{ user.username }}</div>
                            </div>
                        </UFormGroup>
                        <UFormGroup label="เบอร์โทรศัพท์" name="phone_req" size="xl">
                            <UInput v-model="form.phone_req" placeholder="" :disabled="(form.status === 'ปฏิเสธ' && form.status === 'อนุมัติ' && form.status === 'ปฏิเสธจาก(ทส.)')"/>
                        </UFormGroup>
                    </div>
                    <h3 class="font-bold leading-6 text-xl mb-4">รายละเอียดคำร้อง</h3>
                    <div class="grid grid-cols-2 gap-8 bg-zinc-300/80 p-8 rounded-xl">
                        <div>
                            <div class="grid grid-cols-2 mb-4">
                                <UFormGroup label="วันที่ยื่นคำร้อง" name="type" size="xl">
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDateRequest" :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                                        <template #panel="{ close }">
                                            <FormDatePicker v-model="form.req_date" @close="close" />
                                        </template>
                                    </UPopover>
                                </UFormGroup>
                            </div>
                            <div class="grid grid-cols-2 mb-4">
                                <UFormGroup label="ตั้งแต่วันที่" class="mb-4" name="type" size="xl">
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDateTimeBegin" :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                                        <template #panel="{ close }">
                                            <FormDatePicker v-model="form.date_begin" :date-time="true" @close="close" />
                                        </template>
                                    </UPopover>
                                </UFormGroup>
                                <UFormGroup label="ถึงวันที่" name="type" size="xl">
                                    <UPopover :popper="{ placement: 'bottom-start' }">
                                        <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDateTimeEnd" />
                                        <template #panel="{ close }">
                                            <FormDatePicker v-model="form.date_end" :date-time="true" @close="close" />
                                        </template>
                                    </UPopover>
                                </UFormGroup>

                                
                            </div>
                            <UFormGroup label="สถานที่ (กรุณาระบุ บริเวณสถานที่)" class="mb-4" name="type" size="xl">
                                <UTextarea v-model="form.location" :rows="4" name="input" placeholder="กรอกรายละเอียดสถานที่ ..." :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                            </UFormGroup>
                            <div class="grid grid-cols-2 gap-2 mb-4">
                                <UFormGroup label="อาคาร" class="mb-4" name="type" size="xl">
                                    <USelect v-model="form.building_id" placeholder="" :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                                </UFormGroup>
                                <UFormGroup label="ชั้น" class="mb-4" name="type" size="xl">
                                    <USelect v-model="form.floor" placeholder="" :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                                </UFormGroup>
                            </div>
                           
                            
                        </div>
                        <div>
                           
                            <UFormGroup label="วัตถุประสงค์" class="mb-4" name="type" size="xl">
                                <USelectMenu :options="objectiveSelect" searchable searchable-placeholder="ค้นหากรณี" value-attribute="description1" option-attribute="description1" v-model="form.purpose_desc" @update:model-value="updateObjective" required :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                                
                            </UFormGroup>
                            <UFormGroup label="วัตถุประสงค์อื่น ๆ" class="mb-4" name="type" size="xl" v-if="form.purpose_desc === 'วัตถุประสงค์อื่น ๆ'">
                                <UInput v-model="form.purpose_other" placeholder="กรอกวัตถุประสงค์" size="xl" required :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                            </UFormGroup>
                            <UFormGroup label="กรณี" name="type" size="xl">
                                <USelectMenu :options="caseSelect" searchable searchable-placeholder="ค้นหากรณี" value-attribute="description1" option-attribute="description1" v-model="form.case_desc" @update:model-value="updateCase" required :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                            </UFormGroup>
                            
                            <UFormGroup label="กรณีอื่น ๆ" name="type" size="xl" v-if="form.case_desc === 'กรณีอื่น ๆ'">
                                <UInput v-model="form.case_desc_other" placeholder="กรอกกรณี" size="xl" required :disabled="!(form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ')"/>
                            </UFormGroup>
                            
                        </div>
                    </div>
                </div>
                <template #footer v-if="form.status !== 'ปฏิเสธ' && form.status !== 'อนุมัติ'">
                    <div class="flex items-center justify-end">
                        <UButton color="amber" label="บันทึก" type="submit" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                        <UButton color="gray" @click="modalAdd = false;form = templateEmpty" label="ยกเลิก" type="button" size="xl" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="modalApprove" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UForm :state="form" >
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
    const { read_id } = useRoute().query;


    onMounted(() =>{
        if(read_id) {
            fetchEditData(read_id)
        }
    })


    const modalAdd = ref(false)
    const modelDeleteConfirm = ref(false)
    
    const modalApprove = ref(false)
    const modalConfirmApprove = ref(false)
    const modalAlertNotApproveAll = ref(false)

    const isView = ref(false)
    
    const itemDelete = ref()
    const textSearch = ref('')
    const caseSelect = ref([])
    const objectiveSelect = ref([])
    const users = ref([])

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'req_date',
        label: 'วันที่ส่งคำขอ'
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

    const auth = useAuthStore();

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

        if(row.status == 'รออนุมัติ(ผอ.ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติการขอดู CCTV (ทส.)' && g.isInGroup === true) || row.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการขอดู CCTV (ทส.)' && g.isInGroup === true)) {
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
        return [btn]
    }


    const menuNotApprove = (row) =>{

        let btn =  [{
            label: 'รายละเอียดคำขอ',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => fetchEditData(row.req_id, true, true)
        }]

        if(row.status === 'รอตรวจสอบ(ทส.)') {
            btn.push({
                label: 'ลบ',
                icon: 'i-heroicons-trash-20-solid',
                click: () => {
                    modelDeleteConfirm.value = true; 
                    itemDelete.value = row.req_id;
                }
            })
        }

        return [btn]
       

    }
    const page = ref(1)
    const pageCount = ref(20)
    const pageTotal = computed(() => lists.value.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

    const selected = ref([])

    const alertSelect = ref(false)
    const rejectHandle = () => {
        if(selected.value.length === 0) {
            alertSelect.value = true
            return
        }
        modalAlertNotApproveAll.value = true
    }
     
    const approveHandle = () => {


        if(selected.value.length === 0) {
            alertSelect.value = true
            return
        }
        modalAlertApproveAll.value = true
    }


    const dateTimeBegin = ref(new Date())
    const labelDateTimeBegin = computed(() => moment(form.value.date_begin).format('DD/MM/YYYY hh:mm:ss'))


    const dateTimeEnd = ref(new Date())
    const labelDateTimeEnd = computed(() => moment(form.value.date_end).format('DD/MM/YYYY hh:mm:ss'))


    const dateRequest = ref(new Date())
    const labelDateRequest = computed(() => moment(form.value.req_date).format('DD/MM/YYYY'))


    onMounted(() => {
        fetchCaseCCTV()
        fetchObjectiveCCTV()

        countStatus()
    })

    const fetchObjectiveCCTV = async () => {
        const data = await getMasterType(`HD_CCTV_PURPOSE`, '')

        objectiveSelect.value = data

        objectiveSelect.value.push({
            valueTXT: 'วัตถุประสงค์อื่น ๆ',
            description1: 'วัตถุประสงค์อื่น ๆ'
        })

    }
    const fetchCaseCCTV = async () => {
        const data = await getMasterType(`HD_CCTV_CASE`, '')

        caseSelect.value = data

        caseSelect.value.push({
            valueTXT: 'กรณีอื่น ๆ',
            description1: 'กรณีอื่น ๆ'
        })

    }

    const templateEmpty = {
        req_id:"",//กรณีเพิ่มใหม่ไม่ต้องส่งค่ามา แต่ถ้าเป็นการแก้ไขให้เลขเอกสารมา
        req_date: dateRequest.value,//วันที่ขอ
        req_by_user_id: auth.username.length === 13 ? auth.username: '',
        req_by_fullname: auth.username.length === 13 ? auth.user.currentUserInfo.fullName : '',
        phone_req:auth.user.currentUserInfo.tel,
        emal_req: auth.username.length === 13 ? auth.user.currentUserInfo.email : '',
        howto_inform:"walkin",//วิธีการแจ้ง มี 2 ค่า (walkin , email)
        date_begin: dateTimeBegin.value,//วันที่เวลาที่ต้องดู (เริ่มต้น)
        date_end: dateTimeEnd.value,// ถึงวันที่ 
        urgent_level:"",//ระดับความสำคัญ (ด่วนมาก , ด่วน , ปานกลาง , ไม่ด่วน )
        purpose_id:"",//รหัสวัตถุประสงค์
        purpose_desc:"",//คำบรรยายวัตถุประสงค์
        case_desc:"",//ใช้ในกรณี
        case_desc_other: "",
        location:"",//สถานที่ใช้งาน 
        building_id:"",//รหัสตึก
        floor:"",//ชั้นที่
        description:"",//รายละเอียด  
        created_by: auth.username, //ผู้ทำรายการ
        modified_by:"",//ผู้แก้ไขรายการ
        purpose_other: ""
    }
    const form = ref(templateEmpty)


    const statusSearch = ref('')
    const statusList = ref([{
        name : 'รายการทั้งหมด',
        count: 0,
        color: 'blue'
    }, {
        name : 'รออนุมัติ',
        count: 0,
        color: 'yellow'
    }, {
        name : 'อนุมัติ',
        count: 0,
        color: 'green'
    }, {
        name : 'ไม่อนุมัติ',
        count: 0,
        color: 'red'
    }])
    const statusActive = ref('รายการทั้งหมด')

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

    const switchStatus = (status) => {
        page.value = 1
        const active = coditionStatus(status)

        statusActive.value = status
        statusSearch.value = active
    }

    const countStatus = () => {
        statusList.value.forEach(async s => { 

            const status = coditionStatus(s.name)
            const data = await postApi('/hd/request/ListCCTV', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Username":  auth.username,
                "Status": status//รอตรวจสอบ(ทส.),รออนุมัติ(ผอ.ทส.) 
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
            case 'รออนุมัติ':
                statusSearch = 'รออนุมัติ(ผอ.ทส.),รอตรวจสอบ(ทส.)'
                break;
            case 'อนุมัติ':
                statusSearch = 'อนุมัติ'
                break;
            case 'ไม่อนุมัติ':
                statusSearch = 'ปฏิเสธ'
                break;
            default:
                break;
        }
        return statusSearch
    }

    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await postApi('/hd/request/ListCCTV', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Username":  auth.username,
                "Status":statusSearch.value//รอตรวจสอบ(ทส.),รออนุมัติ(ผอ.ทส.) 
            })

            if(textSearch.value !== ''  && page.value > 1) {
                page.value = 1
            }
            return {
                total: data.length,
                data: data.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
            }
        }, {
            watch: [page, pageCount, textSearch, statusSearch, auth]
        }
    )

    const dataPrint = ref('')

    const fetchPrintData = async (id) => {

        const data = await getApi(`/hd/Request/PrintDocument?req_id=${id}`)

        dataPrint.value = data.printPreviewUrl

        navigateTo(data.printPreviewUrl, {
            external: true,
            open: true
        })

    }
    const fetchEditData = async (id, approve = false, view = false) => {

        dataApprove.value.ReqID = id
        const data = await getApi(`/hd/request/GetDocSet?req_id=${id}`)
        form.value = data.requestHead
        if(approve || form.value.status == 'รออนุมัติ(ผอ.ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติการขอดู CCTV (ทส.)' && g.isInGroup === true)) {

            modalApprove.value = true;
        }else {
            modalAdd.value = true; 
        }

        isView.value = view
    }
    
    const closeModal = () => {
        form.value = templateEmpty
    }

    const updateCase = (value) => {
        if(form.value.case_type !== 'กรณีอื่น ๆ') {
            form.value.case_desc = value
        }else {
            form.value.case_desc = ''
        }
    }

    const updateObjective = (value) => {
        if(form.value.purpose_type !== 'กรณีอื่น ๆ') {
            form.value.purpose_desc = value
        }else {
            form.value.purpose_desc = ''
        }
    }

    
    const selectUserName = (user) => {
        form.value.req_by_user_id = user.username
        form.value.req_by_fullname = user.fullName

        users.value = []
    }

    const searchUserId = async (event) => {

        if(event.target.value.length < 5) return
        const data = await searchUserApi(event.target.value)

        users.value = data

    }
    const submit = async () => {
        const res = await postApi('/hd/request/SaveCCTV', {
            RequestHead: form.value
        })

        if(res.outputAction.result === 'ok') {
            refresh()
            countStatus()
        }

        modalAdd.value = false
    }

    const deleteItem = async () => {
        const res = await deleteRequestApi(itemDelete.value)

        modelDeleteConfirm.value = false

        refresh()
    }

    const submitApprove = async () => {
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        console.log(res);

        modalConfirmApprove.value = false
        modalApprove.value = false

        
        refresh()
        countStatus()
    }

    const modalAlertApproveAll = ref(false)

    const approveAll = async () => {
        const dataApproveed =  selected.value.filter(re => re.status != 'ปฏิเสธ' && re.status != 'ปฏิเสธจาก(ทส.)' && re.status != 'อนุมัติ').map(re => re.req_id).join(',')
        
        dataApprove.value.Action = 'อนุมัติ'
        dataApprove.value.ReqID = dataApproveed

        modalAlertApproveAll.value = false
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

        refresh()
        countStatus()

        selected.value = []
    }
     const notApproveAll = async () => {
        const dataApproveed =  selected.value.filter(re => re.status != 'ปฏิเสธ' && re.status != 'ปฏิเสธจาก(ทส.)' && re.status != 'อนุมัติ').map(re => re.req_id).join(',')
        
        dataApprove.value.Action = 'ปฏิเสธ'
        dataApprove.value.ReqID = dataApproveed

        modalAlertNotApproveAll.value = false
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

        refresh()
        countStatus()

        selected.value = []


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

        fetch(config.public.apiUrl + '/hd/request/ExportCCTVExcel', requestOptions)
        .then( res => res.blob() )
        .then( re => {
            var file = URL.createObjectURL(re);

            var a = document.createElement('a');
            a.href = file;
            a.download = "รายการคำขอดู CCTV.xlsx";
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();    
            a.remove();  //afterwards we remove the element again      
        });

      
        
        
    }

</script>

<style lang="scss" scoped>

</style>