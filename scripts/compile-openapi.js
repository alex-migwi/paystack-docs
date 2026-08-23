const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const YAML = require('yaml');

const enrichedJsonPath = path.join(__dirname, '../public/paystack-enriched.json');
const yamlPath = path.join(__dirname, '../public/paystack.yaml');
const targetJsonPath = path.join(__dirname, '../public/paystack.json');
const manifestPath = path.join(__dirname, '../public/spec-manifest.json');
const changelogPath = path.join(__dirname, '../public/changelog.json');

let parsed;

if (fs.existsSync(enrichedJsonPath)) {
  console.log(`Loading enriched spec from ${enrichedJsonPath}...`);
  const rawText = fs.readFileSync(enrichedJsonPath, 'utf8');
  parsed = JSON.parse(rawText);
} else if (fs.existsSync(yamlPath)) {
  console.log(`Loading raw YAML spec from ${yamlPath}...`);
  const rawText = fs.readFileSync(yamlPath, 'utf8');
  parsed = YAML.parse(rawText);
} else {
  throw new Error('No paystack-enriched.json or paystack.yaml found in public directory!');
}

console.log(`Parsed OpenAPI version: ${parsed.openapi || parsed.swagger}`);
console.log(`Found ${Object.keys(parsed.paths || {}).length} API path endpoints.`);

// Save compiled JSON to public/paystack.json
fs.writeFileSync(targetJsonPath, JSON.stringify(parsed, null, 2), 'utf8');
console.log(`Successfully compiled spec to ${targetJsonPath}`);

// -------------------------------------------------------------
// Operational Hashing & Changelog Generation Engine
// -------------------------------------------------------------
let previousManifest = {};
if (fs.existsSync(manifestPath)) {
  try {
    previousManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    previousManifest = {};
  }
}

const currentManifest = {};
const changes = {
  timestamp: new Date().toISOString(),
  added: [],
  modified: [],
  unchanged: [],
  removed: [],
};

const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];

for (const [pathUrl, pathItem] of Object.entries(parsed.paths || {})) {
  if (!pathItem || typeof pathItem !== 'object') continue;

  for (const method of httpMethods) {
    const op = pathItem[method];
    if (!op) continue;

    const endpointKey = `${method.toUpperCase()} ${pathUrl}`;
    const opString = JSON.stringify(op);
    const hash = crypto.createHash('sha256').update(opString).digest('hex');

    currentManifest[endpointKey] = {
      path: pathUrl,
      method: method.toUpperCase(),
      hash,
      summary: op.summary || '',
      tag: op.tags?.[0] || 'General',
      updatedAt: new Date().toISOString(),
    };

    const prevHash = previousManifest[endpointKey]?.hash;
    if (!prevHash) {
      changes.added.push({ endpointKey, path: pathUrl, method: method.toUpperCase(), summary: op.summary || '' });
    } else if (prevHash !== hash) {
      changes.modified.push({ endpointKey, path: pathUrl, method: method.toUpperCase(), summary: op.summary || '' });
    } else {
      changes.unchanged.push(endpointKey);
    }
  }
}

// Find removed endpoints
for (const prevKey of Object.keys(previousManifest)) {
  if (!currentManifest[prevKey]) {
    changes.removed.push(prevKey);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(currentManifest, null, 2), 'utf8');
fs.writeFileSync(changelogPath, JSON.stringify(changes, null, 2), 'utf8');

console.log(`Spec Manifest generated: ${Object.keys(currentManifest).length} total operations tracked.`);
console.log(`Changelog: ${changes.added.length} added, ${changes.modified.length} modified, ${changes.unchanged.length} unchanged, ${changes.removed.length} removed.`);
