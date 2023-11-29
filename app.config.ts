export default defineAppConfig({
    ui: {
        primary: "amber",
        card: {
            base: "overflow-initial",
        },
        formGroup: {
            label: {
                base: "block font-bold text-black dark:text-gray-200",
            },
        },
        radioGroup: {
            legend: "text-sm flex font-medium text-gray-700 dark:text-gray-200 mb-1",
        },
    },
});
