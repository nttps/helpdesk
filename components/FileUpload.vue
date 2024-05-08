<template>
    <UFormGroup label="แนบไฟล์" class="mb-2" name="file" size="xl">
        <UInput type="file" @change="pickFile" :disabled="!notDisabled" />
    </UFormGroup>

    <div class="relative flex align-center space-y-2 justify-between" v-for="(file, index) in files">

        <a :href="file.fileUrl" target="_blank" class="hover:text-black break-words">{{ file.fileName || file.file.name }}</a>
        <div>
            <UButton color="red" :padded="false" variant="solid" icon="i-heroicons-x-mark-20-solid" size="xl" class="rounded-full -my-1" @click="deleteFile(file.fileId, index)" />
        </div>

       
    </div>
    <UModal v-model="deleteFileModal">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="text-center">ต้องการลบไฟล์นี้ใช่หรือไม่</div>
        </template>

        <template #footer>
            <div class="flex justify-between">
                <button type="button" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="removeFile">ยืนยัน</button>
                <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="deleteFileModal = false">ยกเลิก</button>
            </div>
        </template>
        </UCard>
    </UModal>
</template>

<script setup>
    const props = defineProps(['files', 'notDisabled'])
    const emit = defineEmits(['deleteFile'])


    const deleteFileModal = ref(false)
    const fileStateType = ref(null)

    const pickFile = (e) => {
        const file = e.target.files[0]
        const blob = URL.createObjectURL(file)

        if(blob == null) return
        
        if(fileStateType.value !== null) {
            props.files[fileStateType.value] = {
                file: file,
                fileUrl: blob
            }
        }else {
            props.files.push({
                file: file,
                fileUrl: blob
            })
        }
   }

   const fileIdDelete = ref(null)
   const fileStateDelete = ref(null)


   const deleteFile = (id, key) => {
        deleteFileModal.value = true

        fileIdDelete.value = id
        fileStateDelete.value = key
   }

   const removeFile = async () => {
        if (fileStateDelete.value > -1) {
            props.files.splice(fileStateDelete.value, 1);
        }

        if(fileIdDelete.value)
            await getApi(`/hd/request/DeleteRequestFile?fileid=${fileIdDelete.value}`)

        deleteFileModal.value = false
    }
</script>

<style lang="scss" scoped>

</style>