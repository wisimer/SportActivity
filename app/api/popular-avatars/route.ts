import { type NextRequest, NextResponse } from "next/server"

interface PopularAvatar {
  id: string
  imageUrl: string
  sportType: string
  sportName: string
  likes: number
  downloads: number
  createdAt: string
}

// 模拟热门头像数据
const mockAvatars: PopularAvatar[] = [
  {
    id: "1",
    imageUrl: "/placeholder.svg?height=400&width=300&text=航空运动海报",
    sportType: "aviation",
    sportName: "航空运动",
    likes: 128,
    downloads: 89,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    imageUrl: "/placeholder.svg?height=400&width=300&text=美式橄榄球海报",
    sportType: "football",
    sportName: "美式橄榄球",
    likes: 256,
    downloads: 178,
    createdAt: "2024-01-14T15:20:00Z",
  },
  {
    id: "3",
    imageUrl: "/placeholder.svg?height=400&width=300&text=射箭海报",
    sportType: "archery",
    sportName: "射箭",
    likes: 189,
    downloads: 134,
    createdAt: "2024-01-13T09:45:00Z",
  },
  {
    id: "4",
    imageUrl: "/placeholder.svg?height=400&width=300&text=棒垒球海报",
    sportType: "baseball",
    sportName: "棒垒球",
    likes: 167,
    downloads: 112,
    createdAt: "2024-01-12T14:15:00Z",
  },
  {
    id: "5",
    imageUrl: "/placeholder.svg?height=400&width=300&text=台球海报",
    sportType: "billiards",
    sportName: "台球",
    likes: 145,
    downloads: 98,
    createdAt: "2024-01-11T11:30:00Z",
  },
  {
    id: "6",
    imageUrl: "/placeholder.svg?height=400&width=300&text=啦啦操海报",
    sportType: "cheerleading",
    sportName: "啦啦操",
    likes: 234,
    downloads: 156,
    createdAt: "2024-01-10T16:45:00Z",
  },
  {
    id: "7",
    imageUrl: "/placeholder.svg?height=400&width=300&text=飞盘海报",
    sportType: "frisbee",
    sportName: "飞盘",
    likes: 198,
    downloads: 143,
    createdAt: "2024-01-09T13:20:00Z",
  },
  {
    id: "8",
    imageUrl: "/placeholder.svg?height=400&width=300&text=体操海报",
    sportType: "gymnastics",
    sportName: "体操",
    likes: 276,
    downloads: 189,
    createdAt: "2024-01-08T10:15:00Z",
  },
  {
    id: "9",
    imageUrl: "/placeholder.svg?height=400&width=300&text=体育舞蹈海报",
    sportType: "dancesport",
    sportName: "体育舞蹈",
    likes: 312,
    downloads: 234,
    createdAt: "2024-01-07T17:30:00Z",
  },
  {
    id: "10",
    imageUrl: "/placeholder.svg?height=400&width=300&text=空手道海报",
    sportType: "karate",
    sportName: "空手道",
    likes: 187,
    downloads: 125,
    createdAt: "2024-01-06T12:45:00Z",
  },
  {
    id: "11",
    imageUrl: "/placeholder.svg?height=400&width=300&text=自由搏击海报",
    sportType: "kickboxing",
    sportName: "自由搏击",
    likes: 223,
    downloads: 167,
    createdAt: "2024-01-05T14:20:00Z",
  },
  {
    id: "12",
    imageUrl: "/placeholder.svg?height=400&width=300&text=摩托艇海报",
    sportType: "motorboat",
    sportName: "摩托艇",
    likes: 156,
    downloads: 89,
    createdAt: "2024-01-04T09:30:00Z",
  },
  {
    id: "13",
    imageUrl: "/placeholder.svg?height=400&width=300&text=桑博海报",
    sportType: "sambo",
    sportName: "桑博",
    likes: 134,
    downloads: 78,
    createdAt: "2024-01-03T15:45:00Z",
  },
  {
    id: "14",
    imageUrl: "/placeholder.svg?height=400&width=300&text=攀岩海报",
    sportType: "climbing",
    sportName: "攀岩",
    likes: 289,
    downloads: 198,
    createdAt: "2024-01-02T11:15:00Z",
  },
  {
    id: "15",
    imageUrl: "/placeholder.svg?height=400&width=300&text=壁球海报",
    sportType: "squash",
    sportName: "壁球",
    likes: 167,
    downloads: 112,
    createdAt: "2024-01-01T16:30:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "12")
    const search = searchParams.get("search") || ""
    const sportType = searchParams.get("sportType") || ""

    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 筛选数据
    let filteredAvatars = mockAvatars

    if (search) {
      filteredAvatars = filteredAvatars.filter((avatar) =>
        avatar.sportName.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (sportType) {
      filteredAvatars = filteredAvatars.filter((avatar) => avatar.sportName === sportType)
    }

    // 按点赞数排序
    filteredAvatars.sort((a, b) => b.likes - a.likes)

    // 分页
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedAvatars = filteredAvatars.slice(startIndex, endIndex)

    const response = {
      data: paginatedAvatars,
      total: filteredAvatars.length,
      page,
      pageSize,
      hasMore: endIndex < filteredAvatars.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("获取热门头像失败:", error)
    return NextResponse.json({ error: "获取热门头像失败" }, { status: 500 })
  }
}
