<template>
    <div class="h-full ">
        <PartialsTitle title="คำขอดู CCTV" title-breadcrum="การตั้งค่า" url-back="/settings" noAdd/>

        <div class="flex flex-col h-full items-center justify-center"> 
            <div class="flex w-full justify-center space-x-10">
                <NuxtLink to="/settings/cctv/case" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="i-ri-ticket-fill" size="80" color="gray" />
                    <div class="mt-2">กรณี</div>
                </NuxtLink>
                <NuxtLink to="/settings/cctv/purpose" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="icon-park-solid:surveillance-cameras-two" size="80" color="gray" />
                    <div class="mt-2">วัตถุประสงค์</div>
                </NuxtLink>
                <NuxtLink to="/settings/cctv/building" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="i-ic-baseline-home-work" size="80" color="gray" />
                    <div class="mt-2">อาคาร</div>
                </NuxtLink>
                <NuxtLink to="/settings/cctv/floor" class="p-6 text-center border rounded-xl w-1/6">
                    <Icon name="i-material-symbols:floor" size="80" color="gray" />
                    <div class="mt-2">ชั้น</div>
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