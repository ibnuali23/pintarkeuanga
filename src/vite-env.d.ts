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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback: (response: any) => void;
                auto_select?: boolean;
                cancel_on_tap_outside?: boolean;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error_callback?: (error: any) => void;
            }
            interface TokenClient {
                requestAccessToken(options?: { prompt?: string }): void;
            }
            function initTokenClient(config: TokenClientConfig): TokenClient;
        }
    }
}
