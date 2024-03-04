<template>
    <div>
        <PartialsTitle title="แจ้งปัญหา" @add="addItem" />
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
                    <UInput v-model="textSearch" placeholder="ค้นหาจากชื่อผู้แจ้ง, เบอร์โทรศัพท์" size="md" icon="i-heroicons-magnifying-glass-20-solid" />
                </div>
            </div>
            <div class="flex items-center justify-end space-x-2">
                <div>
                    <UButton
                        icon="i-heroicons-plus-20-solid"
                        size="sm"
                        variant="solid"
                        label="อนุมัติ"
                        :trailing="false"
                        class="bg-green-600 hover:bg-green-700"
                        @click="approveHandle"
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

                <template #item_name-data="{ row }">
                    <div>{{ row.item_type == 'อื่น ๆ' ? row.item_id : row.item_name }}</div>
                </template>

                <template #req_date-data="{ row }">
                    <div>{{ moment(row.req_date).format('DD/MM/YYYY') }}</div>
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

    <UModal v-model="modalAdd" :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UForm :state="form" @submit="submit" autocomplete="off">
            <UCard :ui="{ base: 'px-8', ring: '', divide: 'divide-y divide-black dark:divide-black' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl text-center font-bold leading-6 text-gray-900 dark:text-white">
                            แบบฟอร์มการแจ้งปัญหา
                        </h3>
                        <UButton color="yellow" variant="link" icon="i-heroicons-x-mark-20-solid" size="md" class="-my-1" @click="modalAdd = false;" />
                    </div>
                </template>

                <div class="relative">
                    <div class="absolute right-2 top-0">
                        <UBadge size="lg" :label="form.status" :color="form.status == 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)' ? 'red' : 'emerald'" variant="subtle" />
                    </div>

                    <div v-if="form.status === 'ปฏิเสธจากหน่วยงาน' || form.status == 'ปฏิเสธจาก(ทส.)'" class="text-red-600">
                        <h3 class="font-bold leading-6 text-xl mb-2 ">เหตุผลการปฏิเสธ</h3>
                        <div>{{ form.status2_reason || form.status1_reason }}</div>
                    </div>


                    <div class="grid grid-cols-3 gap-x-8 gap-y-4 mb-8 pt-4">
                        <UFormGroup label="วันที่" name="start_date" size="md">
                            <UPopover :popper="{ placement: 'bottom-start' }">
                                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelDate" :disabled="!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)')" />
                                <template #panel="{ close }">
                                    <FormDatePicker v-model="form.req_date" @close="close" />
                                </template>
                            </UPopover>
                        </UFormGroup>
                        <UFormGroup label="ผู้แจ้ง" name="req_by_user_id" size="md">
                            <UInput v-model="form.req_by_fullname" placeholder="กรอกชื่อเพื่อค้นหา" @input="searchUserId" required :disabled="(!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)') || form.req_by_user_id.length === 13)"/>

                            <div class="bg-white divide-y-2 rounded absolute z-10 border w-full" v-if="users.length">
                                <div class="py-1 px-2 text-gray-500 text-sm text-center">กรุณาเลือกรายชื่อผู้แจ้ง</div>
                                <div v-for="user in users" class="cursor-pointer hover:bg-slate-300 p-2 " @click="selectUserName(user)">{{ user.fullName }} - {{ user.username }}</div>
                            </div>
                        </UFormGroup>
                        <UFormGroup label="หน่วยงาน" name="department_id" size="md">
                        <UInput v-model="form.department_id" placeholder="" required disabled />
                        </UFormGroup>
                        <UFormGroup label="เบอร์โทรศัพท์" name="telephone" size="md">
                        <UInput v-model="form.phone_req" placeholder="" required :disabled="!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)')"/>
                        </UFormGroup>
                        <UFormGroup label="ช่องทางติดต่อ" name="telephone" size="md">
                        <USelectMenu 
                                v-model="form.contact" 
                                :options="contactType" 
                                value-attribute="description1" 
                                option-attribute="description1" 
                                placeholder="เลือกช่องทางติดต่อ" 
                                searchable
                                searchable-placeholder="ค้นหาช่องทางติดต่อ"
                                required
                                :disabled="!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)')"
                            />
                        </UFormGroup>
                    </div>

                    
                    <UFormGroup label="ขอรับบริการด้าน" size="xl" class="mb-8">
                        <div class="pl-4 my-2">
                            <UCheckbox color="primary" 
                                v-model="service.is_select" 
                                :label="service.description1" 
                                class="mb-2" 
                                :ui="{container: 'flex items-center h-6', base: 'h-5 w-5 dark:checked:bg-current dark:checked:border-transparent dark:indeterminate:bg-current dark:indeterminate:border-transparent disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent'}"
                                v-for="(service, index) in form.services"
                            />
                        </div>
                    </UFormGroup>
                    <div class="grid grid-cols-3 gap-8 mb-8">
                        
                        <UFormGroup label="ประเภทอุปกรณ์" name="item_type" size="md">
                            <USelectMenu 
                                v-model="form.item_type" 
                                :options="itemsType" 
                                value-attribute="description1" 
                                option-attribute="description1" 
                                placeholder="เลือกประเภทอุปกรณ์" 
                                searchable
                                searchable-placeholder="ค้นหาประเภทอุปกรณ์"
                                class="mb-2"
                                :disabled="!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)') || form.item_type == 'อื่น ๆ'"
                            />

                            <UCheckbox label="อื่น ๆ" :model-value="form.item_type == 'อื่น ๆ' ? true: false"  @update:model-value="value => updateItemOther(value)" />
                        </UFormGroup>
                        <UFormGroup label="อุปกรณ์" name="item_id" size="md">
                            <USelectMenu 
                                v-model="form.item_id" 
                                :options="inventoryitems" 
                                value-attribute="item_id" 
                                option-attribute="item_name" 
                                placeholder="เลือกอุปกรณ์" 
                                searchable
                                searchable-placeholder="ค้นหาอุปกรณ์"
                                :disabled="!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)')"
                                v-if="form.item_type != 'อื่น ๆ'"
                            > 
                                <template #label>
                                    <template v-if="form.item_id">
                                        {{ itemSelect?.item_name ?? form.item_name}}
                                    </template>
                                    <template v-else>
                                        <span class="text-gray-500 dark:text-gray-400 truncate">เลือกอุปกรณ์</span>
                                    </template>
                                </template>
                            
                            </USelectMenu>
                            <UInput v-else v-model="form.item_id" placeholder="กรอกชื่ออุปกรณ์" />

                        </UFormGroup>
                    </div>
                    <UFormGroup label="อาการเสีย/ปัญหา" name="dCenter" size="md" class="mb-4">
                        <UTextarea :rows="4" v-model="form.description" required :disabled="!(form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)')"/>
                    </UFormGroup>

                    <UFormGroup label="ผู้ปรับปรุงข้อมูลล่าสุด" name="dCenter" size="md" class="mb-4">
                        <UInput v-model="form.modified_by" disabled/>
                    </UFormGroup>
                    <UFormGroup label="วันที่ปรับปรุงล่าสุด" name="dCenter" size="md">
                        <UInput v-model="form.modified_date" disabled/>
                    </UFormGroup>
                </div>

                <template #footer v-if="form.status === undefined || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)'">
                    <div class="flex items-center justify-end space-x-4">
                        <UButton color="amber" label="บันทึกคำขอ" type="submit" size="md" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                        <UButton color="gray" @click="modalAdd = false;" label="ยกเลิก" type="button" size="md" :ui="{ rounded: 'rounded-full', padding: { xl: 'px-4 py-1'} }"/>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

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

                <template #footer v-if="!isView">
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
    import { number, object, string } from 'yup'
    moment.locale('th')
    const modalAdd = ref(false)

    definePageMeta({
        middleware: ["auth"]
    })

     
    const modalApprove = ref(false)
    const modalConfirmApprove = ref(false)

    const modalFinish = ref(false)

    const servicesType = ref([])
    const textSearch = ref('')
   

    const columns = [{
        key: 'id',
        label: 'ลำดับที่'
    }, {
        key: 'req_date',
        label: 'วันที่ส่งคำขอ'
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


       

        if((row.status == 'รออนุมัติหน่วยงาน' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน' && g.isInGroup === true) ) || (row.status == 'รอตรวจสอบ(ทส.)' &&  auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
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

        if(row.status == 'ส่งซ่อม' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้แจ้งซ่อมเสร็จ' && g.isInGroup == true)) {
            btn.push({
                label: 'แจ้งซ่อมเสร็จ',
                icon: 'i-heroicons-archive-box-20-solid',
                click: () => fetchEditData(row.req_id, true)
            })
        }

        return [btn]
    }

    const page = ref(1)
    const pageCount = ref(20)
    const pageTotal = computed(() => lists.value.total)
    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

    const date = ref(moment())
    const labelDate = computed(() => moment(form.value.req_date).format('DD/MM/YYYY'))



    const template =  {
        req_id:"",//กรณีเพิ่มใหม่ไม่ต้องส่งค่ามา แต่ถ้าเป็นการแก้ไขให้เลขเอกสารมา
        req_date: date.value,//วันที่ขอ
        req_by_user_id: auth.username.length === 13 ? auth.username: '',
        req_by_fullname: auth.username.length === 13 ? auth.user.currentUserInfo.fullName : '',
        phone_req:auth.user.currentUserInfo.tel,
        emal_req: auth.username.length === 13 ? auth.user.currentUserInfo.email : '',
        department_id:  auth.username.length === 13 ? auth.user.currentUserInfo.departmentID: '',
        department_desc: "",
        item_id: "",
        item_name: "",
        fix_by: "",
        item_type: "",
        description:"",//รายละเอียด  
        created_by:auth.username, //ผู้ทำรายการ
        modified_by:auth.username,//ผู้แก้ไขรายการ
        services: [],
        contact: ''
    }
    const form = ref(template)

    const schema = object({
        department_id: string().required('กรุณาค้นหาและเลือกชื่อผู้แจ้งให้ถูกต้อง ')
    })


    const modelDeleteConfirm = ref(false)
    const itemDelete = ref()
    const users = ref([])

    const addItem = () => {

          form.value = {
            req_id:"",//กรณีเพิ่มใหม่ไม่ต้องส่งค่ามา แต่ถ้าเป็นการแก้ไขให้เลขเอกสารมา
            req_date: date.value,//วันที่ขอ
            req_by_user_id: auth.username.length === 13 ? auth.username: '',
            req_by_fullname: auth.username.length === 13 ? auth.user.currentUserInfo.fullName : '',
            phone_req:auth.user.currentUserInfo.tel,
            emal_req: auth.username.length === 13 ? auth.user.currentUserInfo.email : '',
            department_id:  auth.username.length === 13 ? auth.user.currentUserInfo.departmentID: '',
            department_desc: "",
            item_id: "",
            item_name: "",
            fix_by: "",
            item_type: "",
            description:"",//รายละเอียด  
            created_by:auth.username, //ผู้ทำรายการ
            modified_by:auth.username, //ผู้แก้ไขรายการ
            services: servicesType.value,
            contact: ''

        }
        modalAdd.value = true
      
    }
   


    const selected = ref([])

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
        name : 'ส่งซ่อม',
        count: 0,
        color: 'lime'
    }, {
        name : 'ซ่อมเสร็จ',
        count: 0,
        color: 'green'
    }, {
        name : 'ถูกปฎิเสธ (ไม่อนุมัติ)',
        count: 0,
        color: 'red'
    }])
    const statusActive = ref('รายการทั้งหมด')

    const dataApprove = ref({
        ReqID:"",  
        Action:"",//สถานะมี 2 สถานะคือ  (อนุมัติ , ปฏิเสธ)
        ActiondBy:auth.username,//อนุมัติหรือปฏิเสธโดย
        Reason:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

    const dataFinish = ref({
        ReqID:"",  
        ActiondBy:"",//อนุมัติหรือปฏิเสธโดย
        Result_report:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
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
            const data = await postApi('/hd/request/ListRepair', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Username":  auth.username,
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
            case 'รออนุมัติ':
                statusSearch = 'รออนุมัติหน่วยงาน,รอตรวจสอบ(ทส.)'
                break;
            case 'ถูกปฎิเสธ (ไม่อนุมัติ)':
                statusSearch = 'ปฏิเสธจากหน่วยงาน,ปฏิเสธการส่งซ่อม'
                break;
            case 'ส่งซ่อม':
                statusSearch = 'ส่งซ่อม'
                break;
            case 'ซ่อมเสร็จ':
                statusSearch = 'ซ่อมเสร็จ'
                break;
            default:
                break;
        }
        return statusSearch
    }

    const { data: lists, pending, refresh } = await useAsyncData(
        'lists',
        async () => {
            const data = await postApi('/hd/request/ListRepair', {
                "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Username":  auth.username,
                "Status":statusSearch.value//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
            })
            if(textSearch.value !== '' && page.value > 1) {
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

    const itemsType = ref([])
    const itemSelect = computed(() => inventoryitems.value.find(item => item.item_id === form.value.item_id))

    const { data: inventoryitems } = await useAsyncData(
        'inventoryitems',
        async () => await getListItems('', '', form.value.item_type), {
            watch: [page, pageCount, textSearch, form]
        }
    )

    onMounted(() => {
        fetchTypeItems()
        countStatus()
        fetchTypeService()
        fetchTypeContact()

    })

    const isView = ref(false)
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

        isView.value = view
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

   
    const contactType = ref([])
   
    const fetchTypeItems = async () => {
        itemsType.value = await getMasterType(`HD_ITEMTYPE`, '')
    }

    const fetchTypeService = async () => {
        servicesType.value = await getMasterType(`HD_SERVICE_TYPE`, '')
    }
    const fetchTypeContact = async () => {
        contactType.value = await getMasterType(`HD_CONTACT`, '')
    }
  
    const updateItemOther = (value) => {
        value ? form.value.item_type = 'อื่น ๆ' : form.value.item_type = null; form.value.item_id = ''
    }

    const selectUserName = (user) => {
        form.value.req_by_user_id = user.username
        form.value.req_by_fullname = user.fullName
        form.value.department_id = user.departmentID
        form.value.department_desc = user.departmentID
        

        users.value = []
    }

    const searchUserId = async (event) => {

        if(event.target.value.length < 5) return
        const data = await searchUserApi(event.target.value)

        users.value = data

    }

    const resetForm = () => {
        form.value = {
            req_id:"",//กรณีเพิ่มใหม่ไม่ต้องส่งค่ามา แต่ถ้าเป็นการแก้ไขให้เลขเอกสารมา
            req_date: date.value,//วันที่ขอ
            req_by_user_id: auth.username.length === 13 ? auth.username: '',
            req_by_fullname: auth.username.length === 13 ? auth.user.currentUserInfo.fullName : '',
            phone_req:auth.user.currentUserInfo.tel,
            emal_req: auth.username.length === 13 ? auth.user.currentUserInfo.email : '',
            item_id: "",
            fix_by: "",
            item_type: "",
            description:"",//รายละเอียด  
            created_by:auth.username, //ผู้ทำรายการ
            modified_by:auth.username//ผู้แก้ไขรายการ
        }
    }

    const submit = async () => {

        form.value.modified_by = auth.username
       
        const res = await postApi('/hd/request/SaveRepair', {
            RequestHead: form.value,
            RequestService: form.value.services.map(service => {
                return {
                    is_select: service.is_select || false,
                    service_type: service.valueTXT
                }
            })
        })

        if(res.outputAction.result === 'ok') {
            refreshDataAll()
            users.value = []
            
        }

        resetForm()
        modalAdd.value = false
       
    }

    const deleteItem = async () => {
        const res = await deleteRequestApi(itemDelete.value)

        modelDeleteConfirm.value = false

        refreshDataAll()
    }

    const submitApprove = async () => {
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        console.log(res);

        modalConfirmApprove.value = false
        modalApprove.value = false
        refreshDataAll()
    }
    

    const submitFinish = async () => {
        const res = await postApi('/hd/request/FinishRepair', dataFinish.value)

        modalApprove.value = false
        modalFinish.value = false
        refreshDataAll()
    }

    const refreshDataAll = () => {
        refresh()
        countStatus()
    }

    const alertSelect = ref(false)
    const approveHandle = () => {


        if(selected.value.length === 0) {
            alertSelect.value = true
            return
        }
        modalAlertApproveAll.value = true
    }

    const modalAlertApproveAll = ref(false)

    const approveAll = async () => {

        if((auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน' && g.isInGroup === true) ) || (auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
            const dataApproveed =  selected.value.filter(re => re.status != 'ซ่อมเสร็จ' && re.status != 'ส่งซ่อม' && re.status != 'ปฏิเสธจากหน่วยงาน').map(re => re.req_id).join(',')
        
            dataApprove.value.Action = 'อนุมัติ'
            dataApprove.value.ReqID = dataApproveed

            modalAlertApproveAll.value = false
            const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

            refresh()
            countStatus()

            selected.value = []

            return
        }

         modalAlertApproveAll.value = false
        return alert('คุณไม่มีสิทธิ์ในการจัดการ')
       

    }

    const exportFile = async () => {

        const config = useRuntimeConfig();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "SearchText": textSearch.value,//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
            "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
            "DateEnd": null,//ถึงวันที่ซ่อม
            "Status":statusSearch.value//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(config.public.apiUrl + '/hd/request/ExportRepairExcel', requestOptions)
        .then( res => res.blob() )
        .then( re => {
            var file = URL.createObjectURL(re);

            var a = document.createElement('a');
            a.href = file;
            a.download = "รายการแจ้งซ่อม.xlsx";
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();    
            a.remove();  //afterwards we remove the element again      
        });

      
        
        
    }
</script>

<style lang="scss" scoped>

</style>