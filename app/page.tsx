"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Upload,
  Camera,
  Search,
  Trophy,
  Medal,
  Star,
  Download,
  Sparkles,
  Flame,
  X,
  List,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Share2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { sportTypes } from "@/lib/constants"

// 任务接口定义
interface Task {
  id: string
  timestamp: number
  sportType: string
  sportName: string
  status: "in_queue" | "done" | "failed"
  imageUrl?: string
  error?: string
}


const categories = Array.from(new Set(sportTypes.map((sport) => sport.category)))

// 任务管理工具函数
const TASKS_STORAGE_KEY = "sports_tasks"
const RATE_LIMIT_KEY = "last_request_time"
const RATE_LIMIT_DURATION = 20 * 1000// 10 * 60 * 1000 // 10分钟

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

export default function SportsActivityPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedSport, setSelectedSport] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("球类运动")
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [rateLimit, setRateLimit] = useState({ canRequest: true, remainingTime: 0 })

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

  const queryTaskStatus = async () => {
    if (tasks == null || tasks.length == 0) {
      return;
    }

    const firstTask = tasks[0]
    try {

      const response = await fetch("/api/query-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: firstTask.id
        }),
      })
      setProgress(100)

      if (!response.ok) {
        setTaskFailed(firstTask)
        return
      }

      const taskData = await response.json()
      debugger
      if (taskData == null || taskData == undefined || !taskData.success || taskData.data == null || taskData.data == undefined || taskData.data.code != 10000) {
        setTaskFailed(firstTask)
        return
      }

      const imageData = taskData.data.data
      if (imageData == null || imageData == undefined) {
        setTaskFailed(firstTask)
        return
      }

      if (imageData.image_urls == null || imageData.image_urls == undefined) {
        setTaskFailed(firstTask)
        return
      }

      const imageUrl = imageData.image_urls[0]
      setGeneratedImage(imageUrl)

      // 更新任务状态为完成
      firstTask.status = imageData.status
      firstTask.imageUrl = imageUrl

      setTasks([firstTask])
      saveTasks([firstTask])

    } catch (error) {
      // 更新任务状态为失败
      setTaskFailed(firstTask)
    }

  }

  const setTaskFailed = (firstTask: Task) => {
    firstTask.status = "failed"
    firstTask.imageUrl = undefined
    setTasks([firstTask])
    saveTasks([firstTask])
  }

  const handleGenerate = async () => {
    if (!selectedImage || !selectedSport) return

    // 检查限流
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.canRequest) {
      const minutes = Math.ceil(rateLimitCheck.remainingTime / 60000)
      alert(`活动火爆进行中，请等待 ${minutes} 分钟后再试`)
      return
    }

    const selectedSportInfo = sportTypes.find((s) => s.id === selectedSport)
    if (!selectedSportInfo) return

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
          return prev + 5
        })
      }, 200)

      const generateResponse = await fetch("/api/generate-poster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage.startsWith('data:') ? selectedImage : btoa(selectedImage),
          sportType: selectedSportInfo.name,
        }),
      })

      if (generateResponse.ok) {
        const data = await generateResponse.json()

        const taskId = data["data"]["task_id"]

        // 创建新任务
        const newTask: Task = {
          id: taskId,
          timestamp: Date.now(),
          sportType: selectedSport,
          sportName: selectedSportInfo.name,
          status: "in_queue",
        }

        console.log(tasks)


        const updatedTasks = [newTask]

        console.log(updatedTasks, newTask)

        setTasks(updatedTasks)
        saveTasks(updatedTasks)

        // 设置限流时间（只有成功时才设置）
        setLastRequestTime()
        setRateLimit(checkRateLimit())

      } else {
        throw new Error("生成失败")
      }
    } catch (error) {
      console.error("生成失败:", error)


      alert("生成失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `2025成都世运会个性头像_${sportTypes.find((s) => s.id === selectedSport)?.name}_${Date.now()}.png`
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
    setSelectedCategory("球类运动")
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

  const selectedSportInfo = sportTypes.find((sport) => sport.id === selectedSport)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B4452B] via-[#D36B4F] to-[#F19B80] relative overflow-hidden">
      {/* 背景图片和渐变 */}
      <div className="absolute inset-0 z-0">
        {/* 顶部背景图片 */}
        <div className="absolute top-0 left-0 right-0 h-180 overflow-hidden">
          <Image
            src="/images/header.jpeg"
            alt="3D卡通运动员背景"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* 渐变过渡层 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B4452B]/60 via-[#D36B4F]/70 to-[#F19B80]"></div>

      </div>
      {/* 音乐播放器 */}
      {/* <MusicPlayer /> */}

      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-3 text-yellow-300/30 animate-bounce">
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
        {/* 右上角分享按钮 */}
        <div className="absolute top-0 right-0 p-4">

          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full w-10 h-10 p-0 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white/95 backdrop-blur-md p-2 max-w-md mx-2">
              <div className="flex justify-center items-center p-2">
                <Image
                  src="/images/header_share.png"
                  alt="分享图片"
                  className="rounded-lg shadow-lg max-w-full h-auto"
                  width={300}
                  height={300}
                  priority
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
            AI为你生成专属运动头像
          </p>
        </div>

        {/* 图片上传区域 */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-4">
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
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">选择运动类型</CardTitle>
            <CardDescription>从35种世运会项目中选择你最喜欢的</CardDescription>
          </CardHeader>
          <CardContent className="pl-6 pr-6 space-y-4">

            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2">

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
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3 ${isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                      <Image src={`/sports/${sport.name}.png` || "/placeholder.svg"} alt={sport.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-800">{sport.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{sport.category}</div>
                    </div>
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
                  <p className="font-medium text-gray-800 mb-2">AI正在生成你的专属头像...</p>
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
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
                <Sparkles className="w-5 h-5" />
                你的专属世运会头像
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt="生成的运动头像"
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
                    下载头像
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
        {(
          <Button
            onClick={handleGenerate}
            disabled={!selectedImage || !selectedSport || isGenerating || !rateLimit.canRequest}
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
                活动火爆进行中，请等待 {formatRemainingTime(rateLimit.remainingTime)}
              </>
            ) : !selectedImage || !selectedSport ? (
              "请完成上述步骤"
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成专属世运会头像
              </>
            )}
          </Button>
        )}

        {/* 任务列表和热门头像入口 */}
        {(
          <div className="grid grid-cols-2 gap-4">
            {/* 我的任务入口 */}
            <Dialog open={showTasks} onOpenChange={(open) => {
              setShowTasks(open)
              if (open) {
                queryTaskStatus()
              }
            }}>
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
                  <DialogDescription>查看你的最新头像生成任务</DialogDescription>
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
                              活动火爆进行中，请等待 {formatRemainingTime(rateLimit.remainingTime)}
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
                            <div
                              className={`w-3 h-3 rounded-full ${sportTypes.find((s) => s.id === latestTask.sportType)?.color || "bg-gray-400"
                                }`}
                            ></div>
                            <span className="font-medium text-sm">{latestTask.sportName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {latestTask.status === "in_queue" && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Clock className="w-3 h-3 animate-spin" />
                                <span className="text-xs">生成中</span>
                              </div>
                            )}
                            {latestTask.status === "done" && (
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
            <Link href="/hot">
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
          <p className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            上传的照片仅用于头像生成，不会保存
          </p>
        </div>
      </div>
    </div>
  )
}
