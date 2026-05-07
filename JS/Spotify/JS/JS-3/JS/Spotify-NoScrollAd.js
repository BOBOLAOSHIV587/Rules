// 获取二进制响应体
let body = $response.body;

let MAX=666;
let flag=0;
console.log(`ScrollNoAd`);
for (let i = 0; i < MAX; i++) {
    if (body[i] === 0xF2 && body[i + 1] === 0x01) {

        body[i] = 0xF7;
        body[i + 1] = 0x07;
        console.log(`成功在偏移量 ${i} 处更改tag值`);
        flag=1;
        $done({ body });
        return;
    }
}

if(!flag) console.log(`未检测到广告`);
$done({});



//$done({ body: body.buffer });
