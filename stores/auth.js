

export const useAuthStore = defineStore("auth-helpdesk", {
    state: () => ({
        user: null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.user,
        isAdmin: (state) =>
            !!state.user.userInGroups.some(
                (p) => p.userGroupId.includes("ADMIN") && p.isInGroup == true
            ),
        isNotUser: (state) =>
            state.user.userInGroups.some(
                (g) =>
                    (g.userGroupId === "ผู้ตรวจสอบยืมพัสดุประจำ ทศ." &&
                        g.isInGroup === true) ||
                    state.user.userInGroups.some(
                        (g) =>
                            g.userGroupId === "อนุมัติยืมโดย ผอ.ทส." &&
                            g.isInGroup === true
                    ) ||
                    state.user.userInGroups.some(
                        (g) =>
                            g.userGroupId === "ผู้ตรวจสอบการขอดู CCTV (ทส.)" &&
                            g.isInGroup === true
                    ) ||
                    state.user.userInGroups.some(
                        (g) =>
                            g.userGroupId === "ผู้ตรวจสอบการแจ้งซ่อม(ทส.)" &&
                            g.isInGroup === true
                    ) ||
                    state.user.userInGroups.some(
                        (g) =>
                            g.userGroupId === "ผู้อนุมัติการขอดู CCTV (ทส.)" &&
                            g.isInGroup === true
                    ) ||
                    state.user.userInGroups.some(
                        (g) =>
                            g.userGroupId ===
                                "ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน" &&
                            g.isInGroup === true
                    ) ||
                    state.user.userInGroups.some(
                        (g) =>
                            g.userGroupId ===
                                "ผู้อนุมัติยืมพัสดุประจำหน่วยงาน" &&
                            g.isInGroup === true
                    )
            ),
        username: (state) => state.user?.currentUser || "",
        fullName: (state) => state.user?.currentUserInfo?.fullName || "",
        firstName: (state) => state.user?.currentUserInfo?.firstName || "",
        lastName: (state) => state.user?.currentUserInfo?.lastName || "",
        prefix: (state) => state.user?.currentUserInfo?.title || "",
    },
    actions: {
        async login(loginForm) {
            const config = useRuntimeConfig();

            const baseUrl = `${config.public.apiUrl}/AppsLogin/LoginMini`;

            const lifetime = 60 * 60 * 24 * config.public.cookieLifetime;

            const response = await $fetch(`${baseUrl}`, {
                method: "POST",
                body: loginForm,
            });

            console.log(response);

            /* Update Pinia state */
            if (response.loginResult == "fail") throw response.loginResultInfo;

            this.user = response;

            const newCookie = useCookie("user", {
                maxAge: lifetime,
                sameSite: true,
                secure: true,
            });

            newCookie.value = this.user;
        },
        logout() {
            const user = useCookie("user");
            user.value = null;
            this.user = null;
        },
        fetchUser() {
            return this.user;
        },
    },
    persist: {
        storage: persistedState.localStorage,
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
