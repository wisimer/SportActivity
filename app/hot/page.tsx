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
  img_url: string
  sport_type: string
  sportName: string
  download_count: number
  created_at: string
}

interface ApiResponse {
  data: PopularAvatar[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export default function PopularAvatarsPage() {
  const [avatars, setAvatars] = useState<PopularAvatar[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchAvatars = async (pageNum: number, reset = false) => {
    setLoading(true)
    try {


      const response = await fetch(`/api/hot-avatars`, {
        method: "POST", body: JSON.stringify({
          pageNum: pageNum.toString(),
          pageSize: "12"
        })
      })
      const data: ApiResponse = await response.json()

      if (reset) {
        setAvatars(data.data)
      } else {
        setAvatars((prev) => [...prev, ...data.data])
      }

      setHasMore(data.hasMore)
    } catch (error) {
      console.error("获取热门头像失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchAvatars(1, true)
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAvatars(nextPage, false)
  }

  const handleDownload = (avatar: PopularAvatar) => {
    const link = document.createElement("a")
    link.href = avatar.img_url
    link.download = `热门头像_${avatar.sportName}_${avatar.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (img_url: string) => {
    window.open(img_url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center gap-4 py-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white border-white/50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">热门头像</h1>
            <p className="text-white/80 text-sm">发现精彩的运动头像作品</p>
          </div>
        </div>

        {/* 头像网格 */}
        <div className="grid grid-cols-2 gap-4">
          {avatars.map((avatar) => (
            <Card key={avatar.id} className="border-0 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[1/1] bg-gray-100">
                  <Image
                    src={avatar.img_url || "/placeholder.svg?height=225&width=225&text=热门头像"}
                    alt={`${avatar.sportName}头像`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleView(avatar.img_url)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(avatar)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {avatar.sport_type}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📥 {avatar.download_count}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(avatar.created_at).toLocaleDateString("zh-CN")}</p>
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
            <p>已加载全部</p>
          </div>
        )}

        {/* 空状态 */}
        {!loading && avatars.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/50" />
            <p className="text-white/80 text-lg mb-2">暂无热门头像</p>
            <p className="text-white/60 text-sm">快去生成你的专属头像吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}
