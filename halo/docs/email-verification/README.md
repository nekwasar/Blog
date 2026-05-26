## Background

In Halo, email serves as the primary method for user identification and communication. It ensures the validity and ownership of a user's email address, reduces abuse, improves account security, and enables users to receive important notifications (password resets, new account registration, confirming critical operations, etc.).

Email verification is a key component of user management. It helps maintain a healthy, reliable user base and provides administrators with an additional security and management tool. Implementing an efficient, secure, and user-friendly email verification feature is essential.

## Requirements

1. **User Registration Verification**: Ensure new users provide a valid email address during signup. Email verification as a necessary step for account activation helps reduce fake accounts and improves overall user quality.
2. **Password Reset and Security Operations**: Send password reset links to verified email addresses when users forget their passwords or need to reset them.
3. **User Notifications**: Verified email addresses ensure users can receive important notifications (comments on posts, new replies, etc.).

## Goals

- Support re-verification after email changes.
- Allow users to request a new verification email if they didn't receive it or it expired.
- Prevent abuse (e.g., frequent verification email requests) by adding rate limits.
- Verification code expiration to ensure security and validity.

## Non-Goals

- Multi-email address verification.

## Design

### EmailVerificationManager

Uses Guava's Cache to manage email verification state:

```java
class EmailVerificationManager {
  private final Cache<UsernameEmail, Verification> emailVerificationCodeCache =
          CacheBuilder.newBuilder()
                  .expireAfterWrite(CODE_EXPIRATION_MINUTES, TimeUnit.MINUTES)
                  .maximumSize(10000)
                  .build();

  private final Cache<UsernameEmail, Boolean> blackListCache = CacheBuilder.newBuilder()
          .expireAfterWrite(Duration.ofHours(1))
          .maximumSize(1000)
          .build();

  record UsernameEmail(String username, String email) {}

  @Data
  @Accessors(chain = true)
  static class Verification {
    private String code;
    private AtomicInteger attempts;
  }
}
```

When a user requests a verification email, a random code is generated and stored in the cache with a default 10-minute validity. If the user does not verify within 10 minutes, the code expires automatically.

Users can request a new verification email within those 10 minutes, which generates a new code with another 10-minute validity. However, rate limiting prevents requesting more than once per minute to prevent abuse.

When a user attempts to verify their email, the system looks up the code in the cache:
- If the code doesn't exist or has expired → "invalid or expired code"
- If the code doesn't match → "invalid code"
- If the code matches → mark the email as verified and clear the code from cache

If verification fails repeatedly and reaches the maximum attempt limit (default: 5), the user is blacklisted for 1 hour before they can try again.

Based on these rules:

- Each code has a 10-minute validity.
- If verification fails more than 5 times within 10 minutes, the user is blacklisted for 1 hour.
- If the user requests a new code within 10 minutes after 5 failed attempts, they get 5 more attempts.

Calculations:

- Without triggering a blacklist: 5 attempts per 10 minutes.
- Per hour: (60/10) × 5 = 30 attempts (requesting a new code every 10 minutes).
- If more than 5 attempts within any 10-minute window → blacklisted for 1 hour.
- Maximum daily attempts without blacklist: 30 × 24 = 720.
- Verification code: random 6 digits (000000–999999 = 10^6 combinations).
- 10^6 / 720 ≈ 1388 days to brute force in the worst case — highly secure.

### API Endpoints

- `POST /apis/v1alpha1/users/-/send-verification-email`: Request a verification email.
- `POST /apis/v1alpha1/users/-/verify-email`: Verify email with the code.

Both endpoints require authentication and have a minimum 1-minute interval between requests to prevent abuse.

The user profile API includes an `emailVerified` field.

### Verification Email Template

Variables available for custom templates:

- **username**: The username requesting verification.
- **code**: The verification code.
- **expirationAtMinutes**: Code expiration time (in minutes).

Default template:

```markdown
Hello guqing:

Use the following one-time password (OTP) to verify your email address:

277436

This code expires in 10 minutes. If you did not request email verification, please ignore this message.

guqing's blog
```

### Security and Error Handling

- All sensitive data must be transmitted securely. When codes are incorrect or expired, only a generic error message should be returned to prevent guessing or brute-forcing.
- Multi-language support for error messages.

## Conclusion

This design addresses the following scenarios:

1. New email verification requests
2. Email address updates
3. Re-sending verification emails
4. Email send failures
5. Verification code expiration
6. Send frequency limits
7. Verification status indication and feedback

The result is a secure, reliable, and user-friendly email verification feature.
