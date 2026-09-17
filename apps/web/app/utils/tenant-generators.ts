import { webcrypto } from 'crypto';
import { TenantType } from "@/types";

const TENANT_PREFIXES: Record<TenantType, string> = {
  fleet: "flt",
  cooperative: "coop",
  coldchain: "cld"
}

function slugify(text: string): string {
  return text.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/-+$/, '');
}

function generateSecureShortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    webcrypto.getRandomValues(array);
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    const byte = array[i];
    if (byte !== undefined) {
      result += chars.charAt(byte % chars.length);
    }
  }
  return result;
}

export function generateTenantId(businessName: string, type: TenantType): string {
  if (!businessName || !type) {
    //throw new Error("Business name and tenant type are required to generate a Tenant ID");
    return "";
  }

  const prefix = TENANT_PREFIXES[type];
  if (!prefix) {
    throw new Error(`Invalid tenant type: ${type}`);
  }
  const slug = slugify(businessName);
  const cleanSlug = slug.length > 0 ? slug.substring(0, 30) : "tenant";
  const uniqueSuffix = generateSecureShortId(6);
  return `${prefix}_${cleanSlug}_${uniqueSuffix}`;
}

export function generateTemporarySecurePassword(): string {
  return "P@ss1" + Math.random().toString(36).slice(-8) + "!";
}