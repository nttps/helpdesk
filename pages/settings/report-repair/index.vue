<template>
    <div class="h-full ">
        <PartialsTitle title="แจ้งปัญหา" title-breadcrum="การตั้งค่า" url-back="/settings" noAdd/>

        <div class="flex flex-col h-full items-center justify-center"> 
            <div class="flex w-full justify-center space-x-10">
                <!-- <NuxtLink to="/settings/report-repair/purpose" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="icon-park-solid:surveillance-cameras-two" size="80" color="gray" />
                    <div class="mt-2">วัตถุประสงค์</div>
                </NuxtLink> -->
                <NuxtLink to="/settings/report-repair/contact" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="i-ri-ticket-fill" size="80" color="gray" />
                    <div class="mt-2">ช่องทางติดต่อ</div>
                </NuxtLink>
                <NuxtLink to="/settings/report-repair/service" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="i-ri-ticket-fill" size="80" color="gray" />
                    <div class="mt-2">บริการ</div>
                </NuxtLink>
                <NuxtLink to="/settings/report-repair/reason" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="i-material-symbols:floor" size="80" color="gray" />
                    <div class="mt-2">ชิ้นส่วน</div>
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