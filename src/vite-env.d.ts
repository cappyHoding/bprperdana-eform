/// <reference types="vite/client" />
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly PERDANA_EFORM_SERVICE_URL: string;
    readonly VITE_VIDA_SANDBOX: string;
    readonly VITE_VIDA_SIGNING_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
