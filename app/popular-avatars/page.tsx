"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Download, Eye, Users, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PopularAvatar {
  id: string
  imageUrl: string
  sportType: string
  sportName: string
  likes: number // 保持后端数据结构不变，前端不显示
  downloads: number // 保持后端数据结构不变，前端不显示
  createdAt: string
}

interface ApiResponse {
  data: PopularAvatar[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

const SPORT_TYPES = [
  "全部",
  "航空运动",
  "美式橄榄球",
  "射箭",
  "棒垒球",
  "台球",
  "啦啦操",
  "飞盘",
  "体操",
  "体育舞蹈",
  "空手道",
  "自由搏击",
  "摩托艇",
  "桑博",
  "攀岩",
  "壁球",
  "铁人三项",
  "拔河",
  "潜水",
  "手球",
  "轮滑",
  "短柄墙球",
  "软式曲棍球",
  "定向",
  "力量举",
  "泰拳",
  "柔术",
  "救生",
  "浮士德球",
  "武术",
  "滑水",
  "荷球",
  "地掷球",
  "棍网球",
  "皮划艇",
]

export default function PopularAvatarsPage() {
  const [avatars, setAvatars] = useState<PopularAvatar[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState("全部")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchAvatars = async (pageNum: number, reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: "12",
        search: searchTerm,
        sportType: selectedSport === "全部" ? "" : selectedSport,
      })

      const response = await fetch(`/api/popular-avatars?${params}`)
      const data: ApiResponse = await response.json()

      if (reset) {
        setAvatars(data.data)
      } else {
        setAvatars((prev) => [...prev, ...data.data])
      }

      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch (error) {
      console.error("获取热门头像失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchAvatars(1, true)
  }, [searchTerm, selectedSport])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAvatars(nextPage, false)
  }

  const handleDownload = (avatar: PopularAvatar) => {
    const link = document.createElement("a")
    link.href = avatar.imageUrl
    link.download = `热门头像_${avatar.sportName}_${avatar.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (imageUrl: string) => {
    window.open(imageUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center gap-4 py-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white border-white/50 text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">热门头像</h1>
            <p className="text-white/80 text-sm">发现精彩的运动海报作品</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索运动类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 运动类型筛选 */}
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {SPORT_TYPES.map((sport) => (
                <Badge
                  key={sport}
                  variant={selectedSport === sport ? "default" : "secondary"}
                  className="cursor-pointer text-xs px-3 py-1 rounded-full"
                  onClick={() => setSelectedSport(sport)}
                >
                  {sport}
                </Badge>
              ))}
            </div>

            {/* 统计信息 */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />共 {total} 个作品
              </span>
              {selectedSport !== "全部" && <span className="text-gray-500">筛选：{selectedSport}</span>}
            </div>
          </CardContent>
        </Card>

        {/* 头像网格 */}
        <div className="grid grid-cols-2 gap-4">
          {avatars.map((avatar) => (
            <Card
              key={avatar.id}
              className="border-0 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden rounded-xl"
            >
              <CardContent className="p-0">
                <div className="relative w-full aspect-square bg-gray-100">
                  {" "}
                  {/* 1:1 正方形图片 */}
                  <Image
                    src={avatar.imageUrl || "/placeholder.svg?height=300&width=300&text=热门头像"}
                    alt={`${avatar.sportName}海报`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleView(avatar.imageUrl)}
                        className="bg-white/90 hover:bg-white text-gray-700"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(avatar)}
                        className="bg-white/90 hover:bg-white text-gray-700"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <Badge variant="secondary" className="text-xs mb-2 px-2 py-0.5 rounded-full">
                    {avatar.sportName}
                  </Badge>
                  <p className="text-xs text-gray-500">{new Date(avatar.createdAt).toLocaleDateString("zh-CN")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 加载更多 */}
        {hasMore && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  加载中...
                </>
              ) : (
                "加载更多"
              )}
            </Button>
          </div>
        )}

        {/* 无更多数据提示 */}
        {!hasMore && avatars.length > 0 && (
          <div className="text-center text-white/80 text-sm py-4">
            <p>已显示全部 {total} 个作品</p>
          </div>
        )}

        {/* 空状态 */}
        {!loading && avatars.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/50" />
            <p className="text-white/80 text-lg mb-2">暂无热门头像</p>
            <p className="text-white/60 text-sm">快去生成你的专属海报吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}
