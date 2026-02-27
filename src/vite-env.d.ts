/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_PROJECT_ID: string
    readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_GOOGLE_SCRIPT_URL: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare namespace google {
    namespace accounts {
        namespace oauth2 {
            interface TokenClientConfig {
                client_id: string;
                scope: string;
                callback: (response: any) => void;
                error_callback?: (error: any) => void;
            }
            interface TokenClient {
                requestAccessToken(options?: { prompt?: string }): void;
            }
            function initTokenClient(config: TokenClientConfig): TokenClient;
        }
    }
}
