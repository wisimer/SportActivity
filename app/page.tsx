"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Camera, Search, Trophy, Medal, Star, Download, Sparkles, Flame, X } from "lucide-react"
import Image from "next/image"

const sportTypes = [
  // 空中运动
  { id: "aviation", name: "航空运动", category: "空中运动", color: "bg-sky-500" },

  // 球类运动
  { id: "football", name: "美式橄榄球", category: "球类运动", color: "bg-green-500" },
  { id: "baseball", name: "棒垒球", category: "球类运动", color: "bg-blue-500" },
  { id: "billiards", name: "台球", category: "球类运动", color: "bg-purple-500" },
  { id: "frisbee", name: "飞盘", category: "球类运动", color: "bg-orange-500" },
  { id: "handball", name: "手球", category: "球类运动", color: "bg-red-500" },
  { id: "squash", name: "壁球", category: "球类运动", color: "bg-indigo-500" },
  { id: "racquetball", name: "短柄墙球", category: "球类运动", color: "bg-pink-500" },
  { id: "floorball", name: "软式曲棍球", category: "球类运动", color: "bg-teal-500" },
  { id: "faustball", name: "浮士德球", category: "球类运动", color: "bg-cyan-500" },
  { id: "korfball", name: "荷球", category: "球类运动", color: "bg-lime-500" },
  { id: "boules", name: "地掷球", category: "球类运动", color: "bg-amber-500" },
  { id: "lacrosse", name: "棍网球", category: "球类运动", color: "bg-emerald-500" },

  // 射击运动
  { id: "archery", name: "射箭", category: "射击运动", color: "bg-red-600" },

  // 体操舞蹈
  { id: "cheerleading", name: "啦啦操", category: "体操舞蹈", color: "bg-pink-400" },
  { id: "gymnastics", name: "体操", category: "体操舞蹈", color: "bg-purple-400" },
  { id: "dancesport", name: "体育舞蹈", category: "体操舞蹈", color: "bg-rose-400" },

  // 格斗运动
  { id: "karate", name: "空手道", category: "格斗运动", color: "bg-gray-600" },
  { id: "kickboxing", name: "自由搏击", category: "格斗运动", color: "bg-red-700" },
  { id: "sambo", name: "桑博", category: "格斗运动", color: "bg-orange-600" },
  { id: "muaythai", name: "泰拳", category: "格斗运动", color: "bg-yellow-600" },
  { id: "jiujitsu", name: "柔术", category: "格斗运动", color: "bg-indigo-600" },
  { id: "wushu", name: "武术", category: "格斗运动", color: "bg-red-800" },

  // 水上运动
  { id: "motorboat", name: "摩托艇", category: "水上运动", color: "bg-blue-600" },
  { id: "diving", name: "潜水", category: "水上运动", color: "bg-blue-700" },
  { id: "lifesaving", name: "救生", category: "水上运动", color: "bg-cyan-600" },
  { id: "waterski", name: "滑水", category: "水上运动", color: "bg-blue-400" },
  { id: "canoe", name: "皮划艇", category: "水上运动", color: "bg-teal-600" },

  // 极限运动
  { id: "climbing", name: "攀岩", category: "极限运动", color: "bg-stone-600" },
  { id: "triathlon", name: "铁人三项", category: "极限运动", color: "bg-slate-600" },
  { id: "rollerskating", name: "轮滑", category: "极限运动", color: "bg-violet-500" },

  // 力量运动
  { id: "tugofwar", name: "拔河", category: "力量运动", color: "bg-amber-600" },
  { id: "powerlifting", name: "力量举", category: "力量运动", color: "bg-gray-700" },

  // 定向运动
  { id: "orienteering", name: "定向", category: "定向运动", color: "bg-green-600" },
]

const categories = Array.from(new Set(sportTypes.map((sport) => sport.category)))

export default function SportsActivityPage() {
  const [selectedImage, setSelectedImage] = useState<string>("/images/吉祥物.png")
  const [selectedSport, setSelectedSport] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")

  const filteredSports = useMemo(() => {
    let filtered = sportTypes

    if (selectedCategory !== "全部") {
      filtered = filtered.filter((sport) => sport.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter((sport) => sport.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return filtered
  }, [searchTerm, selectedCategory])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage || !selectedSport) return

    setIsGenerating(true)
    setProgress(0)
    setGeneratedImage(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/generate-poster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage.startsWith('data:') ? selectedImage : btoa(selectedImage),
          sportType: selectedSport,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedImage(data.imageUrl)
        setProgress(100)
      } else {
        throw new Error("生成失败")
      }
    } catch (error) {
      console.error("生成海报失败:", error)
      alert("生成失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `2025成都世运会海报_${sportTypes.find((s) => s.id === selectedSport)?.name}_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetAll = () => {
    setSelectedImage(null)
    setSelectedSport("")
    setGeneratedImage(null)
    setProgress(0)
    setSearchTerm("")
    setSelectedCategory("全部")
  }

  const selectedSportInfo = sportTypes.find((sport) => sport.id === selectedSport)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-yellow-300/30 animate-bounce">
          <Trophy className="w-16 h-16" />
        </div>
        <div className="absolute top-32 right-8 text-yellow-300/20 animate-pulse">
          <Medal className="w-12 h-12" />
        </div>
        <div className="absolute bottom-32 left-6 text-yellow-300/25 animate-spin-slow">
          <Star className="w-14 h-14" />
        </div>
        <div className="absolute bottom-16 right-12 text-yellow-300/30 animate-bounce delay-300">
          <Flame className="w-10 h-10" />
        </div>
        <div className="absolute top-1/2 left-4 text-yellow-300/15 animate-pulse delay-500">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto p-4 space-y-6">
        {/* 头部标题 */}
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/chengdu-logo.png"
              alt="2025成都世运会会徽"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">2025成都世运会</h1>
          <p className="text-white/90 text-sm leading-relaxed">
            上传你的照片，选择运动类型
            <br />
            AI为你生成专属运动海报
          </p>
        </div>

        {/* 图片上传区域 */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
              <Camera className="w-5 h-5" />
              上传自拍照
            </CardTitle>
            <CardDescription>选择一张清晰的正面照片，效果更佳</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="image-upload"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300">
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
                      <Image src={selectedImage || "/placeholder.svg"} alt="上传的照片" fill className="object-cover" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">✅ 照片已上传</p>
                    <p className="text-xs text-gray-500">点击重新上传</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isUploading ? (
                      <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    )}
                    <div>
                      <p className="text-gray-700 font-medium text-lg">{isUploading ? "上传中..." : "点击上传照片"}</p>
                      <p className="text-xs text-gray-500 mt-2">支持 JPG、PNG 格式，建议尺寸 500x500px</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 运动类型选择 */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="text-lg text-gray-800">选择运动类型</CardTitle>
            <CardDescription>从35种世运会项目中选择你最喜欢的</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索运动项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === "全部" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory("全部")}
              >
                全部
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* 已选择的运动 */}
            {selectedSportInfo && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className={`w-3 h-3 rounded-full ${selectedSportInfo.color}`}></div>
                <span className="font-medium text-blue-800">已选择：{selectedSportInfo.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedSport("")}
                  className="ml-auto h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* 运动项目网格 */}
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {filteredSports.map((sport) => {
                const isSelected = selectedSport === sport.id
                return (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${sport.color}`}></div>
                      <span className="font-medium text-sm text-gray-800">{sport.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{sport.category}</div>
                  </button>
                )
              })}
            </div>

            {filteredSports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>未找到匹配的运动项目</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 生成进度 */}
        {isGenerating && (
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-800 mb-2">AI正在生成你的专属海报...</p>
                  <Progress value={progress} className="w-full h-2" />
                  <p className="text-sm text-gray-600 mt-2">{progress}% 完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 生成结果 */}
        {generatedImage && (
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
                <Sparkles className="w-5 h-5" />
                你的专属世运会海报
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt="生成的运动海报"
                    width={400}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    下载海报
                  </Button>
                  <Button
                    onClick={resetAll}
                    variant="outline"
                    className="h-12 px-6 border-2 hover:bg-gray-50 bg-transparent"
                  >
                    重新制作
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 生成按钮 */}
        {!generatedImage && (
          <Button
            onClick={handleGenerate}
            disabled={!selectedImage || !selectedSport || isGenerating}
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                AI生成中...
              </>
            ) : !selectedImage || !selectedSport ? (
              "请完成上述步骤"
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成专属世运会海报
              </>
            )}
          </Button>
        )}

        {/* 底部说明 */}
        <div className="text-center text-white/80 text-xs space-y-2 pb-6">
          <p className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            上传的照片仅用于海报生成，不会保存
          </p>
          <p className="flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3" />
            生成的海报可以保存到相册分享朋友圈
          </p>
        </div>
      </div>
    </div>
  )
}
