let body = $response.body;

function readVarint(buffer, offset) {
  let result = 0;
  let shift = 0;
  let pos = offset;

  while (true) {
    const byte = buffer[pos];

    // 取低7位
    const value = byte & 0x7F;

    // 拼接
    result |= value << shift;

    pos++;

    // 如果最高位是0 → 结束
    if ((byte & 0x80) === 0) break;

    shift += 7;
  }

  return {
    value: result,      // 解析出的长度
    length: pos - offset // varint占了多少字节
  };
}

function parseField6(buffer) {
  for (let i = 0; i < MAX; i++) {
    if (buffer[i] === 0x32) { // 找到 field 6

      const { value, length } = readVarint(buffer, i + 1);

      console.log("找到 field 6:");
      console.log(`位置: ${i}`);
      console.log(`长度: ${value}`);
      console.log(`varint字节数: ${length}`);

      if(value>12000) {

        buffer[i] = 0x7A;
        console.log("更改tag值以去除广告");
        return {
        offset: i,
        dataLength: value,
        varintLength: length,
        totalLength: 1 + length + value
      };
      }  
    }
  }
  return null;
}

let MAX=666;
parseField6(body);
$done({body});
