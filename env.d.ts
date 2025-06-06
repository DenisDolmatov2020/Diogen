/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AUTH_URL: string
  readonly VITE_APP_FRONT_TOKEN: string
  readonly VITE_API_BASIC_LOGIN: string
  readonly VITE_API_BASIC_PASSWORD: string
  readonly VITE_API_LOGIN_ENDPOINT: string
  readonly VITE_DEV_MODE: string
  readonly VITE_PROJECT_ID: string
  readonly VITE_USER_ID: string
  // Встроенные переменные Vite
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 