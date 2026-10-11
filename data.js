// =============================================
// data.js —— 校园探索家 · 深圳大学粤海校区版
// x / y   : 点位在真实地图上的百分比坐标（0~100）
// lat/lng : 真实 GPS 坐标，用于定位验证；不知道就留 null
// radius  : 打卡允许的半径（米）
// category: 系列（study/sports/food/life/explore/hidden）
// hidden  : true 表示隐藏打卡点
// unlockAt: 隐藏点需要累计完成多少个任务后才浮现
// unlockAfterSpot: 隐藏点需要完成某个指定地点的全部任务后才浮现
// =============================================

const SPOTS = [
   {
    id: "wenke", name: "汇文楼", icon: "🏫",
    x: 20, y: 28, category: "study",
    lat: 22.5408, lng: 113.9298, radius: 200,
    tasks: [
      { id: "wenke-1", title: "完整听完一节课", points: 10 },
      { id: "wenke-2", title: "帮同学找一次教室", points: 15 },
    ],
  },
    {
    id: "math-institute", name: "数学科学研究院", icon: "📐",
    x: 42, y: 34, category: "study",
    lat: 22.5383, lng: 113.9316, radius: 200,
    tasks: [
      { id: "math-1", title: "找一位数学老师请教问题", points: 15 },
      { id: "math-2", title: "在研究院旁的小路安静走一走", points: 10 },
    ],
  },
   {
    id: "library", name: "图书馆", icon: "📚",
    x: 42, y: 47, category: "study",
    lat: 22.5364, lng: 113.9306, radius: 200,
    tasks: [
      { id: "library-1", title: "在图书馆自习 1 小时", points: 10 },
      { id: "library-2", title: "借一本感兴趣的书", points: 15 },
    ],
  },
   {
    id: "wenshan-lake", name: "文山湖", icon: "🌳",
    x: 43, y: 65, category: "explore",
    lat: 22.5337, lng: 113.9287, radius: 250,
    tasks: [
      { id: "lake-1", title: "绕文山湖散步一圈", points: 10 },
      { id: "lake-2", title: "拍一张湖景照片", points: 15 },
    ],
  },
    {
    id: "canteen", name: "听荔餐厅", icon: "🍜",
    x: 30, y: 47, category: "food",
    lat: 22.5375, lng: 113.9297, radius: 200,
    tasks: [
      { id: "canteen-1", title: "打卡一个没吃过的窗口", points: 10 },
      { id: "canteen-2", title: "和同学一起好好吃顿饭", points: 15 },
    ],
  },
 {
    id: "zhai-dorm", name: "斋区宿舍", icon: "🛏️",
    x: 60, y: 42, category: "life",
    lat: 22.5403, lng: 113.9297, radius: 200,
    tasks: [
      { id: "zhai-1", title: "整理桌面并拍照记录", points: 10 },
      { id: "zhai-2", title: "和室友拍一张合照", points: 15 },
    ],
  },
    {
    id: "nan-dorm", name: "南区宿舍", icon: "🛏️",
    x: 90, y: 47, category: "life",
    lat: 22.5334, lng: 113.9370, radius: 300,
    tasks: [
      { id: "nan-1", title: "整理桌面并拍照记录", points: 10 },
      { id: "nan-2", title: "和室友拍一张合照", points: 15 },
    ],
  },
    {
    id: "qiaoyuan-dorm", name: "乔苑/阁区宿舍", icon: "🏠",
    x: 45, y: 80, category: "life",
    lat: 22.5303, lng: 113.9272, radius: 300,
    tasks: [
      { id: "qiaoyuan-1", title: "和室友拍一张合照", points: 15 },
      { id: "qiaoyuan-2", title: "整理桌面并拍照记录", points: 10 },
    ],
  },
    {
    id: "track", name: "运动广场", icon: "🏃",
    x: 69, y: 56, category: "sports",
    lat: 22.5335, lng: 113.9333, radius: 250,
    tasks: [
      { id: "track-1", title: "在运动广场运动一次", points: 15 },
      { id: "track-2", title: "约一次球", points: 10 },
    ],
  },
    {
    id: "yuanping", name: "元平体育馆", icon: "🏸",
    x: 53, y: 29, category: "sports",
    lat: 22.5389, lng: 113.9338, radius: 200,
    tasks: [
      { id: "gym-1", title: "打一场球", points: 15 },
      { id: "gym-2", title: "熟悉元平体育馆教室", points: 10 },
    ],
  },
    {
    id: "swim", name: "游泳馆", icon: "🏊",
    x: 64, y: 50, category: "sports",
    lat: 22.5348, lng: 113.9334, radius: 200,
    tasks: [
      { id: "swim-1", title: "游一次泳", points: 15 },
      { id: "swim-2", title: "了解开放时间并告诉同学", points: 10 },
    ],
  },
    {
    id: "shiwuwu", name: "石头坞", icon: "🎪",
    x: 45, y: 72, category: "life",
    lat: 22.5344, lng: 113.9329, radius: 200,
    tasks: [
      { id: "sww-1", title: "参加一次社团摆摊或招新活动", points: 15 },
      { id: "sww-2", title: "看一场露天演出或路演", points: 10 },
    ],
  },
   {
    id: "clinic", name: "校医院", icon: "🏥",
    x: 66, y: 44, category: "life",
    lat: 22.5354, lng: 113.9338, radius: 200,
    tasks: [
      { id: "clinic-1", title: "了解一次就诊流程", points: 10 },
      { id: "clinic-2", title: "帮同学指一次路", points: 15 },
    ],
  },
   {
    id: "xiaoximen", name: "小西门", icon: "⛩️",
    x: 29, y: 89, category: "explore",
    lat: 22.5307, lng: 113.9249, radius: 150,
    tasks: [
      { id: "xxm-1", title: "去到小西门", points: 10 },
      { id: "xxm-2", title: "骑单车到达小西门", points: 10 },
    ],
  },

  // ============ 隐藏打卡点 ============
    {
    id: "cat", name: "校园猫出没点", icon: "🐱",
    x: 57, y: 66, category: "hidden",
    lat: 22.5328, lng: 113.9310, radius: 250,
    hidden: true, unlockAt: 6,
    tasks: [
      { id: "cat-1", title: "偶遇一只校园猫并拍照", points: 15 },
      { id: "cat-2", title: "给那只猫起个名字记下来", points: 20 },
    ],
  },
    {
    id: "night-snack", name: "宵夜街", icon: "🍢",
    x: 12, y: 94, category: "hidden",
    lat: 22.5269, lng: 113.9246, radius: 250,
    hidden: true, unlockAfterSpot: "xiaoximen",
    tasks: [
      { id: "snack-1", title: "去吃一次宵夜", points: 20 },
      { id: "snack-2", title: "给同学推荐一家宵夜店", points: 15 },
    ],
  },
   {
    id: "sunset", name: "夕阳观赏点", icon: "🌇",
    x: 48, y: 65, category: "hidden",
    lat: 22.5337, lng: 113.9287, radius: 9999,
    hidden: true, unlockAt: 18,
    tasks: [
      { id: "sunset-1", title: "在校园里看一次夕阳", points: 20 },
      { id: "sunset-2", title: "拍一张天空的照片", points: 15 },
    ],
  },
];