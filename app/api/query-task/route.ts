import { type NextRequest, NextResponse } from "next/server"
import { formatQuery, signV4Request } from '@/app/api/jimeng';

const VOLC_ACCESSKEY = process.env.VOLC_ACCESSKEY
const VOLC_SECRETKEY = process.env.VOLC_SECRETKEY
const SERVICE = "cv";
export async function POST(request: NextRequest) {
  try {

    const { taskId } = await request.json()

    const queryParams = {
      'Action': 'CVSync2AsyncGetResult',
      'Version': '2022-08-31'
    };
    const formattedQuery = formatQuery(queryParams);

    // 请求体参数
    const bodyParams = {
      req_key: "jimeng_i2i_v30",
      task_id: taskId,
      req_json: {
        "logo_info":
          { "add_logo": true, "position": 0, "language": 0, "opacity": 0.3, "logo_text_content": "四川观察" },
        "return_url": true
      }
    };
    const formattedBody = JSON.stringify(bodyParams);

    const { headers, requestUrl } = signV4Request(
      VOLC_ACCESSKEY!,
      VOLC_SECRETKEY!,
      SERVICE,
      formattedQuery,
      formattedBody
    );

    const response = fetch(requestUrl, {
      method: 'POST',
      headers: headers,
      body: formattedBody
    });

    if (response == null ) {
      return NextResponse.json({
        success: false,
        message: "图片生成中，请稍后再试",
      })
    }

    const readableStreamResponse = await response;
    const data = await readableStreamResponse.json();
    console.log(" data : " + JSON.stringify(data))

    return NextResponse.json({
      success: true,
      data: data,
      message: "海报生成成功",
    })
  } catch (error) {
    console.error("生成海报失败:", error)
    return NextResponse.json({ success: false, message: "生成失败，请重试" }, { status: 500 })
  }
}
