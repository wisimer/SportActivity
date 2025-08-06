"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, QrCode, Sparkles } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from 'react'

function ImageDetailContent() {
  const searchParams = useSearchParams()
  const appUserId = searchParams.get("appUserId")
  const taskId = searchParams.get("taskId")


  const [selectedImage, setSelectedImage] = useState<string>("https://scgc-sctv-bucket.oss-cn-shenzhen.aliyuncs.com/shiyunhui/material/default_detail.png")

  const [imageList, setImageList] = useState<string[]>([])

  useEffect(() => {
    queryTaskDetail()
  }, [])

  const queryTaskDetail = async () => {

    try {

      const response = await fetch("http://localhost:8080/business/sport/queryUserFinalImage/" + taskId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (!response.ok) {
        return
      }

      const taskData = await response.json()
      if (taskData.data == null || taskData.data.status !== "done") {
        return
      }

      setImageList(taskData.data.imgDataList)
      console.log(taskData.data.imgDataList)

    } catch (error) {
      // 更新任务状态为失败
    } finally {
    }

  }

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `2025成都世运会_${name}_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "我的AI专属运动形象",
        text: "快来看看我的2025成都世运会专属海报！",
        url: window.location.href,
      })
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert("链接已复制到剪贴板")
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://scgc-sctv-bucket.oss-cn-shenzhen.aliyuncs.com/shiyunhui/material/detail-bg.png')] bg-cover bg-center">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 头部导航 */}
        <div className="flex justify-between items-center gap-4 py-4">


          <div className="flex items-center gap-2">
            <Image
              src="https://scgc-sctv-bucket.oss-cn-shenzhen.aliyuncs.com/shiyunhui/material/chengdu-logo.png"
              alt="2025成都世运会"
              width={120}
              height={30}
              className="h-6 w-auto drop-shadow-lg"
            />
          </div>

          <p className="text-white/90 text-sm">2025成都世运会</p>

        </div>


        {/* 主要内容卡片 */}
        <div className="mt-48">
          <Card className="border-0 shadow-2xl bg-white/50 backdrop-blur-sm overflow-hidden rounded-3xl">
            <CardContent className="">
              {/* 2x2 网格布局 */}
              <div className="grid grid-cols-2 gap-4">
                {imageList.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-lg"
                  >
                    <Image src={item.startsWith('data:image') ? item : (item ? `data:image/png;base64,${item}` : "/placeholder.svg")} alt={index} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="space-y-3 flex justify-center mt-4">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-64 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full bg-gray-50/50"
              >
                立即生成
              </Button>
            </Link>
          </div>
        </div>

        {/* 以下内容移动到屏幕最下面 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#fff4dd]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <QrCode className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 mb-1">解锁我的AI专属运动形象</p>
              <p className="text-xs text-gray-600">来四川观察，发现更多精彩</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function ImageDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImageDetailContent />
    </Suspense>
  )
}
