<template>
    <div class="grid grid-cols-2 gap-8">
        <div>
            <div class="grid grid-cols-2 mb-4">
                <UFormGroup label="วันที่ยื่นคำร้อง" name="type" size="xl">
                    {{ labelDateRequest }}
                </UFormGroup>
                <UFormGroup label="ความสำคัญ" name="type" size="xl">
                    {{ form.urgent_level  }}
                </UFormGroup>
            </div>
            <UFormGroup label="สถานที่" class="mb-4" name="type" size="xl">
                {{ form.location }}
            </UFormGroup>
            <div class="grid grid-cols-2 mb-4">
                <UFormGroup label="ตั้งแต่วันที่" class="mb-4" name="type" size="xl">
                    {{ labelDateTimeBegin }}
                </UFormGroup>
                <UFormGroup label="ถึงวันที่" name="type" size="xl">
                    {{ labelDateTimeEnd }}
                </UFormGroup>
            </div>
        </div>
        <div>
            <UFormGroup label="วัตถุประสงค์" class="mb-4" name="type" size="xl">
                {{ form.purpose_desc }}
            </UFormGroup>
            <UFormGroup label="อาคาร" class="mb-4" name="type" size="xl">
                {{ form.building_id }}
            </UFormGroup>
            <UFormGroup label="ชั้น" class="mb-4" name="type" size="xl">
                {{ form.floor }}
            </UFormGroup>
            <UFormGroup label="กรณี" name="type" size="xl">
                {{ form.case_type === 'กรณีอื่น ๆ' ? form.case_desc : form.case_type }}
            </UFormGroup>
        </div>
    </div>

    <h3 class="font-bold leading-6 text-xl mb-4">รายละเอียดผู้ยื่นคำร้อง</h3>
    <div class="grid grid-cols-2 gap-8">
        <UFormGroup label="ชื่อ-นามสกุล" name="type" size="xl">
            {{ form.req_by_fullname }}
        </UFormGroup>
        <UFormGroup label="เบอร์โทรศัพท์" name="phone_req" size="xl">
            {{ form.phone_req }}
        </UFormGroup>
    </div>
</template>

<script setup>
    const props = defineProps(['form'])
</script>

<style lang="scss" scoped>

</style>