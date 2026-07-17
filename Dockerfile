# 舟友同好集会地图 —— 生产镜像
FROM node:22-bookworm-slim

# better-sqlite3 是原生模块：优先用预编译包，缺少时现场编译，需要这些基础工具
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先装依赖（利用镜像层缓存：依赖不变时不重装）
COPY package*.json ./
RUN npm install --omit=dev

# 再拷源码
COPY . .

# 数据库持久化目录（部署时把卷挂到 /app/data）
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.js"]
