#!/usr/bin/env python3
"""
导入MongoDB数据库的所有集合、数据和角色
"""
import os
import sys
import json
from pymongo import MongoClient
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 获取MongoDB连接信息
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
MONGO_DB = os.getenv('MONGO_DB', 'healthcare')

# 连接MongoDB
client = MongoClient(MONGO_URL)
db = client[MONGO_DB]

# 导入集合数据
def import_collections(collections_data):
    print("开始导入MongoDB集合数据...")
    
    for collection_name, documents in collections_data.items():
        print(f"处理集合: {collection_name}")
        
        # 获取集合
        collection = db[collection_name]
        
        # 清空集合
        collection.delete_many({})
        
        # 导入数据
        if documents:
            collection.insert_many(documents)
            print(f"成功导入 {len(documents)} 条记录")
        else:
            print("集合为空，跳过导入")

# 导入角色
def import_roles(roles_data):
    print("开始导入MongoDB角色...")
    
    try:
        # 检查是否有角色数据
        if isinstance(roles_data, dict) and 'roles' in roles_data:
            roles = roles_data['roles']
            print(f"准备导入 {len(roles)} 个角色")
            
            for role in roles:
                role_name = role.get('role')
                if role_name:
                    try:
                        # 尝试创建角色
                        db.command('createRole', role)
                        print(f"成功创建角色: {role_name}")
                    except Exception as e:
                        print(f"创建角色 {role_name} 时出错: {e}")
                        print("尝试更新角色...")
                        try:
                            db.command('updateRole', role_name, role)
                            print(f"成功更新角色: {role_name}")
                        except Exception as e2:
                            print(f"更新角色 {role_name} 时出错: {e2}")
        else:
            print("没有角色数据，跳过角色导入")
            
            # 创建默认角色
            print("创建默认角色...")
            try:
                db.command('createRole', {
                    'role': 'healthcare_user',
                    'privileges': [
                        {'resource': {'db': MONGO_DB, 'collection': ''}, 'actions': ['find', 'insert', 'update', 'delete']}
                    ],
                    'roles': []
                })
                print("成功创建默认角色: healthcare_user")
            except Exception as e:
                print(f"创建默认角色时出错: {e}")
    except Exception as e:
        print(f"导入角色时出错: {e}")
        print("将创建默认角色...")
        
        # 创建默认角色
        try:
            db.command('createRole', {
                'role': 'healthcare_user',
                'privileges': [
                    {'resource': {'db': MONGO_DB, 'collection': ''}, 'actions': ['find', 'insert', 'update', 'delete']}
                ],
                'roles': []
            })
            print("成功创建默认角色: healthcare_user")
        except Exception as e2:
            print(f"创建默认角色时出错: {e2}")

# 导入MongoDB数据库
def import_mongodb():
    print("开始导入MongoDB数据库...")
    
    # 读取导出文件
    if not os.path.exists('mongodb_dump.json'):
        print("错误: mongodb_dump.json 文件不存在")
        return
    
    with open('mongodb_dump.json', 'r', encoding='utf-8') as f:
        export_data = json.load(f)
    
    # 导入集合数据
    if 'collections' in export_data:
        import_collections(export_data['collections'])
    else:
        print("没有集合数据，跳过集合导入")
    
    # 导入角色
    if 'roles' in export_data:
        import_roles(export_data['roles'])
    else:
        print("没有角色数据，跳过角色导入")
    
    print("MongoDB数据库导入完成！")

if __name__ == "__main__":
    import_mongodb()
