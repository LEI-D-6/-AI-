# 系统导出导入指南

## 1. 导出内容

### 1.1 虚拟环境
- **导出文件**: `backend/requirements.txt`
- **内容**: 包含所有已安装的Python包及其版本信息

### 1.2 PostgreSQL数据库
- **导出文件**: `backend/postgres_dump.json`
- **内容**: 包含数据库配置、表结构和数据
- **导出的表**: users, doctor_patient, doctor_requests, health_data, medical_records, treatment_plans, patients, health_records, messages

### 1.3 MongoDB数据库
- **导出文件**: `backend/mongodb_dump.json`
- **内容**: 包含所有集合数据、角色信息和数据库配置
- **导出的集合**: health_records, medical_notes

## 2. 导入步骤

### 2.1 虚拟环境导入

1. **创建新的虚拟环境**:
   ```powershell
   python -m venv .venv
   ```

2. **激活虚拟环境**:
   - Windows:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

3. **升级pip**:
   ```powershell
   python -m pip install --upgrade pip
   ```

4. **安装依赖**:
   ```powershell
   pip install -r backend/requirements.txt

   python fix_sqlalchemy.py
   ```

### 2.2 PostgreSQL数据库导入

#### 方法一: 使用导出的JSON文件（推荐）

1. **确保PostgreSQL服务已启动**

2. **运行导入脚本**:
   ```powershell
   .venv\Scripts\Activate.ps1
   cd backend
   python import_postgres.py
   ```

#### 方法二: 使用pg_dump工具

1. **确保PostgreSQL服务已启动**

2. **创建数据库**:
   ```powershell
   psql -U postgres -c "CREATE DATABASE postgres;"
   ```
3 修改导入文件的密码backend\import_postgres.py 和backend\.env
4. **导入数据**:
   ```powershell
   pg_dump -h localhost -p 5432 -U postgres -d postgres -f postgres_full_dump.sql
   psql -U postgres -d postgres -f postgres_full_dump.sql
   ```

### 2.3 MongoDB数据库导入

1. **运行导入脚本**:
    ```powershell
    .venv\Scripts\Activate.ps1
    cd backend
    python import_mongodb.py
    ```

2. **导入结果说明**:
    - 如果显示"集合为空，跳过导入"，这是正常现象
    - 原始数据库中`health_records`和`medical_notes`集合确实没有数据
    - 系统会在运行时自动创建集合并写入数据
    - 只要显示"MongoDB数据库导入完成！"就表示导入成功

3. **导入角色**:
    - MongoDB角色会在导入脚本中自动创建
    - 如果角色导入失败，请手动创建所需角色

### 2.4 环境配置

1. **复制环境配置文件**:
   ```powershell
   cp backend/.env.example backend/.env
   ```

2. **编辑环境配置文件**:
   - 配置数据库连接信息
   - 配置其他必要的环境变量

## 3. 服务启动顺序

1. **PostgreSQL**
2. **MongoDB**
3. **应用程序**:
   ```powershell
   .venv\Scripts\Activate.ps1
   python backend/start.py
   ```

## 4. 端口配置

- **PostgreSQL**: 5432
- **MongoDB**: 27017
- **应用程序**: 8000

## 5. 故障排除

### 5.1 PostgreSQL连接失败
- 检查PostgreSQL服务是否启动
- 检查用户名和密码是否正确
- 检查防火墙是否允许连接

### 5.2 MongoDB连接失败
- 检查MongoDB服务是否启动
- 检查连接字符串是否正确
- 检查防火墙是否允许连接

### 5.3 MongoDB集合为空
- **症状**: 导入脚本显示"集合为空，跳过导入"
- **原因**: 
  - 原始数据库中这两个集合确实没有数据
  - 这是正常现象，不代表导入失败
- **解决方案**:
  - 无需处理，系统会在运行时自动创建集合并写入数据
  - 或者手动创建测试数据

### 5.4 虚拟环境安装失败
- 确保Python版本与导出环境一致
- 确保网络连接正常
- 尝试使用国内镜像源

## 6. 注意事项

- **数据一致性**: 导出和导入过程中确保服务稳定运行
- **备份**: 导入前备份目标环境的数据
- **权限**: 确保有足够的权限执行导入操作
- **版本兼容性**: 确保目标环境的软件版本与导出环境兼容

## 7. MongoDB角色导入说明

MongoDB角色导入是确保系统正常运行的重要环节。导入脚本会自动处理角色的创建和权限分配。如果角色导入失败，请按照以下步骤手动创建角色：

1. **连接到MongoDB**:
   ```powershell
   mongo
   ```

2. **切换到目标数据库**:
   ```javascript
   use chronic_disease
   ```

3. **创建所需角色**:
   ```javascript
   db.createRole({
     role: "healthcare_user",
     privileges: [
       { resource: { db: "chronic_disease", collection: "" }, actions: ["find", "insert", "update", "delete"] }
     ],
     roles: []
   })
   ```

4. **验证角色创建**:
   ```javascript
   db.getRole("healthcare_user")
   ```

## 8. 完整导入流程

1. **准备环境**:
   - 安装Python 3.13+
   - 安装PostgreSQL
   - 安装MongoDB

2. **导入数据**:
   - 导入虚拟环境
   - 导入PostgreSQL数据库
   - 导入MongoDB数据库

3. **启动服务**:
   - 启动PostgreSQL服务
   - 启动MongoDB服务
   - 启动应用程序

4. **验证系统**:
   - 访问 http://localhost:8000
   - 登录系统
   - 检查数据是否完整

## 9. 导出文件说明

| 文件名 | 类型 | 用途 | 位置 |
|-------|------|------|------|
| requirements.txt | 文本文件 | 虚拟环境依赖 | backend/ |
| postgres_dump.json | JSON文件 | PostgreSQL数据库备份 | backend/ |
| mongodb_dump.json | JSON文件 | MongoDB数据库备份 | backend/ |
| import_postgres.py | Python脚本 | PostgreSQL导入工具 | backend/ |
| import_mongodb.py | Python脚本 | MongoDB导入工具 | backend/ |
| export_import_guide.md | Markdown文件 | 导入步骤指南 | 根目录 |

## 10. 技术支持

如果在导入过程中遇到任何问题，请参考以下资源：

- **PostgreSQL文档**: https://www.postgresql.org/docs/
- **MongoDB文档**: https://docs.mongodb.com/
- **Python虚拟环境**: https://docs.python.org/3/library/venv.html

---

**注意**: 本指南适用于系统迁移和部署，确保按照步骤执行以保证系统的正常运行。
