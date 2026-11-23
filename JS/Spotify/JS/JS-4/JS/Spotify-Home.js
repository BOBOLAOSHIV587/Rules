// Casita HomeResponse: field 1 contains repeated section entries in field 1.
// A section's nested field 1 is its identifier; keep all other fields verbatim.
(() => {
  function readVarint(bytes, offset, end) {
    let value = 0;
    for (let i = 0; i < 5 && offset < end; i++) {
      const byte = bytes[offset++];
      value += (byte & 0x7f) * 2 ** (i * 7);
      if (value > 0xffffffff) throw new Error("varint overflow");
      if (byte < 0x80) return { value, offset };
    }
    throw new Error("invalid varint");
  }

  function fields(bytes) {
    const result = [];
    let offset = 0;
    while (offset < bytes.length) {
      const start = offset;
      const tag = readVarint(bytes, offset, bytes.length);
      const number = Math.floor(tag.value / 8);
      const wire = tag.value % 8;
      if (!number) throw new Error("invalid field");
      offset = tag.offset;
      let dataStart = offset;
      if (wire === 0) {
        let count = 0;
        while (true) {
          if (offset >= bytes.length || count === 10) {
            throw new Error("invalid scalar");
          }
          const byte = bytes[offset++];
          if (++count === 10 && byte > 1) throw new Error("scalar overflow");
          if (byte < 0x80) break;
        }
      } else if (wire === 1 || wire === 5) {
        offset += wire === 1 ? 8 : 4;
      } else if (wire === 2) {
        const length = readVarint(bytes, offset, bytes.length);
        dataStart = length.offset;
        offset = dataStart + length.value;
      } else {
        throw new Error("unsupported wire type");
      }
      if (offset > bytes.length) throw new Error("truncated field");
      result.push({ number, wire, start, tagEnd: tag.offset, dataStart, end: offset });
    }
    return result;
  }

  function concat(parts) {
    const bytes = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.length;
    }
    return bytes;
  }

  function encodeLength(value) {
    const bytes = [];
    do {
      const next = value % 128;
      value = Math.floor(value / 128);
      bytes.push(next | (value ? 0x80 : 0));
    } while (value);
    return new Uint8Array(bytes);
  }

  function isBrandAd(section) {
    for (const identifier of fields(section)) {
      if (identifier.number !== 1 || identifier.wire !== 2) continue;
      const wrapper = section.subarray(identifier.dataStart, identifier.end);
      for (const value of fields(wrapper)) {
        if (value.number !== 1 || value.wire !== 2) continue;
        const id = wrapper.subarray(value.dataStart, value.end);
        if (id.length > 512) continue;
        let text = "";
        for (const byte of id) text += String.fromCharCode(byte);
        if (text.startsWith("spotify:section:") && text.endsWith("|brand-ad")) {
          return true;
        }
      }
    }
    return false;
  }

  let output;
  try {
    if ($response.status !== undefined && Number($response.status) !== 200) {
      throw new Error("non-success response");
    }
    const body = $response.body;
    let bytes;
    if (ArrayBuffer.isView(body)) {
      bytes = new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof ArrayBuffer) {
      bytes = new Uint8Array(body);
    } else if (Array.isArray(body)) {
      bytes = new Uint8Array(body);
    } else {
      throw new Error("unsupported body");
    }

    let removed = 0;
    const parts = fields(bytes).map((field) => {
      const original = bytes.subarray(field.start, field.end);
      if (field.number !== 1 || field.wire !== 2) return original;
      const sections = bytes.subarray(field.dataStart, field.end);
      let changed = false;
      const kept = [];
      for (const section of fields(sections)) {
        if (section.number === 1 && section.wire === 2 &&
            isBrandAd(sections.subarray(section.dataStart, section.end))) {
          removed++;
          changed = true;
        } else {
          kept.push(sections.subarray(section.start, section.end));
        }
      }
      if (!changed) return original;
      const payload = concat(kept);
      return concat([bytes.subarray(field.start, field.tagEnd), encodeLength(payload.length), payload]);
    });
    if (removed) {
      output = concat(parts);
      console.log(`Spotify Home: removed ${removed} brand-ad section(s)`);
    }
  } catch (_) {
    console.log("Spotify Home: unrecognized response, passed through");
  }
  $done(output ? { body: output } : {});
})();
