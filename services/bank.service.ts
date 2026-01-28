/**
 * Bank Service
 * 
 * Handles bank account verification and management.
 * Integrates with payment gateway APIs (Razorpay/Cashfree/Stripe Treasury).
 */

import { apiPost, apiGet, apiPut, ApiClientError } from "@/utils/apiClient";

export interface BankAccountDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  branch?: string;
}

export interface BankVerificationRequest {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  branch?: string;
}

export interface BankVerificationResponse {
  success: boolean;
  verified: boolean;
  bankAccountId?: string;
  bankName?: string;
  branch?: string;
  message?: string;
  error?: string;
}

export interface SavedBankAccount {
  id: string;
  accountHolder: string;
  accountNumber: string; // Masked (last 4 digits)
  ifscCode: string;
  bankName: string;
  branch?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Verify bank account details
 * 
 * This calls the backend API which:
 * 1. Validates format (client-side validation should be done first)
 * 2. Calls payment gateway API (Razorpay/Cashfree) for real account verification
 * 3. Returns verification status
 */
export async function verifyBankAccount(
  details: BankVerificationRequest
): Promise<BankVerificationResponse> {
  try {
    const response = await apiPost<BankVerificationResponse>("/bank/verify", details);
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Save verified bank account
 * 
 * Saves bank account after successful verification.
 */
export async function saveBankAccount(
  details: BankAccountDetails
): Promise<SavedBankAccount> {
  return apiPost<SavedBankAccount>("/bank/accounts", details);
}

/**
 * Get saved bank accounts
 */
export async function getBankAccounts(): Promise<SavedBankAccount[]> {
  return apiGet<SavedBankAccount[]>("/bank/accounts");
}

/**
 * Get default bank account
 */
export async function getDefaultBankAccount(): Promise<SavedBankAccount | null> {
  try {
    const accounts = await getBankAccounts();
    return accounts.find((acc) => acc.isDefault) || accounts[0] || null;
  } catch {
    return null;
  }
}

/**
 * Update bank account
 */
export async function updateBankAccount(
  accountId: string,
  details: Partial<BankAccountDetails>
): Promise<SavedBankAccount> {
  return apiPut<SavedBankAccount>(`/bank/accounts/${accountId}`, details);
}

/**
 * Set default bank account
 */
export async function setDefaultBankAccount(accountId: string): Promise<SavedBankAccount> {
  return apiPut<SavedBankAccount>(`/bank/accounts/${accountId}/set-default`, {});
}

/**
 * Delete bank account
 */
export async function deleteBankAccount(accountId: string): Promise<void> {
  return apiPost<void>(`/bank/accounts/${accountId}/delete`, {});
}

/**
 * Client-side validation helpers
 */
export function validateIFSC(ifsc: string): boolean {
  // IFSC format: 4 letters + 0 + 6 alphanumeric
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}

export function validateAccountNumber(accountNumber: string): boolean {
  // Account number: 9-18 digits
  return /^\d{9,18}$/.test(accountNumber);
}

export function validateAccountHolder(holderName: string): boolean {
  // Account holder: 2-100 characters, letters and spaces
  return /^[a-zA-Z\s]{2,100}$/.test(holderName.trim());
}
