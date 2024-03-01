<template>
    <div class="flex mb-4">
        <UFormGroup label="วันที่ยืม" name="start_date" size="xl" class="w-1/3">
            <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelStartDate" :disabled="notDisable" />
                <template #panel="{ close }">
                    <FormDatePicker v-model="form.date_begin" @close="close" />
                </template>
            </UPopover>
        </UFormGroup>
        <UFormGroup label="วันที่คืน" name="end_date" size="xl" class="w-1/3">
            <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelEndDate" :disabled="notDisable" />
                <template #panel="{ close }">
                    <FormDatePicker v-model="form.date_end" @close="close" />
                </template>
            </UPopover>
        </UFormGroup>
        <UFormGroup label="อุปกรณ์ครบ" name="location_unit" size="xl">
            <UToggle v-model="form.itemApprove" :disabled="notDisable" size="2xl" />
        </UFormGroup>
    </div>

    <div class="grid grid-cols-5 gap-8 mb-4">
        <UFormGroup label="ผู้ยืม" name="req_by_user_id" size="xl">
            <UInput v-model="form.req_by_fullname" placeholder="กรอกชื่อเพื่อค้นหา" required @input="searchUserId" :disabled="notDisable || form.req_by_user_id.length === 13"/>

            <div class="bg-white divide-y-2 rounded absolute z-10 border" v-if="users.length">

                <div v-for="user in users" class="cursor-pointer hover:bg-slate-300 p-2 " @click="selectUserName(user)">{{ user.fullName }} - {{ user.username }}</div>
            </div>
        </UFormGroup>

        <UFormGroup label="หน่วยงาน" name="location_unit" size="xl">
            <UInput v-model="form.department_id" placeholder="" :disabled="true " />
        </UFormGroup>
        
        <UFormGroup label="อีเมล" name="emal_req" size="xl">
            <UInput v-model="form.emal_req" placeholder="" :disabled="notDisable || (form.req_by_user_id.length === 13 && form.emal_req !== '')" />
        </UFormGroup>
        <UFormGroup label="เบอร์โทรศัพท์" name="phone_req" size="xl">
            <UInput v-model="form.phone_req" placeholder="" :disabled="notDisable || (form.req_by_user_id.length === 13 && form.phone_req !== '')" />
        </UFormGroup>
    </div>
    <div class="mb-4"> 
        <UFormGroup label="วัตถุประสงค์" name="telephone" size="xl">
            <UTextarea :rows="5" placeholder="" v-model="form.purpose_desc" :disabled="notDisable" />
        </UFormGroup>
    </div>

    <div class="text-lg font-bold mb-2"> ประเภทและหมวดหมู่ที่ต้องการยืม</div>
    <div class="p-8 pt-4 mb-2 border rounded-lg grid grid-cols-2 gap-2 relative" v-for="item, index in form.items">
        <div class="absolute right-0 p-2" v-if="form.items.length > 1 ">
            <UButton color="red" :padded="false" icon="i-heroicons-x-mark-20-solid" size="xl" @click="deleteItem(index)" v-if="notDisable" />
        </div>
        <UFormGroup label="ประเภทอุปกรณ์" name="item_type" size="xl">
            <USelectMenu 
                :options="itemsType" 
                placeholder="ประเภทอุปกรณ์" 
                size="xl"
                v-model="item.item_type"
                value-attribute="description1" 
                option-attribute="description1" 
                @update:model-value="selectItem($event, item)"
                searchable
                searchable-placeholder="ค้นหาประเภทอุปกรณ์"
                :disabled="notDisable"
                required
            />
        </UFormGroup>
        <UFormGroup label="หมวดหมู่" name="inventory" size="xl">
            <USelectMenu 
                v-model="item.item_cate" 
                :options="item.inventory" 
                value-attribute="item_cate" 
                option-attribute="item_cate" 
                placeholder="เลือกหมวดหมู่" 
                searchable
                searchable-placeholder="ค้นหาหมวดหมู่"
                :disabled="notDisable"
                required
            > 
                <template #label>
                    <template v-if="item.item_cate">
                        {{ itemSelect(item.inventory, item.item_cate)?.item_cate ?? item.item_cate}}
                    </template>
                    <template v-else>
                        <span class="text-gray-500 dark:text-gray-400 truncate">เลือกหมวดหมู่</span>
                    </template>
                </template>
            </USelectMenu>
        </UFormGroup>
        
        <UFormGroup label="จำนวน" name="qty" size="xl">
            <UInput v-model="item.qty" placeholder="กรอกจำนวน" required :disabled="notDisable" />
        </UFormGroup>

        <div v-if="form?.status && form.status == 'รอตรวจสอบ(ทส.)' && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)" class=" self-center">
            <UFormGroup label="เลือกอุปกรณ์ / ระบุ Serial No. ที่ให้ยืม" name="qty" size="xl" v-if="item.item_type && item.item_cate && item.qty">
                <UButton color="blue" label="เลือกอุปกรณ์" size="xl" @click="modalItemSelect(item.item_type, item.item_cate)"  />
            </UFormGroup>
            <div v-else class="text-sm text-red-600">ระบุ ประเภทอุปกรณ์ หมวดหมู่ และจำนวน</div>
        </div>
    </div>

    <div class="p-8 border rounded-lg text-center cursor-pointer" @click="emit('addItem')" v-if="form.status === '' || form.status === 'รออนุมัติหน่วยงาน' || form.status === 'รอตรวจสอบ(ทส.)'">
        <Icon name="material-symbols:add-rounded" size="60" />
    </div>


    <div v-if="form?.status && auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบยืมพัสดุประจำ ทศ.' && g.isInGroup === true)">
        <div class="text-lg font-bold mt-2"> อุปกรณ์ที่ให้ยืม <span class=" text-red-500 font-bold text-base">(สำหรับแอดมินทส. ตรวจสอบ) </span> </div>
        <div class="px-2 mb-2 rounded-lg">
            
            <div v-for="(items, index) in groupBy(form.borrowItems, 'item_cate')" class="mb-2">

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

            <UFormGroup label="อุปกรณ์" name="inventory" size="xl">

                <div class="p-4 my-2 border">
                    <UCheckbox color="primary" 
                        :model-value="form.borrowItems.some(bItem => bItem.item_id == item.item_id)"
                        :label="`${item.item_cate} - ${item.serial_number} - ${item.item_name}`" 
                        class="mb-2" 
                        @update:model-value="selectItemBorrow(item)"
                        :ui="{container: 'flex items-center h-6', base: 'h-5 w-5 dark:checked:bg-current dark:checked:border-transparent dark:indeterminate:bg-current dark:indeterminate:border-transparent disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent'}"
                        v-for="(item, index) in serialItems"
                    />

                    <div v-if="serialItems.length === 0" class="text-red-500"> ไม่มีอุปกรณ์ที่ว่าง หรือยังไม่มีอุปกรณ์ ในหมวดหมู่ของอุปกรณ์นี้</div>
                </div>
               
                
                <div class="flex flex-wrap justify-end items-center px-3 pt-3" v-if="serialItems.length > 0">
                    <UPagination 
                    v-model="page" 
                    :page-count="pageCount" 
                    :total="serialTotal" 
                    />
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

    const notDisable = props.disabled && (props.form.status === 'รออนุมัติหน่วยงาน' || props.form.status === 'รอตรวจสอบ(ทส.)')

    console.log(notDisable);

    const labelStartDate = computed(() => moment(props.form.date_begin).format('DD/MM/YYYY'))
    const labelEndDate = computed(() => moment(props.form.date_end).format('DD/MM/YYYY'))
    const users = ref([])
    const itemsType = ref([])

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
        fetchTypeItems()
    })

    const selectItem = async (value, item) => {
        const data = await getListItems('', '', value)


        item.inventory = data.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.item_cate === value.item_cate
            ))
        )
    }
    const fetchTypeItems = async (item) => {
        itemsType.value = await getMasterType(`HD_ITEMTYPE`, '')
    }


    const deleteItem = (index) => {
        props.form.items.splice(index, 1)
    }

    const serialItems = ref([])
    const serialTotal = ref(0)
    const modalItem = ref()

    const page = ref(1)
    const pageCount = ref(20)

    const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
    const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

    const modalItemSelect = async (type, cate) => {
        modalItem.value = true

        const data = await getListItems('', '', type, cate)

        if(page.value > 1) {
            page.value = 1
        }
        serialTotal.value  = data.length,
        serialItems.value = data.filter(i => i.status === 'ว่าง' ).slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)

    }
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