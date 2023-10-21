<template>
    <div class="flex flex-col justify-between h-full">
        <div>
            <NuxtLink class="text-center">
                <img src="/logo.png" alt="logo" class="mx-auto">
            </NuxtLink>
            <nav class="nav-top">
                <ul>
                    <li>
                        <NuxtLink to="/">
                            <Icon name="i-ri-ticket-fill" size="40"/>
                            <div>ยืม-คืนพัสดุ</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/cctv">
                            <Icon name="icon-park-solid:surveillance-cameras-two" size="40"/>
                            <div>คำขอ CCTV</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/report-repair">
                            <Icon name="ic:baseline-handyman" size="40"/>
                            <div>แจ้งซ่อม</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/inventory">
                            <Icon name="bi:box-seam-fill" size="40"/>
                            <div>คลังอุปกรณ์</div>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/dashboard">
                            <Icon name="mdi:monitor-dashboard" size="40"/>
                            <div>แดชบอร์ด</div>
                        </NuxtLink>
                    </li>
                </ul>
            </nav>
        </div>

        <nav class="nav-bottom">
            <ul>
                <li>
                    <NuxtLink>
                        <Icon name="material-symbols:help" size="40"/>
                        <div>ช่วยเหลือ</div>
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink>
                        <Icon name="material-symbols:settings" size="40"/>
                        <div>ตั้งค่า</div>
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink>
                        <div class="w-10 h-10 rounded-full bg-gray-400">
                            <img src="" alt="">
                        </div>
                        <div>Admin</div>
                    </NuxtLink>
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