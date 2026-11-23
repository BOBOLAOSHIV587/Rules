// Removes advertising sections from the Spotify Home feed (casita/v1/home/*).
// The response is a protobuf: field 1 wraps the list of sections, each section is a
// field-1 message whose first field is a header ("spotify:section:<id>|<name>") followed
// by one content field whose number identifies the section type. Ad sections are
// identified by name (e.g. "brand-ad", the video HPTO shown under the shortcuts) or by
// their content field (20: brand ad, 21: legacy home ad). The whole section is dropped
// and the wrapper is re-encoded; anything unexpected passes through unchanged.

const AD_NAME = /\|(?:brand-ad|hpto|[a-z0-9-]*-ad)$/;
const AD_FIELDS = new Set([20, 21]);

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

// Reads the header name and the content field number of a section message.
function describeSection(section) {
  let r = readVarint(section, 0);
  if (r.value !== 0x0a) return null; // header must be field 1, length-delimited
  r = readVarint(section, r.pos);
  const headerEnd = r.pos + r.value;
  const header = section.subarray(r.pos, headerEnd);
  let name = "";
  for (let i = 0; i < header.length; i++) name += String.fromCharCode(header[i]);
  let contentField = -1;
  if (headerEnd < section.length) {
    const key = readVarint(section, headerEnd);
    contentField = Math.floor(key.value / 8);
  }
  return { name, contentField };
}

function isAd(info) {
  return info !== null && (AD_NAME.test(info.name) || AD_FIELDS.has(info.contentField));
}

function stripAds(body) {
  // Top level: field 1 (key 0x0a) wrapping the section list.
  let r = readVarint(body, 0);
  if (r.value !== 0x0a) return null;
  r = readVarint(body, r.pos);
  const listStart = r.pos;
  const listEnd = listStart + r.value;
  if (listEnd > body.length) return null;

  const kept = [];
  let removed = 0;
  let pos = listStart;
  while (pos < listEnd) {
    const itemStart = pos;
    const key = readVarint(body, pos);
    if ((key.value & 7) !== 2) return null;
    const len = readVarint(body, key.pos);
    const dataStart = len.pos;
    const itemEnd = dataStart + len.value;
    if (itemEnd > listEnd) return null;
    const item = body.subarray(itemStart, itemEnd);
    const info = key.value === 0x0a ? describeSection(body.subarray(dataStart, itemEnd)) : null;
    if (isAd(info)) {
      removed++;
      console.log(`Spotify Home: removed section ${info.name.slice(info.name.indexOf("|") + 1)}`);
    } else {
      kept.push(item);
    }
    pos = itemEnd;
  }
  if (removed === 0) return null;

  const newListLen = kept.reduce((n, item) => n + item.length, 0);
  const prefix = [0x0a].concat(writeVarint(newListLen));
  const tail = body.subarray(listEnd);
  const out = new Uint8Array(prefix.length + newListLen + tail.length);
  out.set(prefix, 0);
  let off = prefix.length;
  for (const item of kept) {
    out.set(item, off);
    off += item.length;
  }
  out.set(tail, off);
  return out;
}

try {
  const body = $response.body;
  const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  const out = stripAds(bytes);
  if (out) {
    $done({ body: out });
  } else {
    console.log("Spotify Home: no ad section found");
    $done({});
  }
} catch (e) {
  console.log(`Spotify Home: response left unchanged (${e})`);
  $done({});
}
