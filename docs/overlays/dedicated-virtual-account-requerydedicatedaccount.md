### Merchandising & Integration Guide

> [!TIP]
> **Best Practice for Requery Dedicated Account**: Add custom merchant notes or business logic recommendations here.

* **Security**: Always perform this operation on your secure backend server using your Secret Key (`sk_live_...` or `sk_test_...`).

* **Resilience**: This endpoint is marked as retry-safe in the Paystack OpenAPI spec.
* **Caching**: Consider caching responses locally to optimize request limits.
