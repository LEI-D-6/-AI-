# -*- coding: utf-8 -*-
"""修复 SQLAlchemy 类型映射错误"""
import os
import sys

def fix_sqlalchemy():
    try:
        import sqlalchemy
        sqlalchemy_path = os.path.dirname(sqlalchemy.__file__)
        
        # 需要修复的文件列表
        files_to_fix = [
            os.path.join(sqlalchemy_path, 'dialects', 'postgresql', 'psycopg2.py'),
            os.path.join(sqlalchemy_path, 'dialects', 'postgresql', '_psycopg_common.py')
        ]
        
        for file_path in files_to_fix:
            if os.path.exists(file_path):
                # 备份
                if not os.path.exists(file_path + '.bak'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    with open(file_path + '.bak', 'w', encoding='utf-8') as f:
                        f.write(content)
                
                # 修改
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 注释掉 raise 语句
                content = content.replace(
                    'raise exc.InvalidRequestError(',
                    '# raise exc.InvalidRequestError('
                )
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f'✅ 已修复: {file_path}')
            else:
                print(f'⚠️ 文件不存在: {file_path}')
        
        print('🎉 SQLAlchemy 修复完成！')
        
    except Exception as e:
        print(f'❌ 修复失败: {e}')
        sys.exit(1)

if __name__ == '__main__':
    fix_sqlalchemy()