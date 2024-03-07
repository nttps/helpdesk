<template>
    <div class="flex items-center justify-between gap-3 py-2 px-2 border-b-2 border-[#FFA825]">
        <div class="lg:flex-1 ">
            <NuxtLink class="flex items-center gap-1.5">
                <img src="~/assets/images/logo.png" class="w-[70px]" alt="ระบบขอรับบริการด้าน IT Support">
                <div class="text-xl 2xl:text-2xl ml-2">
                    <div>ระบบขอรับบริการด้าน IT Support</div> 
                    <div class="text-[#FFA133]">กรมป้องกันและบรรเทาสาธารณภัย</div> 
                </div>
            </NuxtLink>
        </div>
        <ul class="flex justify-between gap-4">
            <li class="text-center">
                <NuxtLink to="/" v-slot="{ isActive }">
                    <Icon name="i-ri-ticket-fill" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'" />
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">แดชบอร์ด</div>
                </NuxtLink>
            </li>
            <li class="text-center">
                <NuxtLink to="/borrow" v-slot="{ isActive }">
                    <Icon name="i-ri-ticket-fill" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'" />
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">ยืม-คืนพัสดุ</div>
                </NuxtLink>
            </li>
            <li class="text-center">
                <NuxtLink to="/cctv" v-slot="{ isActive }">
                    <Icon name="icon-park-solid:surveillance-cameras-two" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'"/>
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">คำขอดู CCTV</div>
                </NuxtLink>
            </li>
            <li class="text-center">
                <NuxtLink to="/report-repair" v-slot="{ isActive }">
                    <Icon name="ic:baseline-handyman" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'"/>
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">แจ้งปัญหา</div>
                </NuxtLink>
            </li>
            <li class="text-center">
                <NuxtLink to="/inventory" v-slot="{ isActive }">
                    <Icon name="bi:box-seam-fill" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'"/>
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">คลังอุปกรณ์</div>
                </NuxtLink>
            </li>
            <!-- <li>
                <NuxtLink to="/dashboard" v-slot="{ isActive }">
                    <Icon name="mdi:monitor-dashboard" size="40" :class="!isActive ? 'text-black' : ''"/>
                    <div :class="!isActive ? 'text-black' : ''">แดชบอร์ด</div>
                </NuxtLink>
            </li> -->
        </ul>
    
        <ul class="flex items-center justify-end lg:flex-1 py-2 gap-4">
            <li>
                <button type="button" class="relative" @click="notificationBar = true" ref="buttonNotificationRef">
                    <UChip :text="notifications.length" color="red" size="2xl" class="flex-col">
                        <Icon name="material-symbols:notifications" size="40"/>
                        <div>แจ้งเตือน</div>
                    </UChip>
                </button>
            </li>
            <li class="text-center">
                <NuxtLink to="/help" v-slot="{ isActive }" >
                    <Icon name="material-symbols:help" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'"/>
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">ช่วยเหลือ</div>
                </NuxtLink>
            </li>
            <li v-if="authStore.isAdmin">
                <NuxtLink to="/settings" v-slot="{ isActive }">
                    <Icon name="material-symbols:settings" size="40" :class="!isActive ? 'text-black' : 'text-[#FFA825]'"/>
                    <div :class="!isActive ? 'text-black' : 'text-[#FFA825]'">ตั้งค่า</div>
                </NuxtLink>
            </li>
            <li >
                <a class="text-center">
                    <UPopover mode="hover" :popper="{ offsetDistance: -15 }">
                        <UAvatar
                            :alt="authStore.fullName"
                            size="md"
                            class="mx-auto"
                        />
                        <template #panel>
                                <div class="px-4">
                                    <button 
                                        class="py-2 px-2 flex items-center space-x-4 border-l-8 border-transparent text-black" 
                                        exact-active-class="!border-amber-600" 
                                        active-class="!border-amber-600"
                                        @click="logout"
                                    >
                                        <div>ออกจากระบบ</div>
                                    </button>
                                </div>
                        </template>
                    </UPopover>
                    <div class="text-center">
                        {{ authStore.username }}
                    </div>
                </a>
                
            </li>
        </ul>
    </div>
    <USlideover v-model="notificationBar">
        <Notification :notifications="notifications || []" @refresh="refresh"/>
    </USlideover>

</template>

<style scoped>
    
    nav ul li a, nav ul li button {
        @apply flex flex-col items-center text-xs w-full
    }
    .nav-top ul li {
        @apply mb-6 mt-6
    }
    .nav-bottom ul li {
        @apply mb-4 last:mb-0
    }
</style>

<script setup>
    const authStore = useAuthStore();

    const logout = () => {
        authStore.logout()

        navigateTo('/login')
    }

     const notificationBar = ref(false)

    const { data: notifications, pending, refresh } = await useAsyncData('notifications', async () => await getApi(`/hd/request/ListNotify?user=${authStore.username}&isShowReaded=0`))
</script>