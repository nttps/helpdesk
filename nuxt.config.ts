// https://nuxt.com/docs/api_dx/configuration/nuxt-config
import pkg from "./package.json";

const apiBaseUrl = process.env.NUXT_PUBLIC_API_URL;

export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: false,
    modules: [
        "@nuxtjs/google-fonts",
        "@nuxt/ui",
        "nuxt-icon",
        [
            "@pinia/nuxt",
            {
                autoImports: ["defineStore", "acceptHMRUpdate"],
            },
        ],
        "@pinia-plugin-persistedstate/nuxt",
    ],
    googleFonts: {
        display: "swap",
        prefetch: true,
        preconnect: true,
        families: {
            Kanit: true,
        },
    },
    css: [
        // CSS file in the project
        "@/assets/css/main.css",
    ],
    imports: {
        dirs: ["stores"],
    },
    runtimeConfig: {
        public: {
            cookieLifetime: 7,
            version: pkg.version,
            apiUrl: apiBaseUrl,
            authUrl: "",
        },
    },
});
