"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import * as React from 'react'

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
import { useRouter, useSearchParams } from "next/navigation"

// 任务接口定义
interface Task {
  id: string
  timestamp: number
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
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("格斗运动")
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [rateLimit, setRateLimit] = useState({ canRequest: true, remainingTime: 0 })

  // 获取url路径参数appUserId
  const searchParams = useSearchParams()
  const appUserId = searchParams.get("appUserId")
  const taskId = searchParams.get("taskId")

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
    if (firstTask.status === "done") {
      setGeneratedImage(firstTask.imageUrl)
      return;
    }

    try {

      const response = await fetch("https://syh.scgchc.com/business/sport/query-task", {
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

      if (taskData == null || taskData == undefined || !taskData.success || taskData.data == null || taskData.data == undefined || taskData.data.code != 10000) {
        setTaskFailed(firstTask)
        return
      }

      const imageData = taskData.data.data
      if (imageData == null || imageData == undefined) {
        setTaskFailed(firstTask)
        return
      }

      firstTask.status = imageData.status

      if (imageData.image_urls == null || imageData.image_urls == undefined) {
        firstTask.imageUrl = undefined
        setTasks([firstTask])
        saveTasks([firstTask])
        return
      }

      const imageUrl = imageData.image_urls[0]
      setGeneratedImage(imageUrl)

      firstTask.imageUrl = imageUrl
      setTasks([firstTask])
      saveTasks([firstTask])
      setIsGenerating(false)

    } catch (error) {
      // 更新任务状态为失败
      setTaskFailed(firstTask)
    } finally {
    }

  }

  const setTaskFailed = (firstTask: Task) => {
    firstTask.status = "failed"
    firstTask.imageUrl = undefined
    setTasks([firstTask])
    saveTasks([firstTask])
    setIsGenerating(false)
  }

  const handleGenerate = async () => {
    if (!selectedImage) return

    // 检查限流
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.canRequest) {
      const minutes = Math.ceil(rateLimitCheck.remainingTime / 60000)
      alert(`当前排队人数较多，请等待 ${minutes} 分钟后再试`)
      return
    }

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
      }, 500)

      const generateResponse = await fetch("https://syh.scgchc.com/business/sport/createImage/" + appUserId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage.startsWith('data:') ? selectedImage : btoa(selectedImage),
        }),
      })

      if (generateResponse.ok) {
        const data = await generateResponse.json()

        const taskId = data["data"]["task_id"]

        // 创建新任务
        const newTask: Task = {
          id: taskId,
          timestamp: Date.now(),
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
    }
  }

  const handleDownload = () => {

  }

  const resetAll = () => {
    setSelectedImage(null)
    setGeneratedImage(null)
    setProgress(0)
    setSearchTerm("")
    setSelectedCategory("格斗运动")
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
    <div className="min-h-screen bg-gradient-to-br from-[#B4452B] via-[#D36B4F] to-[#F19B80] relative overflow-hidden">
      {/* 背景图片和渐变 */}
      <div className="absolute inset-0 z-0">
        {/* 顶部背景图片 */}
        <div className="absolute top-0 left-0 right-0 h-180 overflow-hidden">
          <Image
            src="https://scgc-sctv-bucket.oss-cn-shenzhen.aliyuncs.com/shiyunhui/material/header.jpeg"
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

        {/* 头部标题 */}
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <Image
              src="https://scgc-sctv-bucket.oss-cn-shenzhen.aliyuncs.com/shiyunhui/material/chengdu-logo.png"
              alt="2025成都世运会会徽"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">2025成都世运会</h1>
          <p className="text-white/90 text-sm leading-relaxed">
            上传你的照片，选择运动类型 {appUserId}
            <br />
            AI为你生成专属运动形象
          </p>
        </div>

        {/* 图片上传区域 */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
              <Camera className="w-5 h-5" />
              上传自拍照
            </CardTitle>
            <CardDescription>选择一张清晰的正面照片，效果更佳</CardDescription>
          </CardHeader>
          <CardContent className="pl-6 pr-6">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="image-upload"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300">
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
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
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
              <Medal className="w-5 h-5" />
              AI将为你随机生成
            </CardTitle>
            <CardDescription>系统将从35种世运会项目中随机选择4中运动项目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">


          </CardContent>
        </Card>

        {/* 生成进度 */}
        {isGenerating && (
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-800 mb-2">AI正在生成你的专属形象...</p>
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
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
                <Sparkles className="w-5 h-5" />
                你的专属世运会形象
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt="生成的运动形象"
                    width={400}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
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
                您的图片正在生成中，请等待 {formatRemainingTime(rateLimit.remainingTime)}
              </>
            ) : !selectedImage ? (
              "请完成上述步骤"
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成专属世运会形象
              </>
            )}
          </Button>
        )}


        {/* 底部说明 */}
        <div className="text-center text-white/80 text-xs space-y-2 pb-6">
          <p className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            上传的照片仅用于形象生成，不会保存
          </p>
        </div>
      </div>
    </div>
  )
}
