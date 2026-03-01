/**
 * tools/sitrep.js
 * ───────────────
 * Generates a compact SITREP JSON string suitable for acoustic-modem
 * transmission (~1 KB target for a single contact).
 *
 * Library usage:
 *   const { makeSitrep } = require('./sitrep');
 *   const json = makeSitrep({ id: 'C01', type: 'sub', lat: 1.23, lon: 4.56,
 *                              depth_m: 50, bearing_deg: 270,
 *                              threat: 'HIGH', confidence: 0.91 });
 *
 * CLI usage:
 *   node tools/sitrep.js contact.json
 *   node tools/sitrep.js '{"id":"C01","type":"sub",...}'
 */

'use strict';

/**
 * Build a compact SITREP object for a single contact.
 *
 * @param {Object} contact
 * @param {string}  contact.id           - Contact identifier (e.g. "C01")
 * @param {string}  [contact.type]       - Contact type (e.g. "sub", "diver", "vessel")
 * @param {number}  [contact.lat]        - Latitude  (decimal degrees, WGS-84)
 * @param {number}  [contact.lon]        - Longitude (decimal degrees, WGS-84)
 * @param {number}  [contact.depth_m]    - Depth in metres (positive = below surface)
 * @param {number}  [contact.bearing_deg]- Bearing in degrees (0–360)
 * @param {string}  [contact.threat]     - Threat level: LOW | MEDIUM | HIGH | CRITICAL
 * @param {number}  [contact.confidence] - Detection confidence 0–1
 * @param {string}  [contact.timestamp]  - ISO-8601 UTC timestamp; defaults to now
 * @returns {string} Compact JSON string
 */
function makeSitrep(contact) {
  if (!contact || typeof contact !== 'object') {
    throw new TypeError('makeSitrep: contact must be a non-null object');
  }

  const sitrep = {
    id:    contact.id   || 'UNKN',
    t:     contact.timestamp || new Date().toISOString(),
    typ:   contact.type || null,
    pos: {
      lat: contact.lat   !== undefined ? +contact.lat.toFixed(6)   : null,
      lon: contact.lon   !== undefined ? +contact.lon.toFixed(6)   : null,
    },
    d_m:   contact.depth_m     !== undefined ? +Number(contact.depth_m).toFixed(1)     : null,
    b_deg: contact.bearing_deg !== undefined ? +Number(contact.bearing_deg).toFixed(1) : null,
    th:    contact.threat      || 'LOW',
    conf:  contact.confidence  !== undefined ? +Number(contact.confidence).toFixed(3)  : null,
  };

  // Drop null values to keep payload small
  Object.keys(sitrep).forEach(k => {
    if (sitrep[k] === null) delete sitrep[k];
  });
  if (sitrep.pos && sitrep.pos.lat === null && sitrep.pos.lon === null) {
    delete sitrep.pos;
  } else if (sitrep.pos) {
    if (sitrep.pos.lat === null) delete sitrep.pos.lat;
    if (sitrep.pos.lon === null) delete sitrep.pos.lon;
  }

  return JSON.stringify(sitrep);
}

module.exports = { makeSitrep };

// ── CLI ───────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const fs   = require('fs');
  const path = require('path');
  const arg  = process.argv[2];

  if (!arg) {
    console.error('Usage: node sitrep.js <contact.json | JSON-string>');
    process.exit(1);
  }

  let contact;
  // Try as a file path first, then as an inline JSON string
  if (fs.existsSync(arg)) {
    contact = JSON.parse(fs.readFileSync(arg, 'utf8'));
  } else {
    try {
      contact = JSON.parse(arg);
    } catch (err) {
      console.error('Error: argument is neither a valid file path nor valid JSON:', err.message);
      process.exit(1);
    }
  }

  const sitrep = makeSitrep(contact);
  console.log(sitrep);
  const bytes = Buffer.byteLength(sitrep, 'utf8');
  console.error(`[sitrep] ${bytes} bytes`);   // size to stderr so stdout stays clean JSON
}
