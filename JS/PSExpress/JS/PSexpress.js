/*************************************

项目名称：Photoshop Express-图片编辑&修图 解锁Premium
下载地址：https://t.cn/A6ou0oGd
版本支持：23.49.1
更新日期：2023-12-15
脚本作者：chxm1023
电报频道：https://t.me/chxm1023
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https:\/\/lcs-mobile-cops\.adobe\.io\/(mobile_profile|mobiles\/access_profile) url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/Ps.js

[mitm]
hostname = lcs-mobile-cops.adobe.io

*************************************/


var chxm1023 = JSON.parse($response.body);
const jb = /mobile_profile/;
const xb = /mobiles\/access_profile/;

if(jb.test($request.url)){
    chxm1023 = {"mobileProfileSpecVersion":"1.0","mobileProfile":{"id":"68f8320b-03f4-4f22-98d3-456ff55d9cc6","previousProfileId":"0ad86170-a2e4-42f6-8f9f-f37f1db2806f","serverId":"lcs-mobile-cops","profileStatus":"PROFILE_AVAILABLE","appLicenseMode":"FREEMIUM","legacyProfile":"{}","relationshipProfile":"[]","userProfile":"{\"userId\":\"845F6381634D8F160A495FC7@AdobeID\",\"firstName\":\"%E8%81%AA\",\"lastName\":\"%E6%98%8E\",\"email\":\"6bb4ptwzsb@privaterelay.appleid.com\",\"countryCode\":\"CN\",\"displayName\":\"%E6%98%8E%20%E8%81%AA\",\"accountType\":\"type1\",\"authId\":\"845F6381634D8F160A495FC7@AdobeID\"}","additionalLegacyProfiles":"{}","appProfile":"{}","controlProfile":{"cacheRefreshControl":{"appRefreshInterval":86400000}}},"workflow":null}
}

if(xb.test($request.url)){
    chxm1023.asnp.payload = "eyJpZCI6IjYxNmU3YjgwLWI3MWEtNGNiMi05MDEwLTFkOTQzNTQ3YTE3NiIsInNlcnZlcklkIjoibGNzIiwicmVzcG9uc2VUeXBlIjoiSU5JVElBTCIsInByb2ZpbGVTdGF0dXMiOiJQUk9GSUxFX0FWQUlMQUJMRSIsInByb2ZpbGVTdGF0dXNSZWFzb24iOjEwMDAsInByb2ZpbGVTdGF0dXNSZWFzb25UZXh0IjoiUHJvZmlsZSBBdmFpbGFibGUgZHVlIHRvIGFuIGFjcXVpcmVkIHBsYW4gcHJvdmlzaW9uZWQgYW5kIEFDVElWRSIsImFwcExpY2Vuc2VNb2RlIjoiRlJFRU1JVU0iLCJhcHBQcm9maWxlIjp7ImFwcElkIjoiUFNYSU9TMSIsImFjY2Vzc2libGVJdGVtcyI6W3sic3RhdHVzIjoiQUNUSVZFIiwic291cmNlIjp7Im93bmVyX2lkIjoiRTQyNjM3NEQ2MTJCMDdDQjBBNDk1RUJEQEFkb2JlSUQiLCJpZCI6IjQyQjlEQUYzRkM5MEExNTI3NzNBIiwidHlwZSI6IkxJQ0VOU0UiLCJzdGF0dXNfcmVhc29uIjoiTk9STUFMIiwiY2FuX2FjY2Vzc191bnRpbCI6MTcyNjk4ODM5OTAwMH0sImZ1bGZpbGxhYmxlX2l0ZW1zIjp7ImNjX3N0b3JhZ2UiOnsiZW5hYmxlZCI6dHJ1ZSwiZmVhdHVyZV9zZXRzIjp7IkNTX0xWTF8yIjp7ImlkIjoiQ1NfTFZMXzIiLCJsYWJlbCI6IkNTIExWTCAyIiwiZW5hYmxlZCI6dHJ1ZX0sIlZSVF8zMCI6eyJpZCI6IlZSVF8zMCIsImxhYmVsIjoiVlJUIDMwIiwiZW5hYmxlZCI6dHJ1ZX19LCJjaGFyZ2luZ19tb2RlbCI6eyJjYXAiOjEwMCwidW5pdCI6IkdCIiwibW9kZWwiOiJSRUNVUlJJTkciLCJvdmVyYWdlIjoiTkEiLCJyb2xsb3ZlciI6MH19LCJwaG90b3Nob3BfZXhwcmVzcyI6eyJlbmFibGVkIjp0cnVlLCJjaGFyZ2luZ19tb2RlbCI6eyJtb2RlbCI6IlJFQ1VSUklORyIsIm92ZXJhZ2UiOiJOQSIsInJvbGxvdmVyIjowfX0sInBob3Rvc2hvcF9leHByZXNzX2ZlYXR1cmVfYWNjZXNzIjp7ImVuYWJsZWQiOnRydWUsImNoYXJnaW5nX21vZGVsIjp7Im1vZGVsIjoiUkVDVVJSSU5HIiwib3ZlcmFnZSI6Ik5BIiwicm9sbG92ZXIiOjB9fSwiY29yZV9zZXJ2aWNlc19jYyI6eyJlbmFibGVkIjp0cnVlLCJmZWF0dXJlX3NldHMiOnsiQ1NfTFZMXzIiOnsiaWQiOiJDU19MVkxfMiIsImxhYmVsIjoiQ1MgTFZMIDIiLCJlbmFibGVkIjp0cnVlfX0sImNoYXJnaW5nX21vZGVsIjp7Im1vZGVsIjoiUkVDVVJSSU5HIiwib3ZlcmFnZSI6Ik5BIiwicm9sbG92ZXIiOjB9fX19XSwic2Vjb25kYXJ5QXBwUHJvZmlsZXMiOnt9fSwidXNlclByb2ZpbGUiOnsidXNlcklkIjoiRTQyNjM3NEQ2MTJCMDdDQjBBNDk1RUJEQEFkb2JlSUQiLCJmaXJzdE5hbWUiOiJhbGFpbiIsImxhc3ROYW1lIjoieWUiLCJlbWFpbCI6IjM5NTA0ODAxOEBxcS5jb20iLCJjb3VudHJ5Q29kZSI6IkNOIiwiYWNjb3VudFR5cGUiOiJ0eXBlMSIsImRpc3BsYXlOYW1lIjoieWUlMjBhbGFpbiIsImF1dGhJZCI6IkU0MjYzNzRENjEyQjA3Q0IwQTQ5NUVCREBBZG9iZUlEIn0sImNvbnRyb2xQcm9maWxlIjp7Im5nbEFwcElkIjoiUFNYSU9TMSIsInJlcXVlc3Rlck5nbEFwcElkIjoiUFNYSU9TMSIsImRldmljZUlkIjoiRjhGNDZFNjItOUY0MC00OTk4LTkzQzEtMjJBODU4RTZCQkQxIiwiZGV2aWNlRGF0ZSI6IjIwMjMtMTItMTRUMjM6NTg6NDYuMDc2KzA4MDAiLCJuZ2xMaWJSdW50aW1lTW9kZSI6Ik5BTUVEX1VTRVJfT05MSU5FIiwiY3JlYXRpb25UaW1lc3RhbXAiOjE3MDI1Njk1MjYyNDUsImNhY2hlTGlmZXRpbWUiOjM5OTcwODcyNzU1LCJ2YWxpZFVwdG9UaW1lc3RhbXAiOjE3MjY5ODgzOTkwMDAsImNhY2hlUmVmcmVzaENvbnRyb2wiOnsiYXBwUmVmcmVzaEludGVydmFsIjo4NjQwMDAwMCwibmdsTGliUmVmcmVzaEludGVydmFsIjo4NjQwMDAwMH0sImRldmljZVRva2VuSGFzaCI6IjU3ODUzMzliOGNlNWRiODJhNGU5NWZlYmY4MmM2ZDU0NjkzM2NmYTIyZWIwYTU0NWVhOWY0NGI1YTZjNjA3MmIxZTkzZTAyYWZhYjM1ZDhiMzdmNzk3MjIyYmY1YTA4YTJkZWNjM2U2YTEyYmQ3NjFkYzJiM2MwOWQ0ZDkzNmY0IiwiZGV2aWNlVG9rZW5JZCI6IjE3MDI1Njg4MTYwMzBfZTk5ZWY0ZTAtOGQ1OS00ZjU2LTk1YmEtYjkwMzU3ZThmN2FjX3VlMSIsIm9zVXNlcklkIjoiSU9TIiwiY3JlYXRlZEZvclZkaSI6ZmFsc2UsImNhY2hlRXhwaXJ5V2FybmluZ0NvbnRyb2wiOnsid2FybmluZ1N0YXJ0VGltZXN0YW1wIjoxNzQxOTM1NTk5MDAwLCJ3YXJuaW5nSW50ZXJ2YWwiOjB9LCJhcHBVc2FnZVRyYWNraW5nQ29udHJvbCI6eyJlbmFibGVkVHJhY2tpbmciOnRydWUsInByb3RlY3RUcmFja2VkRGF0YSI6ZmFsc2UsImV2ZW50c1RvVHJhY2siOlsiQVBQX0xBVU5DSF9DT1VOVCIsIkFQUF9SVU5OSU5HX1RJTUUiXX0sImxvZ0NvbnRyb2wiOnsibGV2ZWwiOiJJTkZPIiwibWluRmlsZVVwbG9hZFNpemUiOjAsIm1heEZpbGVVcGxvYWRTaXplIjoxMDAwLCJ1cGxvYWRJbnRlcnZhbCI6ODY0MDAwMDAsInVwbG9hZE9uU2Vzc2lvblN0YXJ0Ijp0cnVlLCJ1cGxvYWRPbkVycm9yIjp0cnVlfSwib3ZlcnJpZGVTdGF0dXNGb3JMb2NhbFNpZ25vdXQiOiJQUk9GSUxFX0RFTklFRCIsImVUYWciOiJEU3M0Q2dUbWpkYVBjbVRfamtjOHlDYi01REdpMThwOFl0OXNhQWNEN29rTE51bGZlZjFzY3FlaGdGQmRjTE5OIn0sImZybFByb2ZpbGUiOiJ7fSIsImxlZ2FjeVByb2ZpbGUiOiJ7XCJsaWNlbnNlSWRcIjpcIjQyQjlEQUYzRkM5MEExNTI3NzNBXCIsXCJsaWNlbnNlVHlwZVwiOjMsXCJsaWNlbnNlVmVyc2lvblwiOlwiMS4wXCIsXCJlZmZlY3RpdmVFbmRUaW1lc3RhbXBcIjoxNzI2OTg4Mzk5MDAwLFwiZ3JhY2VUaW1lXCI6MCxcImxpY2Vuc2VkRmVhdHVyZXNcIjpbXSxcImVuaWdtYURhdGFcIjp7XCJwcm9kdWN0SWRcIjoyMDQsXCJzZXJpYWxLZXlcIjpcIjk5NDMwNDE3MDAyMjg1Njc3MjMwMDI5NlwiLFwiY2xlYXJTZXJpYWxLZXlcIjpcIjEyMDQ0OTM4NzA0NTk1NzkxMDU3XCIsXCJsb2NhbGVcIjpcIkFMTFwiLFwiYXNzb2NpYXRlZExvY2FsZXNcIjpcIkFMTFwiLFwicGxhdGZvcm1cIjowLFwiaXNrXCI6MjA0NDAxNyxcImN1c3RvbWVySWRcIjowLFwiZGVsaXZlcnlNZXRob2RcIjozLFwicGNcIjp0cnVlLFwicmJcIjpmYWxzZX19IiwiYWRkaXRpb25hbExlZ2FjeVByb2ZpbGVzIjoie30ifQ";
    chxm1023.asnp."asnpSpecVersion = "2.0";
}

$done({body : JSON.stringify(chxm1023)});