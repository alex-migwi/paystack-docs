# Decoupled Webhook Dispatch Guide: `paystack-spec-enriched` $\rightarrow$ `paystack-docs`

This document explains how the **`paystack-spec-enriched`** repository notifies **`paystack-docs`** whenever a new enriched specification (`dist/paystack-enriched.json`) is built and published.

---

## 1. How It Works

```
┌─────────────────────────────────┐
│     paystack-spec-enriched      │
│  (Builds paystack-enriched.json)│
└─────────────────────────────────┘
                │
                ▼ (GitHub Action Step: repository_dispatch)
┌─────────────────────────────────┐
│          paystack-docs          │
│ (.github/workflows/             │
│   sync-enriched-spec.yml)       │
└─────────────────────────────────┘
                │
                ▼
1. Downloads dist/paystack-enriched.json
2. Runs scripts/compile-openapi.js
3. Updates public/paystack.json & public/spec-manifest.json
4. Re-builds 170+ SSG pages & 12-language interactive code tabs
```

---

## 2. Setting Up Automatic Dispatch in `paystack-spec-enriched`

In the `.github/workflows/publish-enriched-spec.yml` workflow of the **`paystack-spec-enriched`** repository, add the following step after pushing changes to `main`:

```yaml
- name: Dispatch Event to paystack-docs
  run: |
    curl -X POST \
      -H "Accept: application/vnd.github.v3+json" \
      -H "Authorization: token ${{ secrets.DOCS_SYNC_PAT }}" \
      https://api.github.com/repos/Alex-Muturi/paystack-docs/dispatches \
      -d '{"event_type": "enriched_spec_updated"}'
```

### Requirements:
1. Create a GitHub Personal Access Token (PAT) with `repo` scope.
2. Save it as a secret named `DOCS_SYNC_PAT` in the `paystack-spec-enriched` repository settings.

---

## 3. Manual Triggers for Refreshing Documentation

### Option A: GitHub Actions UI
1. Navigate to the **Actions** tab in the `paystack-docs` GitHub repository.
2. Select **Sync Enriched Paystack Spec**.
3. Click **Run workflow** (optional: pass a custom spec URL).

### Option B: Local Developer CLI
Run the following npm command inside `paystack-docs`:
```bash
npm run sync-spec
```
This fetches the latest `paystack-enriched.json`, compiles `public/paystack.json`, and updates the operational manifest!
