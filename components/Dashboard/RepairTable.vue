<template>

    <UTable 
        v-model="selectedRows" 
        :columns="columns" 
        :rows="rows" 
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
</template>


<script setup>

    const props = defineProps(['selectedRows', 'columns', 'rows', 'updateSelected', 'pending'])






</script>