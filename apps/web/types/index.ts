import { JwtPayload } from "jwt-decode";

export type TenantType = "fleet" | "cooperative" | "coldchain";

export interface CustomCognitoPayload extends JwtPayload {
    client_id?: string;
    username?: string;
    tenant_id?: string;
    tenant_type?: string;
    role?: 'admin' | 'superadmin' | string;
    name?: string;
    org?: string;
}

export type NavItem = { id: string; label: string; icon: React.ReactNode };
