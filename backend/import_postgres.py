# -*- coding: utf-8 -*-

#!/usr/bin/env python3
"""
导入PostgreSQL数据库的表结构和数据
"""
import os
import sys
import json
from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, Float, Boolean, Date, DateTime, Text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 获取数据库连接信息（使用与.env文件匹配的变量名）
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD', '12345678')
DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_PORT = os.getenv('POSTGRES_PORT', '5432')
DB_NAME = os.getenv('POSTGRES_DB', 'postgres')

# 创建数据库引擎
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 简化类型处理
def get_sqlalchemy_type(postgres_type):
    if 'VARCHAR' in postgres_type:
        return String
    elif 'INTEGER' in postgres_type:
        return Integer
    elif 'FLOAT' in postgres_type or 'REAL' in postgres_type:
        return Float
    elif 'BOOLEAN' in postgres_type:
        return Boolean
    elif 'DATE' in postgres_type:
        return Date
    elif 'TIMESTAMP' in postgres_type or 'DATETIME' in postgres_type:
        return DateTime
    elif 'TEXT' in postgres_type:
        return Text
    else:
        return String  # 默认类型

# 导入表结构和数据
def import_postgres():
    print("开始导入PostgreSQL数据库...")
    
    # 读取导出文件
    if not os.path.exists('postgres_dump.json'):
        print("错误: postgres_dump.json 文件不存在")
        return
    
    with open('postgres_dump.json', 'r', encoding='utf-8') as f:
        export_data = json.load(f)
    
    # 获取表数据
    tables_data = export_data.get('tables', {})
    
    # 创建元数据
    metadata = MetaData()
    
    # 遍历所有表
    for table_name, table_info in tables_data.items():
        print(f"处理表: {table_name}")
        
        # 获取表结构
        columns = table_info.get('structure', [])
        
        # 创建表对象
        table_columns = []
        for column in columns:
            col_name = column['name']
            col_type = column['type']
            nullable = column['nullable']
            
            # 映射类型
            original_type = col_type
            col_type = get_sqlalchemy_type(col_type)
            print(f"类型映射: {original_type} -> {col_type}")
            
            # 处理主键
            if col_name == 'id':
                table_columns.append(Column(col_name, col_type, primary_key=True))
            else:
                table_columns.append(Column(col_name, col_type, nullable=nullable))
        
        # 创建表
        table = Table(table_name, metadata, *table_columns)
        
        # 检查表是否存在
        if table_name in metadata.tables:
            # 删除表
            table.drop(engine, checkfirst=True)
        
        # 创建表
        table.create(engine)
        print(f"成功创建表: {table_name}")
        
        # 导入数据
        data = table_info.get('data', [])
        if data:
            with engine.connect() as connection:
                connection.execute(table.insert(), data)
                connection.commit()
            print(f"成功导入 {len(data)} 条记录")
        else:
            print("表数据为空，跳过导入")
    
    print("PostgreSQL数据库导入完成！")

if __name__ == "__main__":
    import_postgres()

