/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WEB3AUTH_CLIENT_ID: string
    readonly VITE_DUFFEL_CHECKOUT_URL: string
    readonly VITE_DUFFEL_PUBLIC_KEY: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
