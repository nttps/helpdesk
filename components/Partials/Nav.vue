<template>
    <div class="flex flex-col justify-between h-full">
        <div>
            <NuxtLink class="text-center">
                <img src="/logo.png" alt="logo" class="mx-auto">
            </NuxtLink>
            <nav class="nav-top">
                <ul>
                    <li>
                        <NuxtLink to="/" v-slot="{ isActive }">
                            <Icon name="i-ri-ticket-fill" size="40" :class="isActive ? 'text-black' : ''" />
                            <div :class="isActive ? 'text-black' : ''">ยืม-คืนพัสดุ</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/cctv" v-slot="{ isActive }">
                            <Icon name="icon-park-solid:surveillance-cameras-two" size="40" :class="isActive ? 'text-black' : ''"/>
                            <div :class="isActive ? 'text-black' : ''">คำขอ CCTV</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/report-repair" v-slot="{ isActive }">
                            <Icon name="ic:baseline-handyman" size="40" :class="isActive ? 'text-black' : ''"/>
                            <div :class="isActive ? 'text-black' : ''">แจ้งซ่อม</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/inventory" v-slot="{ isActive }">
                            <Icon name="bi:box-seam-fill" size="40" :class="isActive ? 'text-black' : ''"/>
                            <div :class="isActive ? 'text-black' : ''">คลังอุปกรณ์</div>
                        </NuxtLink>
                    </li>
                    <!-- <li>
                        <NuxtLink to="/dashboard" v-slot="{ isActive }">
                            <Icon name="mdi:monitor-dashboard" size="40" :class="isActive ? 'text-black' : ''"/>
                            <div :class="isActive ? 'text-black' : ''">แดชบอร์ด</div>
                        </NuxtLink>
                    </li> -->
                </ul>
            </nav>
        </div>

        <nav class="nav-bottom">
            <ul>
                <li>
                    <NuxtLink to="/help" v-slot="{ isActive }">
                        <Icon name="material-symbols:help" size="40" :class="isActive ? 'text-black' : ''"/>
                        <div :class="isActive ? 'text-black' : ''">ช่วยเหลือ</div>
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/settings" v-slot="{ isActive }">
                        <Icon name="material-symbols:settings" size="40" :class="isActive ? 'text-black' : ''"/>
                        <div :class="isActive ? 'text-black' : ''">ตั้งค่า</div>
                    </NuxtLink>
                </li>
                <li>
                    <a>
                        <UPopover mode="hover" :popper="{ offsetDistance: -15 }">
                            <UAvatar
                                :alt="authStore.fullName"
                                size="md"
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
        </nav>
    </div>
  

</template>

<style scoped>
    
    nav ul li a {
        @apply flex flex-col items-center text-xs
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

</script>