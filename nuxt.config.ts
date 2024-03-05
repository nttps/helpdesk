// https://nuxt.com/docs/configuration/nuxt-config
import pkg from "./package.json";

const apiBaseUrl = process.env.NUXT_PUBLIC_API_URL;
const baseURL = process.env.NUXT_BASE_URL;


export default defineNuxtConfig({
    devtools: { enabled: true },
    app: {
        baseURL: baseURL ? "/" + baseURL : "/",
    },
    nitro: {
        runtimeConfig: {
            app: {
                //baseURL: baseURL || "/",
                buildAssetsDir: `${baseURL ? "/" + baseURL : "/"}_nuxt/`,
            },
        },
    },
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
            homeUrl: "",
        },
    },
});
