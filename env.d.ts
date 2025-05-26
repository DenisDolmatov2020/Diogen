/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AUTH_URL: string
  readonly VITE_APP_FRONT_TOKEN: string
  readonly VITE_API_BASIC_LOGIN: string
  readonly VITE_API_BASIC_PASSWORD: string
  readonly VITE_API_LOGIN_ENDPOINT: string
  readonly VITE_DEV_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 