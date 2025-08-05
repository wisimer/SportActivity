import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {

    const { pageNum, pageSize } = await request.json()

    const { data, error } = await supabase
      .from("sport_avatar")
      .select("*")
      .range((pageNum - 1) * pageSize, pageNum * pageSize - 1)
      .order("download_count", { ascending: false })

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
