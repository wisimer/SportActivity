
"use strict";

import { type NextRequest, NextResponse } from "next/server"
import { iam } from '@volcengine/openapi';
import { Signer } from '@volcengine/openapi';
import { RequestObj } from "@volcengine/openapi/lib/base/types";
import crypto from 'crypto';
import querystring from 'querystring';
import { post } from "@/lib/api";

const VOLC_ACCESSKEY = "AKLTOGYxYThjYjBmNzQ0NGE0YWE5ZDAwMjcyMWQxZThjOGQ"
const VOLC_SECRETKEY = "WlRneE9HSmpNV0kxWXprM05HTXpNbUZrTVdZeU5XSXpPR1poTXpneE5UYw=="

export async function POST(request: NextRequest) {
  try {

    const xDate = getDateTimeNow();

    // step 1 签名
    const signParams = {
      headers: {
        // x-date header 是必传的
        ["X-Date"]: xDate,
      },
      method: 'POST',
      query: {
        req_key: "jimeng_i2i_v30",
        Version: '2022-08-31',
        Action: 'CVSync2AsyncSubmitTask',
      },
      accessKeyId: VOLC_ACCESSKEY,
      secretAccessKey: VOLC_SECRETKEY,
      serviceName: 'cv',
      region: 'cn-north-1',
    };
    // 正规化 query object， 防止串化后出现 query 值为 undefined 情况
    for (const [key, val] of Object.entries(signParams.query)) {
      if (val === undefined || val === null) {
        signParams.query[key] = '';
      }
    }

    console.log("signParams : " + JSON.stringify(signParams, null, 2));
    const authorization = sign(signParams);
    // authorization 的格式
    // HMAC-SHA256 Credential=AKLTMjI2ODVlYzI3ZGY1NGU4ZjhjYWRjMTlmNTM5OTZkYzE/20201230/cn-north-1/iam/request, SignedHeaders=content-type;host;x-content-sha256;x-date, Signature=28eeabbbd726b87002e0fe58ad8c1c768e619b06e2646f35b6ad7ed029a6d8a7
    console.log("authorization : " + authorization);


    const { image, sportType } = await request.json()

    let prompt = `根据这张图片，制作一张Q版3D卡通风格的大头表情包图片，使用里面人物的面貌特征，保留脸部和发型特征，人物的服装更换为更合适${sportType}的搭配，胸前印着“四川观察”的方形徽章。图片右上角写着“${sportType}”的字。人物姿势为${sportType}运动的动作。`;

    const imgRsp = await fetch(`https://visual.volcengineapi.com/?${querystring.stringify(signParams.query)}`, {
      body: {
        "req_key": "jimeng_i2i_v30",
        "binary_data_base64": image,
        "prompt": prompt
      },
      headers: {
        ...signParams.headers,
        'Authorization': authorization,
      },
      method: signParams.method,
    });

    console.log("imgRsp : " + JSON.stringify(imgRsp))

    // 这里结果只返回了任务id，需要后端自己去查询任务结果。
    // {"code":10000,"data":{"task_id":"7392616336519610409"},"message":"Success","request_id":"20240720103939AF0029465CF6A74E51EC","status":10000,"time_elapsed":"104.852309ms"}

    // 根据运动类型返回不同的模拟海报
    const mockPosters = {
      aviation: "/placeholder.svg?height=600&width=400&text=航空运动海报",
      football: "/placeholder.svg?height=600&width=400&text=橄榄球海报",
      archery: "/placeholder.svg?height=600&width=400&text=射箭海报",
    }

    const generatedImageUrl = mockPosters[sportType as keyof typeof mockPosters] || mockPosters.aviation

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      message: "海报生成成功",
    })
  } catch (error) {
    console.error("生成海报失败:", error)
    return NextResponse.json({ success: false, message: "生成失败，请重试" }, { status: 500 })
  }
}


/**
 * 不参与加签过程的 header key
 */
const HEADER_KEYS_TO_IGNORE = new Set([
  "authorization",
  "content-type",
  "content-length",
  "user-agent",
  "presigned-expires",
  "expect",
]);

// do request example
async function doRequestSignExample(xDate: string) {
  const signParams = {
    headers: {
      // x-date header 是必传的
      ["X-Date"]: xDate,
    },
    method: 'POST',
    query: {
      req_key: "jimeng_i2i_v30",
      Version: '2022-08-31',
      Action: 'CVSync2AsyncSubmitTask',
    },
    accessKeyId: VOLC_ACCESSKEY,
    secretAccessKey: VOLC_SECRETKEY,
    serviceName: 'cv',
    region: 'cn-north-1',
  };
  // 正规化 query object， 防止串化后出现 query 值为 undefined 情况
  for (const [key, val] of Object.entries(signParams.query)) {
    if (val === undefined || val === null) {
      signParams.query[key] = '';
    }
  }

  console.log("signParams : " + JSON.stringify(signParams, null, 2));
  const authorization = sign(signParams);
  // authorization 的格式
  // HMAC-SHA256 Credential=AKLTMjI2ODVlYzI3ZGY1NGU4ZjhjYWRjMTlmNTM5OTZkYzE/20201230/cn-north-1/iam/request, SignedHeaders=content-type;host;x-content-sha256;x-date, Signature=28eeabbbd726b87002e0fe58ad8c1c768e619b06e2646f35b6ad7ed029a6d8a7
  console.log("authorization : " + authorization);

  const res = await fetch(`https://iam.volcengineapi.com/?${querystring.stringify(signParams.query)}`, {
    headers: {
      ...signParams.headers,
      'Authorization': authorization,
    },
    method: signParams.method,
  });
  const responseText = await res.text();
  console.log("responseText : " + responseText);
  return responseText
}

function sign(params: any) {
  const {
    headers = {},
    query = { "req_key": "jimeng_i2i_v30" },
    region = 'cn-north-1',
    serviceName = 'cv',
    method = 'POST',
    pathName = '/',
    accessKeyId = VOLC_ACCESSKEY,
    secretAccessKey = VOLC_SECRETKEY,
    needSignHeaderKeys = [],
    bodySha,
  } = params;
  const datetime = headers["X-Date"];
  const date = datetime.substring(0, 8); // YYYYMMDD
  // 创建正规化请求
  const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, needSignHeaderKeys);
  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || '',
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha || hash(''),
  ].join('\n');
  const credentialScope = [date, region, serviceName, "request"].join('/');
  // 创建签名字符串
  const stringToSign = ["HMAC-SHA256", datetime, credentialScope, hash(canonicalRequest)].join('\n');
  // 计算签名
  console.log("secretAccessKey : " + secretAccessKey)
  const kDate = hmac(secretAccessKey, date);
  console.log("kDate : " + kDate)
  const kRegion = hmac(kDate, region);
  console.log("kRegion : " + kRegion)
  const kService = hmac(kRegion, serviceName);
  console.log("kService : " + kService)
  const kSigning = hmac(kService, "request");
  console.log("kSigning : " + kSigning)
  const signature = hmac(kSigning, stringToSign).toString('hex');

  return [
    "HMAC-SHA256",
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`,
  ].join(' ');
}

function hmac(secret: Buffer | string, s: string) {
  return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

function hash(s: string) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function queryParamsToString(params: any) {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const val = params[key];
      if (typeof val === 'undefined' || val === null) {
        return undefined;
      }
      const escapedKey = uriEscape(key);
      if (!escapedKey) {
        return undefined;
      }
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
      }
      return `${escapedKey}=${uriEscape(val)}`;
    })
    .filter((v) => v)
    .join('&');
}

function getSignHeaders(originHeaders: any, needSignHeaders: any) {
  function trimHeaderValue(header: any) {
    return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
  }

  let h = Object.keys(originHeaders);
  // 根据 needSignHeaders 过滤
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
    h = h.filter((k) => needSignSet.has(k.toLowerCase()));
  }
  // 根据 ignore headers 过滤
  h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
  const signedHeaderKeys = h
    .slice()
    .map((k) => k.toLowerCase())
    .sort()
    .join(';');
  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join('\n');
  return [signedHeaderKeys, canonicalHeaders];
}

function uriEscape(str: string) {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
      .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch (e) {
    return '';
  }
}

function getDateTimeNow() {
  const now = new Date();
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

// 获取 body sha256
// function getBodySha(body) {
//   const hash = crypto.createHash('sha256');
//   if (typeof body === 'string') {
//     hash.update(body);
//   } else if (body instanceof url.URLSearchParams) {
//     hash.update(body.toString());
//   } else if (util.isBuffer(body)) {
//     hash.update(body);
//   }
//   return hash.digest('hex');
// }