# PLAN: Clerk Signup Flow Verification

## Goal

Verify that the email/password signup flow correctly syncs users to the Neon database and identify why the user "Ana Scaravati" might not have received a verification code.

## User Review Required

> [!IMPORTANT]
> The issue "didn't receive confirmation email" is primarily a Clerk/Email Provider configuration issue. We can't fix email delivery from the code, but we can verify our webhooks and sync logic aren't blocking anything.

## Tasks

- [ ] **Verify DB Access** -> Check if `neondash` project allows SQL queries.
- [ ] **Check User Status** -> Query `users` table for 'Ana Scaravati'.
  - If found: Webhook worked. Issue is purely email.
  - If not found: Webhook didn't fire (expected if unverified) or failed.
- [ ] **Browser Simulation** -> Use `browser_subagent` to attempt a signup with a test email (`test+clerk@example.com`).
  - Verify UI flow reaches "Enter verification code".
  - If it errors before that, it's a frontend bug.
- [ ] **Code Review: Sync Logic** -> Ensure `syncClerkUser` handles unverified emails gracefully.
  - Current logic: upserts based on `clerkId`.
  - Constraint: No explicit check for `email_verified`.
- [ ] **Code Review: Auth Router** -> Check if `AuthSync` (client-side) is redundant or essential.

## Verification Plan

### Automated Tests

- **Browser Flow**:
  1. Open `http://localhost:5173`.
  2. Click "Entrar" -> Sign Up.
  3. Enter dummy credentials.
  4. Assert "Enter verification code" screen appears.

### Manual Verification

- **DB Check**: `SELECT * FROM users WHERE email = 'test+clerk@example.com';` (Should NOT exist yet if verification is required).
