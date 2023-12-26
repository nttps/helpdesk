<template>
    <div class="flex mb-4">
        <UFormGroup label="วันที่ยืม" name="start_date" size="xl" class="w-1/3">
            <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelStartDate" :disabled="!notDisable" />
                <template #panel="{ close }">
                    <FormDatePicker v-model="form.date_begin" @close="close" />
                </template>
            </UPopover>
        </UFormGroup>
        <UFormGroup label="วันที่คืน" name="end_date" size="xl" class="w-1/3">
            <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton icon="i-heroicons-calendar-days-20-solid" :trailing="true" color="gray" variant="outline" class="md:w-4/5" size="md" :label="labelEndDate" :disabled="!notDisable" />
                <template #panel="{ close }">
                    <FormDatePicker v-model="form.date_end" @close="close" />
                </template>
            </UPopover>
        </UFormGroup>
        <UFormGroup label="อุปกรณ์ครบ" name="location_unit" size="xl">
            <UToggle v-model="form.itemApprove" :disabled="!notDisable" size="2xl" />
        </UFormGroup>
    </div>

    <div class="grid grid-cols-5 gap-8 mb-4">
        <UFormGroup label="ผู้ยืม" name="req_by_user_id" size="xl">
            <UInput v-model="form.req_by_fullname" placeholder="กรอกชื่อเพื่อค้นหา" required @input="searchUserId" :disabled="!notDisable"/>

            <div class="bg-white divide-y-2 rounded absolute z-10 border" v-if="users.length">

                <div v-for="user in users" class="cursor-pointer hover:bg-slate-300 p-2 " @click="selectUserName(user)">{{ user.fullName }} - {{ user.username }}</div>
            </div>
        </UFormGroup>

        <UFormGroup label="หน่วยงาน" name="location_unit" size="xl">
            <UInput v-model="form.department_id" placeholder="" :disabled="!notDisable" />
        </UFormGroup>
        
        <UFormGroup label="ศูนย์เขต" name="location_unit" size="xl">
            <UInput v-model="form.location_unit" placeholder="" :disabled="!notDisable" />
        </UFormGroup>
        <UFormGroup label="อีเมล" name="emal_req" size="xl">
            <UInput v-model="form.emal_req" placeholder="" :disabled="!notDisable" />
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

    <div class="text-lg font-bold mb-2"> อุปกรณ์ที่ต้องการยืม {{ form.status }}</div>
    <div class="p-8 pt-4 mb-2 border rounded-lg grid grid-cols-2 gap-2 relative" v-for="item, index in form.items">
        <div class="absolute right-0 p-2" v-if="form.items.length > 1 && form.status == '' || form.status == 'รออนุมัติหน่วยงาน' || form.status == 'รอตรวจสอบ(ทส.)'">
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
                :disabled="!notDisable"
            />
        </UFormGroup>
        <UFormGroup label="อุปกรณ์" name="inventory" size="xl">
            <USelectMenu 
                v-model="item.item_id" 
                :options="item.inventory" 
                value-attribute="item_id" 
                option-attribute="item_name" 
                placeholder="เลือกอุปกรณ์" 
                searchable
                searchable-placeholder="ค้นหาอุปกรณ์"
                :disabled="!notDisable"
            > 
                <template #label>
                    <template v-if="item.item_id">
                        {{ itemSelect(item.inventory, item.item_id)?.item_name ?? item.item_name}}
                    </template>
                    <template v-else>
                        <span class="text-gray-500 dark:text-gray-400 truncate">เลือกอุปกรณ์</span>
                    </template>
                </template>
            </USelectMenu>
        </UFormGroup>
        
        <UFormGroup label="จำนวน" name="qty" size="xl">
            <UInput v-model="item.qty" placeholder="กรอกจำนวน" :disabled="!notDisable" />
        </UFormGroup>

        
    </div>

    <div class="p-8 border rounded-lg text-center cursor-pointer" @click="$emit('addItem')" v-if="notDisable">
        <Icon name="material-symbols:add-rounded" size="60" />
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
              
</template>

<script setup>

    import moment from 'moment'
    moment.locale('th')

    const props = defineProps(['form', 'create'])

    const notDisable = (props.create !== undefined)

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
        item.inventory = await getListItems('', '', value)
    }
    const fetchTypeItems = async (item) => {
        itemsType.value = await getMasterType(`HD_ITEMTYPE`, '')
    }

    const deleteItem = (index) => {
        props.form.items.splice(index, 1)
    }
</script>

<style lang="scss" scoped>

</style>