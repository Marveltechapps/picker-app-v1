# Backend API Structure - Banking & Wallet Module

## Overview

This document outlines the backend API structure for the banking and wallet module. All APIs require authentication via Bearer token in the Authorization header.

**Base URL**: `https://api.example.com` (configure via `EXPO_PUBLIC_API_URL`)

**Authentication**: All endpoints require `Authorization: Bearer <token>` header

---

## 1. Bank Account Verification

### POST `/bank/verify`

Verify bank account details using payment gateway API (Razorpay/Cashfree/Stripe Treasury).

**Request Body:**
```json
{
  "accountHolder": "Rajesh Kumar",
  "accountNumber": "1234567890123456",
  "ifscCode": "HDFC0001234",
  "bankName": "HDFC Bank", // Optional
  "branch": "MG Road, Bangalore" // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "verified": true,
  "bankAccountId": "ba_1234567890",
  "bankName": "HDFC Bank",
  "branch": "MG Road, Bangalore",
  "message": "Bank account verified successfully"
}
```

**Response (Failed):**
```json
{
  "success": false,
  "verified": false,
  "error": "Invalid account number or IFSC code",
  "code": "VERIFICATION_FAILED"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `500` - Server error

**Implementation Notes:**
- Validate format client-side first
- Call payment gateway API (Razorpay/Cashfree) for real verification
- Cache verification results (optional)
- Rate limit: 5 requests per minute per user

---

## 2. Bank Account Management

### POST `/bank/accounts`

Save verified bank account.

**Request Body:**
```json
{
  "accountHolder": "Rajesh Kumar",
  "accountNumber": "1234567890123456",
  "ifscCode": "HDFC0001234",
  "bankName": "HDFC Bank",
  "branch": "MG Road, Bangalore"
}
```

**Response:**
```json
{
  "id": "acc_1234567890",
  "accountHolder": "Rajesh Kumar",
  "accountNumber": "****3456", // Masked
  "ifscCode": "HDFC0001234",
  "bankName": "HDFC Bank",
  "branch": "MG Road, Bangalore",
  "isVerified": true,
  "isDefault": true,
  "createdAt": "2026-01-27T10:00:00Z",
  "updatedAt": "2026-01-27T10:00:00Z"
}
```

### GET `/bank/accounts`

Get all saved bank accounts for the user.

**Response:**
```json
[
  {
    "id": "acc_1234567890",
    "accountHolder": "Rajesh Kumar",
    "accountNumber": "****3456",
    "ifscCode": "HDFC0001234",
    "bankName": "HDFC Bank",
    "branch": "MG Road, Bangalore",
    "isVerified": true,
    "isDefault": true,
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
]
```

### PUT `/bank/accounts/:accountId`

Update bank account details.

**Request Body:**
```json
{
  "accountHolder": "Rajesh Kumar",
  "bankName": "HDFC Bank",
  "branch": "New Branch"
}
```

**Response:** Same as POST `/bank/accounts`

### PUT `/bank/accounts/:accountId/set-default`

Set bank account as default.

**Response:** Same as POST `/bank/accounts`

### POST `/bank/accounts/:accountId/delete`

Delete bank account.

**Response:**
```json
{
  "success": true,
  "message": "Bank account deleted successfully"
}
```

---

## 3. Wallet Balance

### GET `/wallet/balance`

Get wallet balance and earnings.

**Response:**
```json
{
  "availableBalance": 25000.00,
  "pendingBalance": 5000.00,
  "totalEarnings": 30000.00,
  "currency": "INR"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

## 4. Withdrawal

### POST `/wallet/withdraw`

Initiate withdrawal to bank account.

**Request Body:**
```json
{
  "amount": 25000.00,
  "bankAccountId": "acc_1234567890",
  "idempotencyKey": "withdraw_1234567890_abc123" // Optional, prevents duplicates
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "txn_1234567890",
  "amount": 25000.00,
  "status": "pending", // pending | processing | completed | failed
  "message": "Withdrawal request submitted successfully",
  "estimatedCompletionTime": "2026-01-27T14:00:00Z"
}
```

**Response (Failed):**
```json
{
  "success": false,
  "transactionId": "",
  "amount": 25000.00,
  "status": "failed",
  "error": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error / Insufficient balance
- `401` - Unauthorized
- `409` - Duplicate request (idempotency key conflict)
- `500` - Server error

**Implementation Notes:**
- Validate balance before processing
- Create transaction record with status "pending"
- Process payment via payment gateway (async)
- Update transaction status based on gateway response
- Support idempotency via `idempotencyKey`
- Rate limit: 10 requests per hour per user

**Error Codes:**
- `INSUFFICIENT_BALANCE` - Not enough balance
- `INVALID_BANK_ACCOUNT` - Bank account not found or not verified
- `DUPLICATE_REQUEST` - Same idempotency key used
- `WITHDRAWAL_LIMIT_EXCEEDED` - Daily/monthly limit exceeded
- `PAYMENT_GATEWAY_ERROR` - Gateway API error

---

## 5. Transaction History

### GET `/wallet/history`

Get transaction history with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `type` (string, optional) - Filter by type: `credit` | `debit`
- `status` (string, optional) - Filter by status: `pending` | `processing` | `completed` | `failed`
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string

**Example:** `/wallet/history?page=1&limit=20&type=debit&status=completed`

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_1234567890",
      "type": "debit",
      "amount": 25000.00,
      "status": "completed",
      "description": "Withdrawal to HDFC Bank",
      "referenceId": "TXN20260127001",
      "createdAt": "2026-01-27T10:00:00Z",
      "completedAt": "2026-01-27T10:05:00Z",
      "metadata": {
        "bankAccountId": "acc_1234567890",
        "bankName": "HDFC Bank",
        "paymentMode": "Bank Transfer",
        "failureReason": null
      }
    },
    {
      "id": "txn_0987654321",
      "type": "credit",
      "amount": 5000.00,
      "status": "completed",
      "description": "Salary payment",
      "referenceId": "TXN20260120001",
      "createdAt": "2026-01-20T10:00:00Z",
      "completedAt": "2026-01-20T10:00:00Z",
      "metadata": {
        "paymentMode": "Salary Credit"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### GET `/wallet/transactions/:transactionId`

Get single transaction details.

**Response:** Same as transaction object in history array

---

## Database Schema

### Bank Accounts Table

```sql
CREATE TABLE bank_accounts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  account_holder VARCHAR(255) NOT NULL,
  account_number_encrypted TEXT NOT NULL, -- Encrypted
  account_number_masked VARCHAR(20) NOT NULL, -- Last 4 digits
  ifsc_code VARCHAR(11) NOT NULL,
  bank_name VARCHAR(255),
  branch VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  verification_id VARCHAR(255), -- Payment gateway verification ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (user_id, is_default)
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL,
  description VARCHAR(500),
  reference_id VARCHAR(255) UNIQUE,
  bank_account_id VARCHAR(255),
  payment_gateway_id VARCHAR(255), -- Gateway transaction ID
  idempotency_key VARCHAR(255) UNIQUE,
  metadata JSON, -- Additional data
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  INDEX idx_idempotency_key (idempotency_key),
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
);
```

### Wallet Balance Table

```sql
CREATE TABLE wallet_balance (
  user_id VARCHAR(255) PRIMARY KEY,
  available_balance DECIMAL(10, 2) DEFAULT 0.00,
  pending_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'INR',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Payment Gateway Integration

### Recommended: Razorpay Payouts

**Setup:**
1. Create Razorpay account
2. Enable Payouts API
3. Add API keys to environment variables

**Bank Verification:**
```javascript
// Example using Razorpay Node.js SDK
const razorpay = require('razorpay');

async function verifyBankAccount(accountNumber, ifscCode) {
  try {
    const response = await razorpay.fundAccount.validate({
      account_number: accountNumber,
      ifsc: ifscCode,
    });
    return { verified: true, bankName: response.bank_name };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}
```

**Withdrawal:**
```javascript
async function processWithdrawal(amount, bankAccountId) {
  try {
    const payout = await razorpay.payouts.create({
      account_number: bankAccountId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      mode: 'NEFT',
      purpose: 'payout',
    });
    return { success: true, transactionId: payout.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Alternative: Cashfree Payouts

Similar integration pattern. Refer to Cashfree Payouts API documentation.

---

## Security Considerations

1. **Encryption**: Store account numbers encrypted at rest
2. **Masking**: Never return full account numbers in API responses
3. **Rate Limiting**: Implement rate limits on sensitive endpoints
4. **Idempotency**: Use idempotency keys for withdrawals
5. **Audit Logs**: Log all financial transactions
6. **Validation**: Server-side validation mandatory (never trust client)
7. **HTTPS**: All API calls must use HTTPS
8. **Token Expiry**: Implement JWT token expiry and refresh

---

## Error Handling

All errors should follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INSUFFICIENT_BALANCE` - Not enough balance
- `PAYMENT_GATEWAY_ERROR` - Gateway API error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

---

## Testing

### Test Bank Accounts (Razorpay Test Mode)

Use these test accounts for development:

- Account Number: `0000000000001`
- IFSC: `HDFC0000001`
- Account Holder: `Test Account`

### Postman Collection

Create a Postman collection with:
- Authentication setup
- All endpoints
- Test cases for success and error scenarios

---

## Monitoring & Logging

1. **Transaction Monitoring**: Track all withdrawals and their statuses
2. **Error Tracking**: Log all API errors with context
3. **Performance**: Monitor API response times
4. **Alerts**: Set up alerts for failed withdrawals or high error rates
5. **Audit Trail**: Maintain complete audit trail for compliance

---

## Next Steps

1. Set up backend server (Node.js/Express recommended)
2. Configure payment gateway (Razorpay/Cashfree)
3. Implement database schema
4. Create API endpoints
5. Add authentication middleware
6. Implement rate limiting
7. Set up monitoring and logging
8. Test with test accounts
9. Deploy to production

---

## Support

For questions or issues, contact the backend team or refer to:
- Payment Gateway Documentation (Razorpay/Cashfree)
- Internal API Documentation
- Security Guidelines
