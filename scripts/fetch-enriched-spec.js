const fs = require('fs');
const path = require('path');
const https = require('https');

const targetJsonPath = path.join(__dirname, '../public/paystack-enriched.json');
const specUrl = process.env.ENRICHED_SPEC_URL || 'https://raw.githubusercontent.com/Alex-Muturi/paystack-spec-enriched/main/dist/paystack-enriched.json';

function downloadSpec(url) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading enriched spec from remote URL: ${url}...`);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  try {
    const data = await downloadSpec(specUrl);
    // Validate JSON
    JSON.parse(data);
    fs.writeFileSync(targetJsonPath, data, 'utf8');
    console.log(`Successfully updated local spec copy -> ${targetJsonPath}`);
  } catch (err) {
    console.warn(`Remote spec download unavailable (${err.message}). Using existing repo copy at ${targetJsonPath}.`);
  }
}

run();
