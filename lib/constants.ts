// API端点配置
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://syh.scgchc.com' 
  : 'http://localhost:8081';

export const QUERY_IMAGE_TASK_ENDPOINT = `${API_BASE_URL}/business/sport/queryImageTask/`;
export const CREATE_IMAGE_ENDPOINT = `${API_BASE_URL}/business/sport/createImage/`;
export const QUERY_USER_FINAL_IMAGE_ENDPOINT = `${API_BASE_URL}/business/sport/queryUserFinalImage/`;

export const sportTypes = [



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


  // 体操舞蹈
  { id: "cheerleading", name: "啦啦操", category: "体操舞蹈", color: "bg-pink-400" },
  { id: "gymnastics", name: "体操", category: "体操舞蹈", color: "bg-purple-400" },
  { id: "dancesport", name: "体育舞蹈", category: "体操舞蹈", color: "bg-rose-400" },


  // 力量运动
  { id: "tugofwar", name: "拔河", category: "力量运动", color: "bg-amber-600" },
  { id: "powerlifting", name: "力量举", category: "力量运动", color: "bg-gray-700" },

  // 球类运动
  { id: "football", name: "美式橄榄球", category: "球类运动", color: "bg-green-500" },
  { id: "wheelchair rugby", name: "轮椅橄榄球", category: "球类运动", color: "bg-gray-700" },
  { id: "baseball", name: "棒垒球", category: "球类运动", color: "bg-blue-500" },
  { id: "billiards", name: "台球", category: "球类运动", color: "bg-purple-500" },
  { id: "handball", name: "手球", category: "球类运动", color: "bg-red-500" },
  { id: "squash", name: "壁球", category: "球类运动", color: "bg-indigo-500" },
  { id: "racquetball", name: "短柄墙球", category: "球类运动", color: "bg-pink-500" },
  { id: "floorball", name: "软式曲棍球", category: "球类运动", color: "bg-teal-500" },
  { id: "faustball", name: "浮士德球", category: "球类运动", color: "bg-cyan-500" },
  { id: "korfball", name: "荷球", category: "球类运动", color: "bg-lime-500" },
  { id: "boules", name: "地掷球", category: "球类运动", color: "bg-amber-500" },
  { id: "lacrosse", name: "棍网球", category: "球类运动", color: "bg-emerald-500" },


  { id: "orienteering", name: "定向", category: "其他", color: "bg-green-600" },
  { id: "archery", name: "射箭", category: "其他", color: "bg-red-600" },
  { id: "aviation", name: "航空运动", category: "其他", color: "bg-sky-500" },
  { id: "frisbee", name: "飞盘", category: "其他", color: "bg-orange-500" }
]
