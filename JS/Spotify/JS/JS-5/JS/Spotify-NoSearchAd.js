// Removes the sponsored block from the Spotify search/browse page (browsita/v*/browse).
// The response is a protobuf whose field 6, when larger than MIN_AD_SIZE bytes, carries
// the sponsored block (smaller field-6 messages are regular content). The field is not
// deleted but renumbered to an unknown field (1000), so the client skips it and the rest
// of the message is kept intact. The message is parsed properly (top level and nested
// messages up to depth 3), the first matching field is renamed and every enclosing
// length is recomputed. Anything unexpected passes through unchanged.

const AD_FIELD = 6;
const MIN_AD_SIZE = 12000;
const UNKNOWN_FIELD = 1000;
const MAX_DEPTH = 3;

function readVarint(buf, pos) {
  let value = 0;
  let shift = 0;
  for (;;) {
    if (pos >= buf.length) throw new Error("truncated varint");
    const byte = buf[pos++];
    value += (byte & 0x7f) * Math.pow(2, shift);
    if ((byte & 0x80) === 0) return { value, pos };
    shift += 7;
  }
}

function writeVarint(value) {
  const out = [];
  while (value >= 0x80) {
    out.push((value % 0x80) | 0x80);
    value = Math.floor(value / 0x80);
  }
  out.push(value);
  return out;
}

function concat(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

// Parses one protobuf message into its fields (raw bytes of each field are kept).
function parseFields(buf) {
  const fields = [];
  let pos = 0;
  while (pos < buf.length) {
    const start = pos;
    const key = readVarint(buf, pos);
    const no = Math.floor(key.value / 8);
    const wire = key.value % 8;
    pos = key.pos;
    let payloadStart = -1;
    let payloadEnd = -1;
    if (wire === 0) pos = readVarint(buf, pos).pos;
    else if (wire === 1) pos += 8;
    else if (wire === 5) pos += 4;
    else if (wire === 2) {
      const len = readVarint(buf, pos);
      payloadStart = len.pos;
      payloadEnd = len.pos + len.value;
      pos = payloadEnd;
    } else throw new Error("unsupported wire type " + wire);
    if (pos > buf.length) throw new Error("truncated field");
    fields.push({ no, wire, raw: buf.subarray(start, pos), payloadStart, payloadEnd });
  }
  return fields;
}

function wrap(no, payload) {
  return concat([Uint8Array.from(writeVarint(no * 8 + 2)), Uint8Array.from(writeVarint(payload.length)), payload]);
}

// Returns the rebuilt message with the first matching field renamed, or null if absent.
function renameField(buf, depth, matches) {
  const fields = parseFields(buf);
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.wire !== 2) continue;
    const payload = buf.subarray(f.payloadStart, f.payloadEnd);
    let replacement = null;
    if (matches(f, payload)) replacement = wrap(UNKNOWN_FIELD, payload);
    else if (depth < MAX_DEPTH) {
      let inner = null;
      try {
        inner = renameField(payload, depth + 1, matches);
      } catch (e) {
        inner = null; // the payload is not a message (string or bytes)
      }
      if (inner) replacement = wrap(f.no, inner);
    }
    if (replacement) {
      const parts = fields.map((g, j) => (j === i ? replacement : g.raw));
      return concat(parts);
    }
  }
  return null;
}

try {
  const body = $response.body;
  const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  const out = renameField(bytes, 0, (f, payload) => f.no === AD_FIELD && payload.length > MIN_AD_SIZE);
  if (out) {
    console.log("Spotify search: sponsored block hidden");
    $done({ body: out });
  } else {
    console.log("Spotify search: no sponsored block found");
    $done({});
  }
} catch (e) {
  console.log(`Spotify search: response left unchanged (${e})`);
  $done({});
}
