import { PostClassification } from '@/common/enums/post/category'

export const Category = [
  {
    name: PostClassification.life,
    description: '学习已经很苦了，来看看水贴娱乐放松一下吧 🎉🎈',
    children: ['工大广场', '身边趣事', '镜头下的工大', '今天win了吗'],
    color: { primary: '#619E68', secondary: '#E3F6E0' },
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.study,
    description: '学习是一种态度！一起探索知识的海洋吧！ 📚🧠',
    children: ['学在工大', '考研', '竞赛', '讲座', '书籍资料'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.littleCreature,
    description: '校园的猫猫 🐱 狗狗 🐶，蛇蛇 🐍，鼠鼠 🐭 多可爱！',
    children: ['屯', '翠', '宣'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.loveStory,
    description:
      '在这里分享你的情感故事或者小丑经历 🤡，让大家一起陪你度过高兴或者低落的时刻 ❤️😢。',
    children: ['你和Ta的故事', '小丑故事'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.music,
    description:
      '来这里分享你的歌单/歌曲 🎵，让大家一起沉浸在音乐的海洋里，放松心情。 🎧🎶',
    children: ['网抑云'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.game,
    description: '游戏是人生的一部分！原神，启动！ 🎮🔥',
    children: ['王者荣耀', '原神', '主机游戏', '手机游戏', '音游', 'galgame'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.animation,
    description: '动漫，让我们一起进入奇妙的二次元世界！ 🌸🌟',
    children: ['动漫交流'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.lostAndFound,
    description: '哎呀，谁的东西丢了，快来看看有没有被别人捡到 🕵️‍♂️🔍',
    children: ['屯', '翠', '宣'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
  {
    name: PostClassification.taoSecondHand,
    description: '一手太贵，还是来看看二手吧 QWQ',
    children: ['屯', '翠', '宣'],
    url: 'https://d-ssl.dtstatic.com/uploads/blog/202308/21/5zS3lYbehO5LyGm.thumb.1000_0.jpeg_webp',
  },
]
