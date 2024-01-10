<template>
    <div class="h-full ">
        <PartialsTitle title="การตั้งค่า" noAdd/>

        <div class="flex flex-col h-full items-center justify-center"> 
            <div class="flex w-full justify-center space-x-10">
                <NuxtLink to="/settings/cctv" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="icon-park-solid:surveillance-cameras-two" size="80" color="gray" />
                    <div class="mt-2">คำขอ CCTV</div>
                </NuxtLink>
                <NuxtLink to="/settings/report-repair" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="ic:baseline-handyman" size="80" color="gray" />
                    <div class="mt-2">แจ้งซ่อม</div>
                </NuxtLink>
                 <NuxtLink to="/settings/inventory" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="bi:box-seam-fill" size="80" color="gray" />
                    <div class="mt-2">อุปกรณ์</div>
                </NuxtLink>
            </div>
            <div class="flex w-full justify-center space-x-10 mt-4">
                <NuxtLink to="/settings/users" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="icon-park-solid:surveillance-cameras-two" size="80" color="gray" />
                    <div class="mt-2">ผู้ใช้งาน</div>
                </NuxtLink>
                <NuxtLink to="/settings/user-groups" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="ic:baseline-handyman" size="80" color="gray" />
                    <div class="mt-2">กลุ่มผู้ใช้งาน</div>
                </NuxtLink>
            </div>
        </div>
       
    </div>
</template>

<script setup>
    definePageMeta({
        middleware: ["auth"]
    })

</script>

<style lang="scss" scoped>

</style>