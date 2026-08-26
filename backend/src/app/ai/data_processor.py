"""数据处理模块 - 使用Pandas进行数据清洗和预处理"""
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime


class HealthDataProcessor:
    """健康数据处理器 - 使用Pandas进行数据清洗和预处理"""
    
    def __init__(self):
        self.df = None
    
    def load_data(self, data: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        加载数据到DataFrame
        
        Args:
            data: 健康数据列表，每个元素是一个字典
        
        Returns:
            pd.DataFrame: 加载后的DataFrame
        """
        self.df = pd.DataFrame(data)
        print(f"✓ 数据加载完成，共 {len(self.df)} 条记录")
        return self.df
    
    def clean_data(self) -> pd.DataFrame:
        """
        数据清洗
        
        - 处理缺失值
        - 处理异常值
        - 数据类型转换
        - 去重
        
        Returns:
            pd.DataFrame: 清洗后的DataFrame
        """
        if self.df is None:
            raise ValueError("请先加载数据")
        
        df_clean = self.df.copy()
        
        print("\n=== 开始数据清洗 ===")
        
        # 1. 处理缺失值
        missing_before = df_clean.isnull().sum().sum()
        print(f"  清洗前缺失值数量: {missing_before}")
        
        # 数值列用中位数填充
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        
        # 分类列用众数填充
        categorical_cols = df_clean.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0] if not df_clean[col].mode().empty else 'unknown')
        
        missing_after = df_clean.isnull().sum().sum()
        print(f"  清洗后缺失值数量: {missing_after}")
        
        # 2. 处理异常值（使用IQR方法）
        if 'value' in df_clean.columns:
            Q1 = df_clean['value'].quantile(0.25)
            Q3 = df_clean['value'].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = df_clean[(df_clean['value'] < lower_bound) | (df_clean['value'] > upper_bound)]
            if len(outliers) > 0:
                print(f"  发现 {len(outliers)} 个异常值，已用边界值替换")
                df_clean['value'] = df_clean['value'].clip(lower=lower_bound, upper=upper_bound)
        
        # 3. 数据类型转换
        if 'recorded_at' in df_clean.columns:
            df_clean['recorded_at'] = pd.to_datetime(df_clean['recorded_at'])
        
        # 4. 去重
        duplicates = df_clean.duplicated().sum()
        if duplicates > 0:
            df_clean = df_clean.drop_duplicates()
            print(f"  删除 {duplicates} 条重复记录")
        
        self.df = df_clean
        print(f"✓ 数据清洗完成")
        
        return self.df
    
    def preprocess_data(self) -> pd.DataFrame:
        """
        数据预处理 - 特征工程
        
        - 时间特征提取
        - 数据标准化
        - 特征编码
        
        Returns:
            pd.DataFrame: 预处理后的DataFrame
        """
        if self.df is None:
            raise ValueError("请先加载数据")
        
        df_processed = self.df.copy()
        
        print("\n=== 开始数据预处理 ===")
        
        # 1. 时间特征提取
        if 'recorded_at' in df_processed.columns:
            df_processed['hour'] = df_processed['recorded_at'].dt.hour
            df_processed['day_of_week'] = df_processed['recorded_at'].dt.dayofweek
            df_processed['month'] = df_processed['recorded_at'].dt.month
            df_processed['is_weekend'] = df_processed['day_of_week'].isin([5, 6]).astype(int)
            print("  ✓ 时间特征提取完成")
        
        # 2. 数据标准化（数值特征）
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col not in ['id', 'patient_id', 'hour', 'day_of_week', 'month', 'is_weekend']:
                mean = df_processed[col].mean()
                std = df_processed[col].std()
                if std > 0:
                    df_processed[f'{col}_normalized'] = (df_processed[col] - mean) / std
        print("  ✓ 数据标准化完成")
        
        # 3. 特征编码（分类变量）
        if 'data_type' in df_processed.columns:
            df_processed = pd.get_dummies(df_processed, columns=['data_type'], prefix='type')
            print("  ✓ 分类特征编码完成")
        
        self.df = df_processed
        print(f"✓ 数据预处理完成")
        
        return self.df
    
    def analyze_statistics(self) -> Dict[str, Any]:
        """
        统计分析
        
        Returns:
            Dict: 统计结果
        """
        if self.df is None:
            raise ValueError("请先加载数据")
        
        print("\n=== 统计分析 ===")
        
        stats = {}
        
        # 基本统计
        if 'value' in self.df.columns:
            stats['basic'] = {
                'count': len(self.df),
                'mean': float(self.df['value'].mean()),
                'median': float(self.df['value'].median()),
                'std': float(self.df['value'].std()),
                'min': float(self.df['value'].min()),
                'max': float(self.df['value'].max())
            }
            print(f"  数据量: {stats['basic']['count']}")
            print(f"  平均值: {stats['basic']['mean']:.2f}")
            print(f"  中位数: {stats['basic']['median']:.2f}")
        
        # 按数据类型统计
        if 'data_type' in self.df.columns:
            stats['by_type'] = self.df['data_type'].value_counts().to_dict()
            print(f"  数据类型分布: {stats['by_type']}")
        
        return stats
    
    def get_processed_data(self) -> pd.DataFrame:
        """获取处理后的数据"""
        return self.df
    
    def export_to_csv(self, filepath: str):
        """导出数据到CSV"""
        if self.df is not None:
            self.df.to_csv(filepath, index=False, encoding='utf-8-sig')
            print(f"✓ 数据已导出到: {filepath}")


def example_usage():
    """示例用法"""
    print("=" * 60)
    print("Pandas 数据清洗和预处理示例")
    print("=" * 60)
    
    # 示例数据
    sample_data = [
        {'patient_id': 1, 'data_type': 'blood_pressure', 'value': 120, 'unit': 'mmHg', 'recorded_at': '2024-01-01 08:00:00'},
        {'patient_id': 1, 'data_type': 'blood_pressure', 'value': 130, 'unit': 'mmHg', 'recorded_at': '2024-01-02 08:00:00'},
        {'patient_id': 1, 'data_type': 'blood_sugar', 'value': 5.6, 'unit': 'mmol/L', 'recorded_at': '2024-01-01 09:00:00'},
        {'patient_id': 1, 'data_type': 'heart_rate', 'value': 72, 'unit': 'bpm', 'recorded_at': '2024-01-01 10:00:00'},
        {'patient_id': 1, 'data_type': 'blood_pressure', 'value': 180, 'unit': 'mmHg', 'recorded_at': '2024-01-03 08:00:00'},
        {'patient_id': 1, 'data_type': None, 'value': 75, 'unit': 'bpm', 'recorded_at': '2024-01-04 10:00:00'},
    ]
    
    # 创建处理器
    processor = HealthDataProcessor()
    
    # 加载数据
    processor.load_data(sample_data)
    
    # 数据清洗
    processor.clean_data()
    
    # 数据预处理
    processor.preprocess_data()
    
    # 统计分析
    stats = processor.analyze_statistics()
    
    # 显示处理后的数据
    print("\n=== 处理后的数据前5行 ===")
    print(processor.get_processed_data().head())
    
    print("\n" + "=" * 60)
    print("✓ 数据处理完成！")
    print("=" * 60)


if __name__ == "__main__":
    example_usage()
