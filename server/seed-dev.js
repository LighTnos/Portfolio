require('dotenv').config()
const mongoose = require('mongoose')
const Project = require('./models/projectModel')

const samples = [
  { title: 'Portfolio Platform', domain: 'Full Stack', description: 'Personal portfolio with an analytics admin dashboard, GitHub repo import, and Cloudinary image uploads. Built on the MERN stack with GSAP animations.', techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'GSAP'], liveDemoUrl: 'https://lightnos.dev', githubUrl: 'https://github.com/LighTnos29/Portfolio', imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1280&q=80' },
  { title: 'Realtime Chat App', domain: 'Web App', description: 'Realtime messaging application with rooms, presence indicators, and typing status using WebSockets.', techStack: ['React', 'Socket.io', 'Node.js', 'Tailwind'], githubUrl: 'https://github.com/LighTnos29', imageUrl: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1280&q=80' },
  { title: 'DevTools Dashboard', domain: 'SaaS', description: 'Developer productivity dashboard aggregating GitHub stats, CI status, and deployment metrics in one place.', techStack: ['Next.js', 'TypeScript', 'PostgreSQL'], liveDemoUrl: 'https://github.com/LighTnos29', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&q=80' },
]

async function main() {
  await new Promise((r) => mongoose.connection.once('open', r))
  const count = await Project.countDocuments()
  if (count === 0) {
    await Project.insertMany(samples)
    console.log('Seeded', samples.length, 'sample projects')
  } else {
    console.log('DB already has', count, 'projects — skipping seed')
  }
  await mongoose.connection.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
