<template>
    <div class="text-left bg-white text-[#B6B6B6] flex flex-col h-screen">
        <div class="flex justify-between items-center text-black border-b-2 border-[#B8B8B8] px-4 py-2">
            <div class="font-bold text-lg">การแจ้งเตือน</div>
            <!-- <button type="button" class="text-sm flex items-center" @click="markRead"> 
                <span class="mr-2">ทำเครื่องหมายว่าอ่านแล้วทั้งหมด</span>  <Icon name="ic:baseline-settings" size="25" /> 
            </button> -->
        </div>
        <div class=" text-black max-h-[calc(100%-56px)] overflow-y-auto bg-white">
            <div class="flex items-center space-x-4 border-b-2 border-[#E1E1E1] px-8 py-4 bg-white break-words" v-for="notification in notificationRows">
                <div class="w-[40px]">
                    <Icon name="mdi:alert" class="text-red-600" size="30"/>
                </div>
                <div class="w-[90%]">
                    <div class="text-lg font-bold break-words">{{  notification.noti_topic  }}</div>
                    <div class="break-words">{{  notification.noti_desc  }}</div>
                </div>
            </div>
            <div class="text-center px-8 py-4" v-if="props.notifications.length == 0">
                ไม่มีรายการแจ้งเตือน
            </div>
          
        </div>
         <div class="bg-[#FFA800] text-center text-white py-4 text-base rounded-b-[10px]" v-if="props.notifications.length > pageCount">
                <button @click="onClickMore" class="block text-center mx-auto">การแจ้งเตือนเพิ่มเติม</button>
            </div>
    </div>
</template>

<script setup>
    const props = defineProps(['notifications'])
    const emit = defineEmits(['refresh'])
    const config = useRuntimeConfig();
    const user = useAuthStore();
    const pageCount = ref(5)


    const notificationRows = computed(() => {
        return props.notifications.slice(0 , pageCount.value)
    })

    const onClickMore = () => {
        pageCount.value = pageCount.value + 5
    }

    const markRead = async () => {
        const url = config.public.apiUrl + config.public.api.notification.readMark;

        const res = await fetch(`${url}?username=${user.user.currentUser}`)
        const data = await res.json()

        emit('refresh')
        
    }

</script>

<style lang="scss" scoped>

</style>