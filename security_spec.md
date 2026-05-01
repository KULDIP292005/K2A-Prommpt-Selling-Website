# Security Specification

## Data Invariants
- A prompt must have a valid title, description, and price.
- Only the specified admin email (`kuldippushpad1@gmail.com`) can create or modify prompts.
- Users can only read their own profile data.
- Admins can read all user profiles.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempting to create a prompt as a non-admin.
2. **Elevated Privileges**: A user trying to set `isAdmin: true` on their own profile.
3. **Stolen Resource**: User A trying to read User B's purchased prompts.
4. **Invalid Image**: Uploading a prompt with a malicious 1MB string for the image URL.
5. **Missing Schema**: Creating a prompt without a price.
6. **Malicious ID**: Creating a prompt with a document ID containing special characters that could break list queries.
7. **Bypass Verification**: Attempting to buy a prompt without a verified email (if required).
8. **Shadow Update**: Adding an extra field `isVerified: true` to a prompt update.
9. **Price Manipulation**: Attempting to update a prompt price as a regular user.
10. **Resource Exhaustion**: Writing a prompt with an array of 10,000 features.
11. **PII Leak**: A signed-in user trying to list all users to see their emails.
12. **State Poisoning**: Setting `isFree: true` on a paid prompt.

## Test Runner (Mock)
A suite of tests would verify that all the above unauthorized operations return `PERMISSION_DENIED`.
