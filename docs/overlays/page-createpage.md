### Merchandising & Integration Guide

> [!TIP]
> **Best Practice for Create Page**: Add custom merchant notes or business logic recommendations here.

* **Security**: Always perform this operation on your secure backend server using your Secret Key (`sk_live_...` or `sk_test_...`).
* **Idempotency**: This operation supports `X-Idempotency-Key` headers to safely prevent duplicate charges on network retries.
* **Resilience**: This endpoint is marked as retry-safe in the Paystack OpenAPI spec.

