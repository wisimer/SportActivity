"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Camera, Trophy, Star, Download, Sparkles, List, Clock, CheckCircle, AlertCircle, Eye, Users, Shuffle } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { MusicPlayer } from "@/components/MusicPlayer"

// 任务接口定义
interface Task {
  id: string
  timestamp: number
  sportTypes: string[] // 改为数组，存储4种随机运动
  sportNames: string[] // 改为数组，存储4种运动名称
  status: "pending" | "completed" | "failed"
  imageUrl?: string
  error?: string
}

const sportTypes = [
  { id: "aviation", name: "航空运动", image: "/sports/aviation.png" },
  { id: "football", name: "美式橄榄球", image: "/sports/football.png" },
  { id: "archery", name: "射箭", image: "/sports/archery.png" },
  { id: "baseball", name: "棒垒球", image: "/placeholder.svg?height=60&width=60" },
  { id: "billiards", name: "台球", image: "/placeholder.svg?height=60&width=60" },
  { id: "frisbee", name: "飞盘", image: "/placeholder.svg?height=60&width=60" },
  { id: "handball", name: "手球", image: "/placeholder.svg?height=60&width=60" },
  { id: "squash", name: "壁球", image: "/placeholder.svg?height=60&width=60" },
  { id: "cheerleading", name: "啦啦操", image: "/placeholder.svg?height=60&width=60" },
  { id: "gymnastics", name: "体操", image: "/placeholder.svg?height=60&width=60" },
  { id: "dancesport", name: "体育舞蹈", image: "/placeholder.svg?height=60&width=60" },
  { id: "karate", name: "空手道", image: "/placeholder.svg?height=60&width=60" },
  { id: "kickboxing", name: "自由搏击", image: "/placeholder.svg?height=60&width=60" },
  { id: "climbing", name: "攀岩", image: "/placeholder.svg?height=60&width=60" },
  { id: "triathlon", name: "铁人三项", image: "/placeholder.svg?height=60&width=60" },
]

// 任务管理工具函数
const TASKS_STORAGE_KEY = "sports_tasks"
const RATE_LIMIT_KEY = "last_request_time"
const RATE_LIMIT_DURATION = 10 * 60 * 1000 // 10分钟

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
}

const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const checkRateLimit = (): { canRequest: boolean; remainingTime: number } => {
  const lastRequestTime = localStorage.getItem(RATE_LIMIT_KEY)
  if (!lastRequestTime) {
    return { canRequest: true, remainingTime: 0 }
  }

  const timeSinceLastRequest = Date.now() - Number.parseInt(lastRequestTime)
  const remainingTime = RATE_LIMIT_DURATION - timeSinceLastRequest

  return {
    canRequest: remainingTime <= 0,
    remainingTime: Math.max(0, remainingTime),
  }
}

const setLastRequestTime = () => {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString())
}

// 随机选择4种运动类型
const getRandomSports = () => {
  const shuffled = [...sportTypes].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 4)
}

export default function SportsActivityPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [rateLimit, setRateLimit] = useState({ canRequest: true, remainingTime: 0 })
  const [randomSports, setRandomSports] = useState<typeof sportTypes>([])

  // 生成随机运动类型
  useEffect(() => {
    setRandomSports(getRandomSports())
  }, [])

  // 加载任务和检查限流
  useEffect(() => {
    setTasks(loadTasks())
    setRateLimit(checkRateLimit())

    // 每秒更新限流状态
    const interval = setInterval(() => {
      setRateLimit(checkRateLimit())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 获取最新任务
  const latestTask = useMemo(() => {
    return tasks.length > 0 ? tasks[0] : null
  }, [tasks])

  // 判断是否应该显示生成按钮
  const shouldShowGenerateButton = useMemo(() => {
    if (!latestTask) return true
    return latestTask.status === "failed"
  }, [latestTask])

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
    if (!selectedImage) return

    // 检查限流
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.canRequest) {
      const minutes = Math.ceil(rateLimitCheck.remainingTime / 60000)
      alert(`请等待 ${minutes} 分钟后再试`)
      return
    }

    // 创建新任务
    const newTask: Task = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      sportTypes: randomSports.map((s) => s.id),
      sportNames: randomSports.map((s) => s.name),
      status: "pending",
    }

    const updatedTasks = [newTask, ...tasks]
    setTasks(updatedTasks)
    saveTasks(updatedTasks)

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
          image: selectedImage,
          sportTypes: randomSports.map((s) => s.id),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedImage(data.imageUrl)
        setProgress(100)

        // 更新任务状态为完成
        const completedTask = { ...newTask, status: "completed" as const, imageUrl: data.imageUrl }
        const finalTasks = updatedTasks.map((task) => (task.id === newTask.id ? completedTask : task))
        setTasks(finalTasks)
        saveTasks(finalTasks)

        // 设置限流时间（只有成功时才设置）
        setLastRequestTime()
        setRateLimit(checkRateLimit())
      } else {
        throw new Error("生成失败")
      }
    } catch (error) {
      console.error("生成海报失败:", error)

      // 更新任务状态为失败
      const failedTask = { ...newTask, status: "failed" as const, error: "生成失败，请重试" }
      const finalTasks = updatedTasks.map((task) => (task.id === newTask.id ? failedTask : task))
      setTasks(finalTasks)
      saveTasks(finalTasks)

      alert("生成失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `2025成都世运会海报_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetAll = () => {
    setSelectedImage(null)
    setGeneratedImage(null)
    setProgress(0)
    setRandomSports(getRandomSports()) // 重新随机选择运动类型
  }

  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, "_blank")
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN")
  }

  const formatRemainingTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片和渐变 */}
      <div className="absolute inset-0 z-0">
        {/* 顶部背景图片 */}
        <div className="absolute top-0 left-0 right-0 h-80 overflow-hidden">
          <Image
            src="/images/header.jpeg"
            alt="3D卡通运动员背景"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* 渐变过渡层 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-400/60 via-red-500/70 to-pink-600"></div>

        {/* 额外的渐变遮罩增强过渡效果 */}
        <div className="absolute top-60 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-orange-400/80"></div>
      </div>

      {/* 音乐播放器 */}
      <MusicPlayer />

      <div className="relative z-20 max-w-md mx-auto p-4 space-y-6">
        {/* 头部标题 */}
        <div className="text-center py-6 pt-16">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/chengdu-logo.png"
              alt="2025成都世运会会徽"
              width={200}
              height={60}
              className="h-12 w-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">2025成都世运会</h1>
          <p className="text-white/90 text-sm leading-relaxed drop-shadow-md">
            上传你的照片，AI为你生成
            <br />
            专属运动海报
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

        {/* 随机运动类型展示 */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              AI将为你随机生成
            </CardTitle>
            <CardDescription>系统将随机选择以下4种运动类型为你生成海报</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {randomSports.map((sport, index) => (
                <div
                  key={sport.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                    <Image src={sport.image || "/placeholder.svg"} alt={sport.name} fill className="object-cover" />
                  </div>
                  <div>
                    <span className="font-medium text-sm text-gray-800">{sport.name}</span>
                    <div className="text-xs text-gray-500">第{index + 1}种</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                onClick={() => setRandomSports(getRandomSports())}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Shuffle className="w-3 h-3 mr-1" />
                重新随机选择
              </Button>
            </div>
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
                  <Link href={`/image-detail?image=${encodeURIComponent(generatedImage)}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full h-12 px-6 border-2 hover:bg-gray-50 bg-transparent"
                    >
                      查看详情
                    </Button>
                  </Link>
                </div>
                <Button
                  onClick={resetAll}
                  variant="ghost"
                  className="w-full h-10 text-gray-600 hover:text-gray-800"
                >
                  重新制作
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 生成按钮 */}
        {shouldShowGenerateButton && !generatedImage && (
          <Button
            onClick={handleGenerate}
            disabled={!selectedImage || isGenerating || !rateLimit.canRequest}
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                AI生成中...
              </>
            ) : !rateLimit.canRequest ? (
              <>
                <Clock className="w-5 h-5 mr-2" />
                请等待 {formatRemainingTime(rateLimit.remainingTime)}
              </>
            ) : !selectedImage ? (
              "请先上传照片"
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成专属世运会海报
              </>
            )}
          </Button>
        )}

        {/* 任务列表和热门头像入口 */}
        {!shouldShowGenerateButton && !generatedImage && (
          <div className="grid grid-cols-2 gap-4">
            {/* 我的任务入口 */}
            <Dialog open={showTasks} onOpenChange={setShowTasks}>
              <DialogTrigger asChild>
                <Button className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-xl">
                  <div className="flex flex-col items-center gap-1">
                    <List className="w-6 h-6" />
                    <span className="text-sm">我的任务</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    我的任务
                  </DialogTitle>
                  <DialogDescription>查看你的最新海报生成任务</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* 限流倒计时 */}
                  {!rateLimit.canRequest && (
                    <Card className="border border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">请稍等片刻</p>
                            <p className="text-xs text-yellow-600">
                              还需等待 {formatRemainingTime(rateLimit.remainingTime)} 后才能发起新请求
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 最新任务 */}
                  {latestTask ? (
                    <Card className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shuffle className="w-3 h-3 text-blue-600" />
                            <span className="font-medium text-sm">随机4种运动</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {latestTask.status === "pending" && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Clock className="w-3 h-3 animate-spin" />
                                <span className="text-xs">生成中</span>
                              </div>
                            )}
                            {latestTask.status === "completed" && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-xs">已完成</span>
                              </div>
                            )}
                            {latestTask.status === "failed" && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-xs">失败</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{formatTime(latestTask.timestamp)}</p>
                        {latestTask.status === "completed" && latestTask.imageUrl && (
                          <Button
                            size="sm"
                            onClick={() => handleViewImage(latestTask.imageUrl!)}
                            className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            查看图片
                          </Button>
                        )}
                        {latestTask.status === "failed" && latestTask.error && (
                          <p className="text-xs text-red-500">{latestTask.error}</p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <List className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无任务记录</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* 热门头像入口 */}
            <Link href="/popular-avatars">
              <Button className="w-full h-16 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold shadow-xl">
                <div className="flex flex-col items-center gap-1">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">热门头像</span>
                </div>
              </Button>
            </Link>
          </div>
        )}

        {/* 底部说明 */}
        <div className="text-center text-white/80 text-xs space-y-2 pb-6">
          <p className="flex items-center justify-center gap-1 drop-shadow-md">
            <Star className="w-3 h-3" />
            上传的照片仅用于海报生成，不会保存
          </p>
          <p className="flex items-center justify-center gap-1 drop-shadow-md">
            <Trophy className="w-3 h-3" />
            每10分钟只能生成一次海报，请耐心等待
          </p>
        </div>
      </div>
    </div>
  )
}
