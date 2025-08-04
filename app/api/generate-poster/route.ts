
"use strict";

import { type NextRequest, NextResponse } from "next/server"
import { iam } from '@volcengine/openapi';
import { Signer } from '@volcengine/openapi';
import { RequestObj } from "@volcengine/openapi/lib/base/types";
import crypto from 'crypto';
import querystring from 'querystring';
import { post } from "@/lib/api";
import axios from "axios";

const VOLC_ACCESSKEY = "AKLTOGYxYThjYjBmNzQ0NGE0YWE5ZDAwMjcyMWQxZThjOGQ"
const VOLC_SECRETKEY = "WlRneE9HSmpNV0kxWXprM05HTXpNbUZrTVdZeU5XSXpPR1poTXpneE5UYw=="
const HOST = "visual.volcengineapi.com"
const REGION = "cn-beijing"
const ENDPOINT = "https://visual.volcengineapi.com"
const SERVICE = "cv";

export async function POST(request: NextRequest) {
  try {
    const { image, sportType } = await request.json()
    let prompt = `根据这张图片，制作一张Q版3D卡通风格的大头表情包图片，使用里面人物的面貌特征，保留脸部和发型特征，人物的服装更换为更合适${sportType}的搭配，胸前印着“四川观察”的方形徽章。图片右上角写着“${sportType}”的字。人物姿势为${sportType}运动的动作。`;

    // 查询参数
    const queryParams = {
      'Action': 'Seed3LSingleIPSubmitTask',
      'Version': '2024-06-06'
    };
    const formattedQuery = formatQuery(queryParams);

    // 请求体参数
    const bodyParams = {
      req_key: "jimeng_i2i_v30",
      prompt: prompt,
      binary_data_base64: [
        image.substring(23)
      ],
      return_url: true,
      width: 1024,
      height: 1024
    };
    const formattedBody = JSON.stringify(bodyParams);

    const { headers, requestUrl } = signV4Request(
      VOLC_ACCESSKEY!,
      VOLC_SECRETKEY!,
      SERVICE,
      formattedQuery,
      formattedBody
    );

    await fetch(requestUrl, {
      method: 'POST',
      headers: headers,
      body: formattedBody
    }).then(async response => {
      const readableStreamResponse = await response;
      const data = await readableStreamResponse.json();
      console.log(" data : " + JSON.stringify(data))
    }).catch(err => {
      console.log(err)
    })

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






// 辅助函数：生成签名密钥
function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = crypto.createHmac('sha256', key).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('request').digest();
  return kSigning;
}

// 格式化查询参数
function formatQuery(parameters: Record<string, string>): string {
  const sortedKeys = Object.keys(parameters).sort();
  return sortedKeys.map(key => `${key}=${parameters[key]}`).join('&');
}

// 火山引擎V4签名算法
function signV4Request(
  accessKey: string,
  secretKey: string,
  service: string,
  reqQuery: string,
  reqBody: string
): { headers: Record<string, string>; requestUrl: string } {
  const t = new Date();
  const currentDate = t.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const datestamp = currentDate.substring(0, 8);

  const method = 'POST';
  const canonicalUri = '/';
  const canonicalQuerystring = reqQuery;
  const signedHeaders = 'content-type;host;x-content-sha256;x-date';
  const payloadHash = crypto.createHash('sha256').update(reqBody).digest('hex');
  const contentType = 'application/json';

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${HOST}`,
    `x-content-sha256:${payloadHash}`,
    `x-date:${currentDate}`
  ].join('\n') + '\n';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const algorithm = 'HMAC-SHA256';
  const credentialScope = `${datestamp}/${REGION}/${service}/request`;
  const stringToSign = [
    algorithm,
    currentDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, datestamp, REGION, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    'X-Date': currentDate,
    'Authorization': authorizationHeader,
    'X-Content-Sha256': payloadHash,
    'Content-Type': contentType
  };

  const requestUrl = `${ENDPOINT}?${canonicalQuerystring}`;

  return { headers, requestUrl };
}
