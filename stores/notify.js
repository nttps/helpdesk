export const useNotifyStore = defineStore("auth-notify", {
    state: () => ({
        lists: [],
    }),
    getters: {
        readCount: (state) =>
            state.lists.filter((list) => list.is_read === true).length,
        unReadCount: (state) =>
            state.lists.filter((list) => list.is_read === false).length,
    },
    actions: {
        async fetchNotify() {
            const authStore = useAuthStore();
            const res = await getApi(
                `/hd/request/ListNotify?user=${authStore.username}&isShowReaded=1`
            );

            this.lists = res;
        },
    },
    persist: {
        storage: persistedState.localStorage,
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
