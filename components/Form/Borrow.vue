<template>
    <div class="flex mb-4">
        <UFormGroup label="วันที่ยืม" name="start_date" size="xl" class="w-1/3">
            <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelStartDate" :disabled="!notDisable" />
                <template #panel="{ close }">
                    <FormDatePicker v-model="form.date_begin"  @close="close" />
                </template>
            </UPopover>
            <div v-if="!isValidDateRange" class="text-red-500">
                วันที่ยืมต้องไม่เกินวันที่คืน
            </div>
        </UFormGroup>
        <UFormGroup label="วันที่คืน" name="end_date" size="xl" class="w-1/3">
            <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelEndDate" :disabled="!notDisable" />
                <template #panel="{ close }">
                    <FormDatePicker v-model="form.date_end" :min-date="form.date_begin" @close="close" />
                </template>
            </UPopover>
        </UFormGroup>
        <UFormGroup label="อุปกรณ์ครบ" name="location_unit" size="xl">
            <UToggle v-model="form.is_full_option" :disabled="!notDisable" size="2xl" />
        </UFormGroup>
    </div>

    <div class="grid grid-cols-5 gap-8 mb-4">
        <UFormGroup label="ผู้ยืม" name="req_by_user_id" size="xl">
            <UInput v-model="form.req_by_fullname" placeholder="กรอกชื่อเพื่อค้นหา" required @input="searchUserId" :disabled="!notDisable || !auth.isAdmin"/>

            <div class="bg-white divide-y-2 rounded absolute z-10 border" v-if="users.length">

                <div v-for="user in users" class="cursor-pointer hover:bg-slate-300 p-2 " @click="selectUserName(user)">{{ user.fullName }} - {{ user.username }}</div>
            </div>
        </UFormGroup>

        <UFormGroup label="หน่วยงาน" name="location_unit" size="xl">
            <UInput v-model="form.department_id" placeholder="" :disabled="true " />
        </UFormGroup>
        
        <UFormGroup label="อีเมล" name="emal_req" size="xl">
            <UInput v-model="form.emal_req" placeholder="" :disabled="!notDisable || (!auth.isAdmin && form.emal_req !== '')" />
        </UFormGroup>
        <UFormGroup label="เบอร์โทรศัพท์" name="phone_req" size="xl">
            <UInput v-model="form.phone_req" placeholder="" :disabled="!notDisable" />
        </UFormGroup>
    </div>
    <div class="mb-4"> 
        <UFormGroup label="วัตถุประสงค์" name="telephone" size="xl">
            <UTextarea :rows="5" placeholder="" v-model="form.purpose_desc" :disabled="!notDisable" />
        </UFormGroup>
    </div>

    <div class="mb-4">
       <FileUpload :files="form.files" :disabled="!notDisable"/>
    </div>

    <div class="text-lg font-bold mb-2"> ประเภทและหมวดหมู่ที่ต้องการยืม</div>
    <div class="p-8 pt-4 mb-2 border rounded-lg grid grid-cols-2 gap-2 relative" v-for="item, index in form.items">
        <div class="absolute right-0 p-2" v-if="form.items.length > 1 ">
            <UButton color="red" :padded="false" icon="i-heroicons-x-mark-20-solid" size="xl" @click="deleteItem(index)" v-if="form.status === '' || form.status === 'รออนุมัติหน่วยงาน' || form.status === 'รอตรวจสอบ(ทส.)'" />
        </div>
        <UFormGroup label="หมวดหมู่อุปกรณ์" name="item_cate" size="xl">
            <USelectMenu 
                v-model="item.item_cate" 
                :options="categories" 
                value-attribute="valueTXT" 
                option-attribute="description1" 
                placeholder="เลือกหมวดหมู่" 
                searchable
                searchable-placeholder="ค้นหาหมวดหมู่"
                @update:model-value="fetchTypeItems"
                :disabled="!notDisable"
                required
            > 
                <template #label>
                    <template v-if="item.item_cate">
                        {{ categories.find(i => i.valueTXT === item.item_cate)?.description1 || item.item_cate_desc }}
                    </template>
                    <template v-else>
                        <span class="text-gray-500 dark:text-gray-400 truncate">เลือกหมวดหมู่</span>
                    </template>
                </template>
            </USelectMenu>
        </UFormGroup>
        <UFormGroup label="ประเภทอุปกรณ์" name="item_type" size="xl">
            <USelectMenu 
                :options="types" 
                placeholder="ประเภทอุปกรณ์" 
                size="xl"
                v-model="item.item_type"
                value-attribute="valueTXT" 
                option-attribute="description1"  
                searchable
                searchable-placeholder="ค้นหาประเภทอุปกรณ์"
                :disabled="!notDisable"
                required
            >
                <template #label>
                    <template v-if="item.item_type">
                        {{ types.find(i => i.valueTXT === item.item_type)?.description1 || item.item_type_desc  }}
                    </template>
                    <template v-else>
                        <span class="text-gray-500 dark:text-gray-400 truncate">เลือกหมวดหมู่</span>
                    </template>
                </template>
                <template #empty>
                    ไม่พบอุปกรณ์ภายในประเภทของหมวดหมู่นี้
                </template>
            </USelectMenu>
        </UFormGroup>

        <!-- <UFormGroup label="รายละเอียดอุปกรณ์" name="item_detail" size="xl">
            <USelectMenu 
                :options="item.items" 
                placeholder="รายละเอียดอุปกรณ์" 
                size="xl"
                v-model="item.item_type"
                value-attribute="item_type" 
                option-attribute="item_type" 
                @update:model-value="selectItem($event, item)"
                searchable
                searchable-placeholder="ค้นหาประเภทอุปกรณ์"
                :disabled="notDisable"
                required
            >
                <template #empty>
                    ไม่พบรายละเอียดอุปกรณ์
                </template>
            </USelectMenu>
        </UFormGroup> -->
        
        <UFormGroup label="จำนวน" name="qty" size="xl">
            <UInput v-model="item.qty" placeholder="กรอกจำนวน" required :disabled="!notDisable" />
        </UFormGroup>

        <div v-if="form?.status && form.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)" class=" self-center">
            <UFormGroup label="เลือกอุปกรณ์ / ระบุ Serial No. ที่ให้ยืม" name="qty" size="xl" v-if="item.item_type && item.item_cate && item.qty">
                <UButton color="blue" label="เลือกอุปกรณ์" size="xl" @click="modalItemSelect(item.item_type, item.item_cate)"  />
            </UFormGroup>
            <div v-else class="text-sm text-red-600">ระบุ ประเภทอุปกรณ์ หมวดหมู่ และจำนวน</div>
        </div>
    </div>

    <div class="p-8 border rounded-lg text-center cursor-pointer" @click="emit('addItem')" v-if="form.status === '' || form.status === 'รออนุมัติหน่วยงาน'">
        <Icon name="material-symbols:add-rounded" size="60" />
    </div>


    <div v-if="form?.status && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)">
        <div class="text-lg font-bold mt-2"> อุปกรณ์ที่ให้ยืม <span class=" text-red-500 font-bold text-base">(สำหรับแอดมินทส. ตรวจสอบ) </span> </div>
        <div class="px-2 mb-2 rounded-lg">
            
            <div v-for="(items, index) in groupBy(form.borrowItems, 'item_type_desc')" class="mb-2">

                <div class="text-lg font-bold mb-2">
                    - {{ index }}  <span class="font-bold">รวม</span> {{ items.length }} จำนวน
                </div>
                <UTable 
                    :rows="items"
                    :columns="[{
                        key: 'serial_number',
                        label: 'Serial No.'
                    }, {
                        key: 'item_name',
                        label: 'ชื่ออุปกรณ์'
                    }, {
                        key: 'model',
                        label: 'รุ่นของอุปกรณ์'
                    }, {
                        key: 'qty',
                        label: 'จำนวน'
                    }, {
                        key: 'actions',
                        label: ''
                    }]"
                    :empty-state="{ label: 'ผู้เข้าร่วม' }"
                    :loading-state="{ label: 'กำลังโหลด...' }"
                    :ui="{
                        base: 'border'
                    }"
                >
                    <template #qty-data="{ index }">
                        1
                    </template>
                    <template #actions-data="{ row }">
                        <div class="flex items-center space-x-4" v-if="form.status === 'รอตรวจสอบ(ทส.)'">
                            <div>
                                <UButton label="ลบ" color="red" @click="selectItemBorrow(row)"/>
                            </div>
                        </div>
                        <div v-else></div>
                    </template>
                </UTable>
                
            </div>
            <div v-if="form?.status === 'รออนุมัติหน่วยงาน'" ></div>
        </div>


       
       
       
    </div>
  

    <div class="mt-4">
        <div class="text-red-600">หมายเหตุ : กรุณาแจ้งล่วงหน้าไม่น้อยกว่า 7 วัน เพื่อความเหมาะสมในการจัดเตรียมเครื่องคอมพิวเตอร์และอุปกรณ์</div>

        <div class="flex space-x-4">
            <UFormGroup label="เพื่อใช้" name="description" size="xl">
                <UInput v-model="form.description" placeholder="" :disabled="!notDisable" />
            </UFormGroup>
            <UFormGroup label="สถานที่" name="location" size="xl">
                <UInput v-model="form.location" placeholder="กรอกสถานที่" :disabled="!notDisable" />
            </UFormGroup>
        </div>
    </div>
              
    <UModal v-model="modalItem"  :ui="{ width: 'sm:max-w-7xl', height: 'min-h-7xl'}">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <div class="text-center">เลือก Serial Number</div>
            </template>

            <UFormGroup :label="`อุปกรณ์ทั้งหมด ${serialTotal} รายการ`" name="inventory" size="xl">

                <div class="p-4 my-2 border overflow-y-auto h-[500px]">

                    <UCheckbox color="primary" 
                        :model-value="form.borrowItems.some(bItem => bItem.item_id == item.item_id)"
                        :id="index"
                        :label="`${item.brand} - ${item.model} - ${item.item_name} ( S/N ${item.serial_number} )`" 
                        class="mb-2" 
                        @update:model-value="selectItemBorrow(item)"
                        :ui="{container: 'flex items-center h-6', base: 'h-5 w-5 dark:checked:bg-current dark:checked:border-transparent dark:indeterminate:bg-current dark:indeterminate:border-transparent disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent'}"
                        v-for="(item, index) in serialItemShow"
                    >
                    </UCheckbox>

                    <div v-if="serialItems.length === 0" class="text-red-500"> ไม่มีอุปกรณ์ที่ว่าง หรือยังไม่มีอุปกรณ์ ในหมวดหมู่ของอุปกรณ์นี้</div>
                </div>
               
            </UFormGroup>

            <template #footer>
                <div class="flex justify-center">
                    <button type="button" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="modalItem = false">ตกลง</button>
                </div>
            </template>
        </UCard>
        
    </UModal>
</template>

<script setup>

    import moment from 'moment'
    moment.locale('th')

    const props = defineProps(['form', 'disabled', 'auth'])
    const emit = defineEmits(['addItem'])

    const notDisable = props.form.status === '' || props.form.status === 'รออนุมัติหน่วยงาน'  

    const labelStartDate = computed(() => props.form.date_begin ? moment(props.form.date_begin).format('DD/MM/YYYY'): 'กรุณาเลือกเวลา')
    const labelEndDate = computed(() => props.form.date_end ? moment(props.form.date_end).format('DD/MM/YYYY'): 'กรุณาเลือกเวลา')
    const users = ref([])
    const categories = ref([])
    const types = ref([])

    const isValidDateRange = computed(() => {
        if (props.form.date_begin && props.form.date_end) {
            return moment(props.form.date_begin).isSameOrBefore(moment(props.form.date_end));
        }
        return true;
    });

    const selectUserName = (user) => {

        props.form.req_by_user_id = user.username
        props.form.req_by_fullname = user.fullName
        props.form.department_id = user.departmentID
        

        users.value = []
    }

    const searchUserId = async (event) => {

        if(event.target.value.length < 5) return
        const data = await searchUserApi(event.target.value)

        users.value = data

    }

    const itemSelect = (inventory, id) => {

        if(inventory) {
            return inventory.find(item => item.item_id === id)
        }
    }
    

    onMounted(() => {
        fetchCateItems()
    })



    const fetchCateItems = async () => {
        categories.value = await getMasterType(`HD_ITEMCATE`, '')
    }

    const fetchTypeItems = async (cate) => {
        types.value = await getMasterType(`HD_ITEMTYPE`, '', cate)
    }


    const deleteItem = (index) => {
        props.form.items.splice(index, 1)
    }

    const serialItems = ref([])
    const serialTotal = ref(0)
    const modalItem = ref()

    const page = ref(1)
    const pageCount = ref(20)


    const modalItemSelect = async (type, cate) => {
        modalItem.value = true
        await updateSerailItem(type, cate)
    }

    const updateSerailItem = async (type, cate) => {

        const data = await getListItems('', 'ว่าง', type, cate)

        if(page.value > 1) {
            page.value = 1
        }
        serialTotal.value  = data.length
        serialItems.value = data


    }

    const serialItemShow = computed(() => serialItems.value)
    const pageTotal = computed(() => serialTotal.value)

   

    const selectItemBorrow = async (item) => {

        const index = props.form.borrowItems.findIndex(i => i.item_id == item.item_id)

        if(index === -1) {
            props.form.borrowItems.push(item) 
            
        }else {
            props.form.borrowItems.splice(index, 1)
        }
       
    }
     

    

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
</script>

<style lang="scss" scoped>

</style>