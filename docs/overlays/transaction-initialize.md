### Merchandising & Best Practice Notes

> [!TIP]
> **Transaction Currency Rules**: Ensure that the `amount` is supplied in the lowest currency unit (e.g., Kobo for NGN, Pesewas for GHS, Cents for ZAR/USD). For example, `₦200.00` must be submitted as `20000`.

* Always pass a unique `reference` per transaction to prevent duplicate charge errors.
* When initializing recurring payments, specify the `plan` code to attach the subscriber automatically.
