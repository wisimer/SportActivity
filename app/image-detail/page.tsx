"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, QrCode, Sparkles } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// 模拟生成的4种运动海报
const mockGeneratedImages = [
  {
    id: "basketball",
    name: "篮球",
    image: "/placeholder.svg?height=300&width=300&text=篮球海报",
    description: "绿色球衣篮球运动员",
  },
  {
    id: "cycling",
    name: "自行车",
    image: "/placeholder.svg?height=300&width=300&text=自行车海报",
    description: "戴头盔的自行车运动员",
  },
  {
    id: "weightlifting",
    name: "举重",
    image: "/placeholder.svg?height=300&width=300&text=举重海报",
    description: "黑色服装举重运动员",
  },
  {
    id: "hockey",
    name: "曲棍球",
    image: "/placeholder.svg?height=300&width=300&text=曲棍球海报",
    description: "蓝色球衣曲棍球运动员",
  },
]

function ImageDetailContent() {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get("image")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (imageUrl) {
      setSelectedImage(decodeURIComponent(imageUrl))
    }
  }, [imageUrl])

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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center gap-4 py-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white border-white/50 text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">AI专属运动形象</h1>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/images/chengdu-logo.png"
              alt="2025成都世运会"
              width={120}
              height={30}
              className="h-6 w-auto drop-shadow-lg"
            />
          </div>
        </div>

        {/* 标题区域 */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">AI专属运动形象</h2>
          </div>
          <p className="text-white/90 text-sm">2025成都世运会</p>
        </div>

        {/* 主要内容卡片 */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden rounded-3xl">
          <CardContent className="p-6">
            {/* 2x2 网格布局 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {mockGeneratedImages.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-lg"
                >
                  <Image src={item.image || "/placeholder.svg"} alt={item.description} fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-medium">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleDownload(selectedImage || "", "全套")}
                  className="h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载全套
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-12 border-2 border-gray-300 hover:bg-gray-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  返回首页
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 底部二维码区域 */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 mb-1">解锁我的AI专属运动形象</p>
                <p className="text-xs text-gray-600">长按识别二维码，立即生成</p>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">四川观察</div>
            </div>
          </CardContent>
        </Card>

        {/* 底部说明 */}
        <div className="text-center text-white/80 text-xs py-4">
          <p>© 2025 成都世界运动会 · AI生成</p>
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
