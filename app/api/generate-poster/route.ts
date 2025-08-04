
"use strict";

import { type NextRequest, NextResponse } from "next/server"
import { iam } from '@volcengine/openapi';
import { Signer } from '@volcengine/openapi';
import { RequestObj } from "@volcengine/openapi/lib/base/types";
import crypto from 'crypto';
import querystring from 'querystring';
import { post } from "@/lib/api";
import axios from "axios";
import { formatQuery, signV4Request } from '@/app/api/jimeng';

const VOLC_ACCESSKEY = process.env.VOLC_ACCESSKEY
const VOLC_SECRETKEY = process.env.VOLC_SECRETKEY
const SERVICE = "cv";

export async function POST(request: NextRequest) {
  try {
    const { image, sportType } = await request.json()
    let prompt = `根据这张图片，制作一张Q版3D卡通风格的大头表情包图片，使用里面人物的面貌特征，保留脸部和发型特征，人物的服装更换为更合适${sportType}的搭配。图片右上角写着“${sportType}”的字。人物姿势为${sportType}运动的动作。添加符合项目的环境元素（如泳池波浪线/田径跑道），并且只有一个人物角色，不要出现其他人物角色。`;
    console.log(" prompt : " + prompt)
    // 这里的坑，动态拼接总是提示 Text Risk Not Pass。把四川观察去掉就可以了。
    //  "根据这张图片，制作一张Q版3D卡通风格的大头表情包图片，使用里面人物的面貌特征，保留脸部和发型特征，人物的服装更换为更合适皮划艇的搭配，胸前印着“四川观察”的方形会长。图片右上角写着“皮划艇”三个字。人物姿势为皮划艇运动的动作。"  


    // 查询参数
    const queryParams = {
      'Action': 'CVSync2AsyncSubmitTask',
      'Version': '2022-08-31'
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

    // const response = fetch(requestUrl, {
    //   method: 'POST',
    //   headers: headers,
    //   body: formattedBody
    // });
    // if (response == null) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "网络异常，请稍后再试",
    //   })
    // }

    // const readableStreamResponse = await response;
    // const data = await readableStreamResponse.json();
    // console.log(" data : " + JSON.stringify(data))

    // if (data == null || data == undefined || data.code !== 10000) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "图片生成失败，请稍后再试",
    //   })
    // }

    // 这里结果只返回了任务id，需要后端自己去查询任务结果。
    // {"ResponseMetadata":{"Action":"Seed3LSingleIPSubmitTask","Region":"cn-beijing","RequestId":"202508041824546C706D98EEFEF37CE4C7","Service":"cv","Version":"2024-06-06"},"Result":{"code":10000,"data":{"task_id":"9095027694106930461"},"message":"Success","request_id":"202508041824546C706D98EEFEF37CE4C7","status":10000,"time_elapsed":"70.333439ms"}}

    ""
    const testData = {"task_id":"9095027694106930461"}
    return NextResponse.json({
      success: true,
      data: testData, //data["data"],
      message: "生成成功",
    })
  } catch (error) {
    console.error("生成失败:", error)
    return NextResponse.json({ success: false, message: "生成失败，请重试" }, { status: 500 })
  }
}



