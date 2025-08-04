import { type NextRequest, NextResponse } from "next/server"
import { formatQuery, signV4Request } from '@/app/api/jimeng';
import { supabase } from "@/lib/supabase";

const VOLC_ACCESSKEY = process.env.VOLC_ACCESSKEY
const VOLC_SECRETKEY = process.env.VOLC_SECRETKEY
const SERVICE = "cv";
export async function POST(request: NextRequest) {
  try {

    const { pageNum, pageSize } = await request.json()

    const { data, error } = await supabase
      .from("sport_avatar")
      .select("*")
      
    if (error) {
      return NextResponse.json({
        success: false,
        message: "获取失败",
      })
    }

    console.log(data)

    return NextResponse.json({
      success: true,
      data: data,
      message: "成功",
    })
  } catch (error) {
    console.error("生成头像失败:", error)
    return NextResponse.json({ success: false, message: "生成失败，请重试" }, { status: 500 })
  }
}
