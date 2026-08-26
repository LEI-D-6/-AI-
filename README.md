# 慢性病智能管理系统

## 项目简介

这是一个慢性病智能管理系统，主要功能包括：
- 食物分析（支持食物和蔬菜水果识别）
- DeepSeek API健康分析（900字限制）
- 用药计划管理（医生端和患者端同步）
- 病历记录管理
- 患者健康监测
- 医生-患者聊天
- 健康资讯浏览

## 系统要求

### 后端
- Python 3.10+
- PostgreSQL 15+
- MongoDB 6+
- Redis 7+

### 前端
- Node.js 18+
- npm 9+

## 安装步骤

### 1. 环境准备

#### Windows系统
1. 安装 Python 3.10+（推荐 3.10）
2. 安装 Node.js 18+（推荐 18.18.0）
3. 安装 PostgreSQL 15+，创建数据库 `chronic_disease_management`
4. 安装 MongoDB 6+，确保服务正常运行
5. 安装 Redis 7+，确保服务正常运行

#### Linux系统
```bash
# 安装 Python 3.10
sudo apt update
sudo apt install python3.10 python3-pip

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE chronic_disease_management;"

# 安装 MongoDB
sudo apt install mongodb

sudo systemctl start mongodb

# 安装 Redis
sudo apt install redis-server
sudo systemctl start redis-server
```

### 2. 安装依赖

#### 后端依赖
```bash
# 进入 backend 目录
cd backend

# 创建虚拟环境（可选但推荐）
python -m venv venv

# 激活虚拟环境
# Windows: venv\Scripts\activate
# Linux: source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

#### 前端依赖
```bash
# 进入 frontend 目录
cd frontend

# 安装依赖
npm install
```

### 3. 配置文件

#### 后端配置
1. 在 `backend` 目录下创建 `.env` 文件
2. 填写以下内容：

```env
# 数据库配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/chronic_disease_management"
MONGODB_URL="mongodb://localhost:27017/chronic_disease_management"
REDIS_URL="redis://localhost:6379/0"

# 安全配置
SECRET_KEY="your-secret-key-here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 百度AI API配置
BAIDU_API_KEY="your-baidu-api-key"
BAIDU_SECRET_KEY="your-baidu-secret-key"

# DeepSeek API配置
DEEPSEEK_API_KEY="your-deepseek-api-key"
```

### 4. 数据库初始化

```bash
# 进入 backend 目录
cd backend

# 初始化数据库
python start.py
```

### 5. 启动服务

#### 后端服务
```bash
# 进入 backend 目录
cd backend

# 启动后端服务
python start.py
```

#### 前端服务
```bash
# 进入 frontend 目录
cd frontend

# 启动前端开发服务器
npm run dev
```

### 6. 访问系统

1. 打开浏览器访问：http://localhost:3000
2. 使用以下账户登录：
   - 管理员：admin@example.com / password123
   - 医生：doctor@example.com / password123
   - 患者：patient@example.com / password123

## 部署到生产环境

### 1. 构建前端

```bash
# 进入 frontend 目录
cd frontend

# 构建前端
npm run build
```

### 2. 配置 Nginx

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 启动后端服务

使用 PM2 或 systemd 管理后端服务。

## 常见问题

### 1. 数据库连接失败
- 检查 PostgreSQL、MongoDB、Redis 服务是否正常运行
- 检查 `.env` 文件中的数据库连接字符串是否正确

### 2. 前端无法访问后端API
- 检查后端服务是否正常运行
- 检查前端 `vite.config.js` 中的代理配置是否正确

### 3. 食物分析失败
- 检查百度AI API密钥是否正确
- 检查网络连接是否正常

### 4. 健康分析失败
- 检查 DeepSeek API 密钥是否正确
- 检查网络连接是否正常

## 技术栈

### 后端
- FastAPI
- PostgreSQL
- MongoDB
- Redis
- SQLAlchemy
- Pydantic

### 前端
- React
- Ant Design
- React Router
- Axios
- Zustand

## 项目结构

```
DDD/
├── backend/            # 后端代码
│   ├── src/            # 源代码
│   │   ├── app/        # 应用代码
│   │   ├── uploads/    # 上传文件
│   ├── requirements.txt # 依赖文件
│   ├── start.py        # 启动脚本
│   └── .env            # 环境配置
├── frontend/           # 前端代码
│   ├── src/            # 源代码
│   ├── public/         # 静态文件
│   ├── package.json    # 依赖文件
│   └── vite.config.js  # Vite配置
└── README.md           # 项目说明
```

## 注意事项

1. 首次运行时，系统会自动创建管理员、医生和患者账户
2. 请根据实际情况修改 `.env` 文件中的配置
3. 生产环境部署时，请修改默认密码
4. 确保百度AI和DeepSeek API密钥有效

## 联系方式

如有问题，请联系：health@example.com