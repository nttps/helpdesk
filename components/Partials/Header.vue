<template>
    <header class="flex w-full justify-between px-2 lg:py-4 shadow-md">
        <nav
            class="
            flex
            items-center
            gap-x-8
            2xl:gap-x-0
            justify-between
            w-full
            py-4
            md:py-0
            2xl:px-4
            text-lg text-gray-700
            bg-white
            "
        >
            <div>
                <a href="#" class="flex justify-center items-center">
                    <img src="~/assets/images/logo.png" class="w-[70px]" alt="E-Learning Logo">
                    <div class="text-lg 2xl:text-2xl ml-4 font-semibold">
                        <div>DDPM</div> 
                        <div class="text-[#FFA133]">E-Learning</div> 
                    </div>
                </a>
            </div>
            <div class="flex relative">
                <button type="button" class="relative" @click="notificationBar = true" ref="buttonNotificationRef">
                    <img src="~/assets/images/notification.svg" class="w-[50px]" alt="">
                </button>

                <USlideover v-model="notificationBar">
                    <Notification/>
                </USlideover>
                
                <button type="button" class="flex justify-center items-center space-x-4 relative" @click="toggleMenuBar"  ref="buttonProfileRef">
                    <div class="flex justify-center items-center">
                        <img src="~/assets/images/user.svg" class="w-[38px] ml-4 mr-2" alt="">
                    </div>
                    <Icon name="solar:alt-arrow-down-outline" class="text-3xl" color="#3E3E3E" />
                     <ProfileMenu  v-if="menuBar"/>
                </button>
               
            </div>
        </nav>
        
    </header>
</template>

<style>
    .nav-header-li {
        @apply px-2 2xl:px-8 py-2 block hover:bg-[#FFA800] hover:text-white rounded-[20px] transition delay-100;
    }
</style>

<script setup>

    const menuBar = ref(false)
    const notificationBar = ref(false)
    const buttonProfileRef = ref(null);
    const buttonNotificationRef = ref(null);
    const config = useRuntimeConfig();
    onClickOutside(
        buttonProfileRef,
        (event) => {
            menuBar.value = false
        },
    )

    const toggleMenuBar = () => {
        menuBar.value = !menuBar.value
        notificationBar.value = false
    }

  
</script>