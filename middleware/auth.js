export default defineNuxtRouteMiddleware((_to, from) => {
    const { $pinia } = useNuxtApp();
    const authStore = useAuthStore($pinia);
    const { isLoggedIn } = storeToRefs(authStore);


    if (!isLoggedIn.value) {
        return navigateTo({ name: "login" });
    }
});
