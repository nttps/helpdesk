// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from "./package.json";

const apiBaseUrl = process.env.NUXT_PUBLIC_API_URL;

export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: false,
    modules: ["@nuxtjs/google-fonts", "@nuxt/ui", "nuxt-icon"],
    googleFonts: {
        display: "swap",
        prefetch: true,
        preconnect: true,
        families: {
            Kanit: true,
        },
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
