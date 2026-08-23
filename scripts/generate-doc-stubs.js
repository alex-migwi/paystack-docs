const fs = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '../public/paystack.json');
const overlaysDir = path.join(__dirname, '../docs/overlays');

if (!fs.existsSync(overlaysDir)) {
  fs.mkdirSync(overlaysDir, { recursive: true });
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_/]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];

let stubsCreated = 0;
let stubsPreserved = 0;

for (const [pathUrl, pathItem] of Object.entries(spec.paths || {})) {
  if (!pathItem || typeof pathItem !== 'object') continue;

  for (const method of httpMethods) {
    const op = pathItem[method];
    if (!op) continue;

    const tag = op.tags?.[0] || 'General';
    const categorySlug = slugify(tag);
    
    let endpointSlug = slugify(op.operationId || pathUrl.replace(/^\//, ''));
    if (!endpointSlug || endpointSlug === categorySlug) {
      endpointSlug = `${method}-${slugify(pathUrl.replace(/^\//, ''))}`;
    }

    const overlayFilename = `${categorySlug}-${endpointSlug}.md`;
    const overlayFilePath = path.join(overlaysDir, overlayFilename);

    if (fs.existsSync(overlayFilePath)) {
      stubsPreserved++;
      continue;
    }

    const isIdempotent = Boolean(op['x-idempotency']);
    const isRetrySafe = Boolean(op['x-retry-safe']);
    const isGet = method === 'get';

    const stubContent = `### Merchandising & Integration Guide

> [!TIP]
> **Best Practice for ${op.summary || pathUrl}**: Add custom merchant notes or business logic recommendations here.

* **Security**: Always perform this operation on your secure backend server using your Secret Key (\`sk_live_...\` or \`sk_test_...\`).
${isIdempotent ? '* **Idempotency**: This operation supports `X-Idempotency-Key` headers to safely prevent duplicate charges on network retries.' : ''}
${isRetrySafe ? '* **Resilience**: This endpoint is marked as retry-safe in the Paystack OpenAPI spec.' : ''}
${isGet ? '* **Caching**: Consider caching responses locally to optimize request limits.' : ''}
`;

    fs.writeFileSync(overlayFilePath, stubContent, 'utf8');
    stubsCreated++;
  }
}

console.log(`Doc Overlay Generator Complete: Created ${stubsCreated} new doc overlay stubs, preserved ${stubsPreserved} existing manual overlays.`);
