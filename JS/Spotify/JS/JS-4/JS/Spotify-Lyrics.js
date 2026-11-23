// Spotify lyrics: one response pipeline, native wire format, independent cache.
(() => {
  const KEY = "UKIX.Spotify.Lyrics.v1";
  const DAY = 86400000;
  const MAX_LINES = 500;
  const now = () => Date.now();
  const args = {};
  for (const part of String(typeof $argument === "string" ? $argument : "").split("&")) {
    const at = part.indexOf("=");
    if (at < 1) continue;
    try { args[part.slice(0, at)] = decodeURIComponent(part.slice(at + 1)).replace(/^"|"$/g, ""); } catch (_) { /* Keep defaults. */ }
  }
  const enabled = args.Lyrics !== "false";
  const translate = args.Translate !== "false";
  const target = /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(args.TargetLanguage || "") ? args.TargetLanguage : "zh-CN";
  const url = String($request.url || "");
  const deadline = now() + (/\/scrollsita\//.test(url) ? 3500 : 15000);

  function bytes(value) {
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (typeof value === "string") return utf8(value);
    throw new Error("unsupported body");
  }
  function utf8(value) {
    const out = [];
    for (const character of String(value)) {
      let c = character.codePointAt(0);
      if (c >= 0xd800 && c <= 0xdfff) c = 0xfffd;
      if (c < 128) out.push(c);
      else if (c < 2048) out.push(192 | c >> 6, 128 | c & 63);
      else if (c < 65536) out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
      else out.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
    }
    return new Uint8Array(out);
  }
  function text(value) {
    if (value.length > 131072) throw new Error("oversized text");
    return decodeURIComponent(Array.from(value, c => "%" + c.toString(16).padStart(2, "0")).join(""));
  }
  function join(parts) {
    const out = new Uint8Array(parts.reduce((n, part) => n + part.length, 0));
    let offset = 0;
    for (const part of parts) { out.set(part, offset); offset += part.length; }
    return out;
  }
  function integer(value) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("invalid integer");
    const out = [];
    do { const b = value % 128; value = Math.floor(value / 128); out.push(b | (value ? 128 : 0)); } while (value);
    return new Uint8Array(out);
  }
  const blob = (n, value) => join([integer(n * 8 + 2), integer(value.length), value]);
  const string = (n, value) => blob(n, utf8(value));
  const scalar = (n, value) => join([integer(n * 8), integer(value)]);
  function int32(n, value) {
    const encoded = integer(value >>> 0);
    if (value >= 0) return join([integer(n * 8), encoded]);
    // Negative int32 values are sign-extended to a ten-byte protobuf varint.
    encoded[4] |= 0xf0;
    return join([integer(n * 8), encoded, new Uint8Array([255, 255, 255, 255, 1])]);
  }
  function fields(input) {
    let offset = 0;
    function read(limit) {
      let value = 0;
      for (let i = 0; i < limit; i++) {
        if (offset >= input.length) throw new Error("truncated protobuf");
        const b = input[offset++];
        if (i === 9 && b > 1) throw new Error("scalar overflow");
        value += (b & 127) * 2 ** (7 * i);
        if (b < 128) return value;
      }
      throw new Error("invalid varint");
    }
    const result = [];
    while (offset < input.length) {
      const start = offset, tag = read(5), number = Math.floor(tag / 8), wire = tag % 8;
      if (!number || tag > 0xffffffff) throw new Error("invalid tag");
      let payload, value;
      if (wire === 0) value = read(10);
      else if (wire === 1 || wire === 5) offset += wire === 1 ? 8 : 4;
      else if (wire === 2) {
        const length = read(5);
        if (length > input.length - offset) throw new Error("invalid length");
        payload = input.subarray(offset, offset + length); offset += length;
      } else throw new Error("unsupported protobuf wire");
      if (offset > input.length) throw new Error("truncated field");
      result.push({ number, wire, value, payload, raw: input.subarray(start, offset) });
    }
    return result;
  }
  const one = (list, n, wire = 2) => list.find(f => f.number === n && f.wire === wire);
  const str = (list, n) => { const f = one(list, n); return f ? text(f.payload) : ""; };
  function mapMessage(input, visit) {
    return join(fields(input).map(f => {
      const value = visit(f);
      return value === undefined ? f.raw : blob(f.number, value);
    }));
  }
  function base62(gid) {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", digits = Array.from(gid);
    let output = "";
    while (digits.some(Boolean)) {
      let carry = 0;
      for (let i = 0; i < digits.length; i++) {
        const n = carry * 256 + digits[i]; digits[i] = Math.floor(n / 62); carry = n % 62;
      }
      output = alphabet[carry] + output;
    }
    return output.padStart(22, "0");
  }
  function cache() {
    try {
      const value = JSON.parse($persistentStore.read(KEY) || "{}");
      return value.version === 1 && value.tracks && typeof value.tracks === "object" ? value : { version: 1, tracks: {}, cooldowns: {} };
    } catch (_) { return { version: 1, tracks: {}, cooldowns: {} }; }
  }
  function save(change) {
    try {
      const value = cache(); change(value);
      const ids = Object.keys(value.tracks).sort((a, b) => (value.tracks[b].updated || 0) - (value.tracks[a].updated || 0));
      let size = 0;
      for (const [i, id] of ids.entries()) {
        size += JSON.stringify(value.tracks[id]).length;
        if (i >= 40 || size > 500000) delete value.tracks[id];
      }
      $persistentStore.write(JSON.stringify(value), KEY);
    } catch (_) { console.log("Spotify lyrics: cache write skipped"); }
  }
  function storeTrack(id, update) {
    save(value => { value.tracks[id] = { ...(value.tracks[id] || {}), ...update, updated: now() }; });
  }
  function available(id) {
    const entry = cache().tracks[id];
    return entry?.expires > now() && entry.result?.lines?.some(line => line.words.trim());
  }
  function header(headers, name) {
    const key = Object.keys(headers || {}).find(k => k.toLowerCase() === name);
    return key ? headers[key] : "";
  }
  function http(address, vendor) {
    return new Promise((resolve, reject) => {
      if (now() >= deadline || (cache().cooldowns?.[vendor] || 0) > now()) return reject(new Error("lookup deferred"));
      const headers = { "User-Agent": "UKIX-Spotify-Lyrics/1.0 (https://github.com/Reukix/ukix)", Accept: "application/json,text/html" };
      if (vendor === "netease") headers.Referer = "https://music.163.com/";
      // Construct fresh headers: never forward Spotify tokens, cookies or device IDs.
      $httpClient.get({ url: address, headers, timeout: Math.max(1, Math.min(4, Math.floor((deadline - now()) / 1000))), "auto-cookie": false }, (error, response, body) => {
        const status = Number(response?.status || response?.statusCode);
        if (status === 429 || status === 503) {
          const retry = String(header(response.headers, "retry-after"));
          const seconds = /^\d+$/.test(retry) ? Number(retry) : Math.max(0, (Date.parse(retry) - now()) / 1000);
          save(value => { value.cooldowns = value.cooldowns || {}; value.cooldowns[vendor] = now() + (Number.isFinite(seconds) ? Math.max(1, seconds) : 60) * 1000 + 500; });
        }
        if (error || !response || status !== 200) return reject(new Error("lookup unavailable"));
        try { resolve(typeof body === "string" ? body : text(bytes(body))); } catch (e) { reject(e); }
      });
    });
  }
  const json = async (address, vendor) => JSON.parse(await http(address, vendor));
  const normalize = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
  function matched(info, title, artists, durationMs) {
    return normalize(info.title) === normalize(title)
      && artists.some(artist => normalize(artist) === normalize(info.artists[0]))
      && (!info.durationMs || (Number.isFinite(durationMs) && Math.abs(info.durationMs - durationMs) <= 3000));
  }
  function cleanLines(lines) {
    if (lines.length > MAX_LINES) throw new Error("too many lines");
    return lines.filter(line => line.words.trim()).sort((a, b) => a.start - b.start).map((line, i, all) => ({
      ...line, end: line.end || (all[i + 1]?.start > line.start ? all[i + 1].start : 0),
    }));
  }
  function lrc(input, plain = false) {
    if (typeof input !== "string" || input.length > 100000) return [];
    const lines = [], offset = Number(/\[offset:([+-]?\d+)\]/i.exec(input)?.[1] || 0);
    for (const row of input.split(/\r?\n/)) {
      const times = [...row.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
      const words = row.replace(/\[[^\]]*\]/g, "").trim();
      if (!words) continue;
      if (times.length) for (const t of times) lines.push({ start: Math.max(0, Number(t[1]) * 60000 + Number(t[2]) * 1000 + Number((t[3] || "").padEnd(3, "0")) + offset), words, syllables: [] });
      else if (plain && !/^\s*\[[a-z]+:/i.test(row)) lines.push({ start: 0, words, syllables: [] });
    }
    return cleanLines(lines);
  }
  function yrc(input) {
    if (typeof input !== "string" || input.length > 100000) return [];
    const lines = [];
    for (const row of input.split(/\r?\n/)) {
      const time = /^\[(\d+),(\d+)\]/.exec(row);
      if (!time) continue;
      const body = row.slice(time[0].length), markers = [...body.matchAll(/\((\d+),(\d+),\d+\)/g)];
      const parts = markers.map((marker, i) => [marker[0], marker[1], marker[2], body.slice(marker.index + marker[0].length, markers[i + 1]?.index ?? body.length)]);
      if (!parts.length) continue;
      lines.push({ start: Number(time[1]), end: Number(time[1]) + Number(time[2]), words: parts.map(p => p[3]).join(""), syllables: parts.filter(p => p[3].length).map(p => ({ startTimeMs: String(p[1]), numChars: p[3].length })) });
    }
    return cleanLines(lines);
  }
  function meaningful(lines) {
    return lines.length && !(lines.length === 1 && /^\s*(?:纯音乐[，,\s]*(?:请欣赏)?|\[?instrumental\]?)\s*$/i.test(lines[0].words));
  }
  async function infoFor(id) {
    const saved = cache().tracks[id]?.info;
    if (saved?.title && saved?.artists?.length) return saved;
    const html = await http("https://open.spotify.com/embed/track/" + id, "spotify-public");
    const match = /<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
    if (!match) return null;
    const entity = JSON.parse(match[1])?.props?.pageProps?.state?.data?.entity;
    if (entity?.id !== id || entity.uri !== "spotify:track:" + id || !entity.name || !entity.artists?.[0]?.name) return null;
    const info = { id, title: entity.name, artists: entity.artists.map(a => a.name).filter(Boolean), album: entity.album?.name || entity.albumName || "", durationMs: Number(entity.duration) || 0 };
    storeTrack(id, { info }); return info;
  }
  async function netease(info) {
    const search = await json("https://music.163.com/api/cloudsearch/pc?type=1&limit=5&offset=0&s=" + encodeURIComponent(info.title + " " + info.artists[0]), "netease");
    if (search.code !== 200) throw new Error("search unavailable");
    const songs = (search.result?.songs || []).filter(song => matched(info, song.name, (song.ar || song.artists || []).map(a => a.name), Number(song.dt || song.duration)));
    for (const song of songs.slice(0, 2)) {
      const result = await json("https://music.163.com/api/song/lyric?id=" + song.id + "&lv=-1&yv=-1&tv=-1", "netease");
      if (result.code !== 200 || result.nolyric || result.uncollected) continue;
      const words = yrc(result.yrc?.lyric), lines = words.length ? words : lrc(result.lrc?.lyric);
      if (!meaningful(lines)) continue;
      const translated = lrc(result.tlyric?.lyric), alternatives = [];
      if (/^zh(?:-|$)/i.test(target) && translated.length) {
        const aligned = lines.map(line => translated.find(t => Math.abs(t.start - line.start) <= 150)?.words || "");
        if (aligned.some(Boolean)) alternatives.push({ language: "zh", lines: aligned });
      }
      return { sync: words.length ? 2 : 1, lines, provider: "NeteaseMusic", providerId: String(song.id), alternatives };
    }
    return null;
  }
  async function lrclib(info) {
    const query = "track_name=" + encodeURIComponent(info.title) + "&artist_name=" + encodeURIComponent(info.artists[0]);
    let record;
    try { record = await json("https://lrclib.net/api/get?" + query + (info.album ? "&album_name=" + encodeURIComponent(info.album) : "") + (info.durationMs ? "&duration=" + Math.round(info.durationMs / 1000) : ""), "lrclib"); } catch (_) {
      const found = await json("https://lrclib.net/api/search?" + query, "lrclib");
      record = (Array.isArray(found) ? found : []).filter(r => !r.instrumental && matched(info, r.trackName, [r.artistName, ...String(r.artistName).split(/\s*[;&,/]\s*/)], Number(r.duration) * 1000)).sort((a, b) => Number(Boolean(b.syncedLyrics)) - Number(Boolean(a.syncedLyrics)))[0];
    }
    if (!record || record.instrumental || !matched(info, record.trackName, [record.artistName, ...String(record.artistName).split(/\s*[;&,/]\s*/)], Number(record.duration) * 1000)) return null;
    const synced = lrc(record.syncedLyrics), lines = synced.length ? synced : lrc(record.plainLyrics, true);
    return meaningful(lines) ? { sync: synced.length ? 1 : 0, lines, provider: "LRCLIB", providerId: String(record.id), alternatives: [] } : null;
  }
  async function external(id) {
    const entry = cache().tracks[id];
    if (entry?.expires > now()) return entry.result || null;
    const info = await infoFor(id);
    if (!info) return null;
    let complete = true;
    for (const provider of [netease, lrclib]) {
      try {
        const result = await provider(info);
        if (result) { storeTrack(id, { result, expires: now() + 7 * DAY }); return result; }
      } catch (_) { complete = false; }
    }
    if (complete) storeTrack(id, { result: null, expires: now() + 15 * 60000 });
    return null;
  }
  const languageKey = lang => /^zh(?:-|$)/i.test(lang) ? "zh" : String(lang).toLowerCase();
  async function translations(id, lines, alternatives) {
    if (!translate || alternatives.some(a => languageKey(a.language) === languageKey(target))) return null;
    const source = lines.map(line => line.words).join("\n"), saved = cache().tracks[id]?.translations?.[target];
    if (saved?.source === source && saved.expires > now()) return saved.lines;
    const groups = []; let group = [], length = 0;
    for (const line of lines) {
      if (line.words.length > 900) return null;
      if (length + line.words.length > 900 && group.length) { groups.push(group); group = []; length = 0; }
      group.push(line.words); length += line.words.length + 1;
    }
    if (group.length) groups.push(group);
    if (groups.length > 5) return null;
    const output = [];
    for (const chunk of groups) {
      const data = await json("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + encodeURIComponent(target) + "&dt=t&q=" + encodeURIComponent(chunk.join("\n")), "google");
      const translated = data?.[0]?.map(row => row?.[0] || "").join("").replace(/\r/g, "").trimEnd().split("\n");
      if (!translated || translated.length !== chunk.length) return null;
      output.push(...translated);
    }
    if (output.every((line, i) => line === lines[i].words)) return null;
    storeTrack(id, { translations: { ...(cache().tracks[id]?.translations || {}), [target]: { source, lines: output, expires: now() + 7 * DAY } } });
    return output;
  }
  function nativeTrack(track, expectedId) {
    const list = fields(track), gid = one(list, 1)?.payload;
    if (gid?.length !== 16) return track;
    const id = base62(gid);
    if (expectedId && id !== expectedId) return track;
    const title = str(list, 2), artists = list.filter(f => f.number === 4 && f.wire === 2).map(f => str(fields(f.payload), 2)).filter(Boolean);
    if (!title || !artists.length) return track;
    const album = one(list, 3), duration = one(list, 7, 0)?.value;
    storeTrack(id, { info: { id, title, artists, album: album ? str(fields(album.payload), 2) : "", durationMs: Number.isSafeInteger(duration) ? Math.floor(duration / 2) : 0 } });
    if (!available(id) || one(list, 18, 0)?.value === 1) return track;
    return join([...list.filter(f => !(f.number === 18 && f.wire === 0)).map(f => f.raw), scalar(18, 1)]);
  }
  function metadata(input) {
    const classic = /\/metadata\/4\/track\/([a-f0-9]{32})(?:[?#]|$)/i.exec(url);
    if (classic) {
      const gid = one(fields(input), 1)?.payload;
      if (gid?.length !== 16 || Array.from(gid, b => b.toString(16).padStart(2, "0")).join("") !== classic[1].toLowerCase()) return input;
      return nativeTrack(input);
    }
    return mapMessage(input, array => {
      if (array.number !== 2 || array.wire !== 2 || one(fields(array.payload), 2, 0)?.value !== 10) return;
      return mapMessage(array.payload, entry => {
        if (entry.number !== 3 || entry.wire !== 2) return;
        const match = /^spotify:track:([A-Za-z0-9]{22})$/.exec(str(fields(entry.payload), 2));
        if (!match) return;
        return mapMessage(entry.payload, any => {
          if (any.number !== 3 || any.wire !== 2) return;
          return mapMessage(any.payload, f => f.number === 2 && f.wire === 2 ? nativeTrack(f.payload, match[1]) : undefined);
        });
      });
    });
  }
  function playerState(input) {
    return mapMessage(input, state => {
      if (state.number !== 3 || state.wire !== 2) return;
      return mapMessage(state.payload, track => {
        if (track.number !== 7 || track.wire !== 2) return;
        const list = fields(track.payload), match = /^spotify:track:([A-Za-z0-9]{22})$/.exec(str(list, 1));
        if (!match || !available(match[1])) return;
        const isFlag = f => f.number === 3 && f.wire === 2 && str(fields(f.payload), 1) === "has_lyrics";
        if (list.some(f => isFlag(f) && str(fields(f.payload), 2) === "true")) return;
        return join([...list.filter(f => !isFlag(f)).map(f => f.raw), blob(3, join([string(1, "has_lyrics"), string(2, "true")]))]);
      });
    });
  }
  async function scroll(input) {
    const top = fields(input), wrapper = top.filter(f => f.number === 1 && f.wire === 2);
    if (wrapper.length !== 1) return input;
    const kept = [], list = fields(wrapper[0].payload); let hasLyrics = false;
    for (const f of list) {
      if (f.number === 1 && f.wire === 2) {
        const section = fields(f.payload);
        if (section.some(s => s.number === 30 && s.wire === 2)) continue;
        if (section.some(s => s.number === 5 && s.wire === 2)) hasLyrics = true;
      }
      kept.push(f.raw);
    }
    const id = /\/scrollsita\/v1\/scroll\/spotify:track:([A-Za-z0-9]{22})(?:[?#]|$)/.exec(url)?.[1];
    if (enabled && id && !hasLyrics) {
      try {
        if (await external(id)) kept.unshift(blob(1, join([blob(5, string(1, "spotify:track:" + id)), blob(23, string(1, "spotify:section:0JQ5DB6s3cssW5Bo6cGq21"))])));
      } catch (_) { console.log("Spotify lyrics: card lookup unavailable"); }
    }
    return join(top.map(f => f === wrapper[0] ? blob(1, join(kept)) : f.raw));
  }
  function readLyrics(input) {
    const top = fields(input), lyric = one(top, 1);
    if (!lyric) return null;
    const list = fields(lyric.payload), lineFields = list.filter(f => f.number === 2 && f.wire === 2);
    if (lineFields.length > MAX_LINES) return null;
    const lines = lineFields.map(f => { const row = fields(f.payload); return { start: one(row, 1, 0)?.value || 0, words: str(row, 2) }; });
    const alternatives = list.filter(f => f.number === 9 && f.wire === 2).map(f => { const row = fields(f.payload); return { language: str(row, 1), lines: row.filter(x => x.number === 2 && x.wire === 2).map(x => text(x.payload)) }; });
    return { top, lyric, list, lines, alternatives };
  }
  const alternative = value => blob(9, join([string(1, value.language), ...value.lines.map(line => string(2, line))]));
  function encodeLyrics(result) {
    return join([
      scalar(1, result.sync),
      ...result.lines.map(line => blob(2, join([scalar(1, line.start), string(2, line.words), ...(line.syllables || []).map(s => blob(3, join([scalar(1, Number(s.startTimeMs)), scalar(2, s.numChars)])))]))),
      string(3, result.provider), string(4, result.providerId), string(5, result.provider),
      scalar(8, Number(result.alternatives.length > 0)), ...result.alternatives.map(alternative),
    ]);
  }
  function response(body, status, format) {
    const headers = { ...($response.headers || {}) };
    for (const key of Object.keys(headers)) if (["content-length", "content-encoding", "transfer-encoding", "content-type", "etag"].includes(key.toLowerCase())) delete headers[key];
    headers["Content-Type"] = format === "json" ? "application/json; charset=utf-8" : "application/x-protobuf";
    headers["Cache-Control"] = "private, no-store";
    return { status, headers, body };
  }
  async function lyrics(input, status, id) {
    const accept = header($request.headers, "accept"), contentType = header($response.headers, "content-type");
    const format = /[?&]format=json(?:&|$)/.test(url) || /application\/json/i.test(accept) || (status === 200 && /application\/json/i.test(contentType)) ? "json" : "proto";
    let document, native;
    if (status === 200) {
      if (format === "json") {
        document = JSON.parse(text(input));
        const lines = document.lyrics?.lines;
        if (Array.isArray(lines) && lines.length <= MAX_LINES && lines.some(line => String(line.words || "").trim())) native = { lines: lines.map(line => ({ start: Number(line.startTimeMs) || 0, words: String(line.words || "") })), alternatives: document.lyrics.alternatives || [] };
      } else native = readLyrics(input);
      if (native && !native.lines.some(line => line.words.trim())) native = null;
    }
    if (native) {
      let translated;
      try { translated = await translations(id, native.lines, native.alternatives); } catch (_) { console.log("Spotify lyrics: translation unavailable"); }
      if (!translated) return {};
      const extra = { language: languageKey(target), lines: translated };
      if (format === "json") {
        document.lyrics.alternatives = [...native.alternatives, extra]; document.lyrics.showTranslation = true;
        return response(utf8(JSON.stringify(document)), 200, format);
      }
      const payload = join([...native.list.filter(f => !(f.number === 8 && f.wire === 0)).map(f => f.raw), scalar(8, 1), alternative(extra)]);
      return response(join(native.top.map(f => f === native.lyric ? blob(1, payload) : f.raw)), 200, format);
    }
    const result = await external(id);
    if (!result) return {};
    // Clone cached data so a request with translation disabled cannot erase it.
    const output = { ...result, alternatives: translate ? [...result.alternatives] : [] };
    if (translate) {
      try { const translated = await translations(id, result.lines, output.alternatives); if (translated) output.alternatives.push({ language: languageKey(target), lines: translated }); }
      catch (_) { console.log("Spotify lyrics: translation unavailable"); }
    }
    if (format === "json") return response(utf8(JSON.stringify({ lyrics: {
      syncType: ["UNSYNCED", "LINE_SYNCED", "SYLLABLE_SYNCED"][output.sync],
      lines: output.lines.map(line => ({ startTimeMs: String(line.start), words: line.words, syllables: line.syllables || [], endTimeMs: String(line.end || 0) })),
      provider: output.provider, providerLyricsId: output.providerId, providerDisplayName: output.provider, alternatives: output.alternatives, showTranslation: output.alternatives.length > 0,
    }, colors: { background: -16777216, text: -1, highlightText: -1 }, hasVocalRemoval: false })), 200, format);
    const colors = join([int32(1, -16777216), int32(2, -1), int32(3, -1)]);
    return response(join([blob(1, encodeLyrics(output)), blob(2, colors), scalar(3, 0)]), 200, format);
  }
  (async () => {
    try {
      if (!/^https:\/\/(?:[A-Za-z0-9-]+-)?spclient(?:\.wg)?\.spotify\.com(?::443)?\//.test(url)) return $done({});
      const status = Number($response.status || $response.statusCode);
      const input = $response.body === undefined ? new Uint8Array() : bytes($response.body);
      const id = /\/color-lyrics\/v2\/track\/([A-Za-z0-9]{22})(?:\/image\/[^/?#]+)?\/?(?:[?#]|$)/.exec(url)?.[1];
      if (enabled && id && (status === 200 || status === 404) && $request.method === "GET") return $done(await lyrics(input, status, id));
      if (status !== 200) return $done({});
      let output;
      if (/\/scrollsita\//.test(url)) output = await scroll(input);
      else if (enabled && /\/(?:extended-metadata\/|metadata\/4\/track\/)/.test(url)) output = metadata(input);
      else if (enabled && /\/connect-state\/v1\/devices\//.test(url)) output = playerState(input);
      const changed = output && (output.length !== input.length || output.some((b, i) => b !== input[i]));
      $done(changed ? response(output, 200, "proto") : {});
    } catch (_) {
      console.log("Spotify lyrics: response kept after lookup or format error");
      $done({});
    }
  })();
})();
