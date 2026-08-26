"""AI服务核心模块"""
import requests
import json
from typing import Dict, Any, List
from .config import ai_config


class AIService:
    """AI服务基类"""
    def __init__(self):
        pass
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """预测方法
        
        Args:
            data: 输入数据
            
        Returns:
            dict: 预测结果
        """
        raise NotImplementedError


class RiskPredictionService(AIService):
    """风险预测服务"""
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """预测慢性病风险
        
        Args:
            data: 患者数据
            
        Returns:
            dict: 风险预测结果
        """
        # 1. 预处理输入数据
        processed_data = self._preprocess_data(data)
        
        # 2. 调用风险预测模型
        # 由于是模拟环境，返回模拟结果
        risk_score = self._calculate_risk_score(processed_data)
        
        # 3. 后处理预测结果
        result = self._postprocess_result(risk_score)
        
        # 4. 返回预测结果
        return result
    
    def _preprocess_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """预处理输入数据"""
        # 提取关键特征
        age = data.get('age', 0)
        gender = data.get('gender', 'unknown')
        blood_pressure = data.get('blood_pressure', {})
        blood_sugar = data.get('blood_sugar', 0)
        cholesterol = data.get('cholesterol', 0)
        family_history = data.get('family_history', False)
        smoking = data.get('smoking', False)
        exercise = data.get('exercise', False)
        
        return {
            'age': age,
            'gender': 1 if gender == 'male' else 0,
            'blood_pressure_systolic': blood_pressure.get('systolic', 120),
            'blood_pressure_diastolic': blood_pressure.get('diastolic', 80),
            'blood_sugar': blood_sugar,
            'cholesterol': cholesterol,
            'family_history': 1 if family_history else 0,
            'smoking': 1 if smoking else 0,
            'exercise': 1 if exercise else 0
        }
    
    def _calculate_risk_score(self, data: Dict[str, Any]) -> float:
        """计算风险分数"""
        # 基于简单的风险因素计算
        score = 0
        
        # 年龄因素
        if data['age'] > 60:
            score += 3
        elif data['age'] > 45:
            score += 2
        elif data['age'] > 30:
            score += 1
        
        # 血压因素
        systolic = data['blood_pressure_systolic']
        diastolic = data['blood_pressure_diastolic']
        if systolic > 160 or diastolic > 100:
            score += 3
        elif systolic > 140 or diastolic > 90:
            score += 2
        elif systolic > 120 or diastolic > 80:
            score += 1
        
        # 血糖因素
        if data['blood_sugar'] > 11.1:
            score += 3
        elif data['blood_sugar'] > 7.0:
            score += 2
        elif data['blood_sugar'] > 5.6:
            score += 1
        
        # 胆固醇因素
        if data['cholesterol'] > 6.2:
            score += 2
        elif data['cholesterol'] > 5.2:
            score += 1
        
        # 其他因素
        score += data['family_history'] * 2
        score += data['smoking'] * 2
        score -= data['exercise'] * 1
        
        # 归一化到0-100
        max_score = 20
        risk_percentage = min(100, (score / max_score) * 100)
        
        return risk_percentage
    
    def _postprocess_result(self, risk_score: float) -> Dict[str, Any]:
        """后处理预测结果"""
        if risk_score >= 70:
            risk_level = "高"
            recommendation = "建议立即就医，进行详细检查和治疗"
        elif risk_score >= 40:
            risk_level = "中"
            recommendation = "建议定期体检，调整生活方式"
        else:
            risk_level = "低"
            recommendation = "保持健康生活方式，定期体检"
        
        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "factors": {
                "high_risk": self._identify_high_risk_factors(),
                "improvement": self._suggest_improvements()
            }
        }
    
    def _identify_high_risk_factors(self) -> List[str]:
        """识别高风险因素"""
        return ["年龄较大", "血压偏高", "血糖偏高", "家族病史", "吸烟"]
    
    def _suggest_improvements(self) -> List[str]:
        """建议改进措施"""
        return ["保持健康饮食", "规律运动", "戒烟限酒", "定期体检", "控制体重"]


class TreatmentRecommendationService(AIService):
    """治疗方案推荐服务"""
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """推荐治疗方案
        
        Args:
            data: 患者数据
            
        Returns:
            dict: 治疗方案推荐结果
        """
        # 1. 预处理输入数据
        processed_data = self._preprocess_data(data)
        
        # 2. 基于患者数据生成治疗方案
        treatment_plan = self._generate_treatment_plan(processed_data)
        
        # 3. 后处理推荐结果
        result = self._postprocess_result(treatment_plan)
        
        # 4. 返回推荐结果
        return result
    
    def _preprocess_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """预处理输入数据"""
        return {
            'condition': data.get('condition', 'hypertension'),
            'severity': data.get('severity', 'mild'),
            'age': data.get('age', 0),
            'comorbidities': data.get('comorbidities', []),
            'medications': data.get('medications', [])
        }
    
    def _generate_treatment_plan(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """生成治疗方案"""
        condition = data['condition']
        severity = data['severity']
        
        if condition == 'hypertension':
            return self._generate_hypertension_treatment(severity)
        elif condition == 'diabetes':
            return self._generate_diabetes_treatment(severity)
        elif condition == 'hyperlipidemia':
            return self._generate_hyperlipidemia_treatment(severity)
        else:
            return self._generate_generic_treatment()
    
    def _generate_hypertension_treatment(self, severity: str) -> Dict[str, Any]:
        """生成高血压治疗方案"""
        if severity == 'severe':
            return {
                'medications': [
                    "ACE抑制剂（如卡托普利）",
                    "钙通道阻滞剂（如氨氯地平）",
                    "利尿剂（如氢氯噻嗪）"
                ],
                'lifestyle': [
                    "低盐饮食（每日盐摄入量<5g）",
                    "规律运动（每周至少150分钟）",
                    "控制体重",
                    "戒烟限酒"
                ],
                'follow_up': "每2周复诊一次"
            }
        elif severity == 'moderate':
            return {
                'medications': [
                    "ACE抑制剂（如卡托普利）",
                    "钙通道阻滞剂（如氨氯地平）"
                ],
                'lifestyle': [
                    "低盐饮食（每日盐摄入量<5g）",
                    "规律运动（每周至少150分钟）",
                    "控制体重"
                ],
                'follow_up': "每4周复诊一次"
            }
        else:  # mild
            return {
                'medications': [
                    "ACE抑制剂（如卡托普利）"
                ],
                'lifestyle': [
                    "低盐饮食（每日盐摄入量<5g）",
                    "规律运动（每周至少150分钟）"
                ],
                'follow_up': "每8周复诊一次"
            }
    
    def _generate_diabetes_treatment(self, severity: str) -> Dict[str, Any]:
        """生成糖尿病治疗方案"""
        if severity == 'severe':
            return {
                'medications': [
                    "胰岛素注射",
                    "二甲双胍",
                    "DPP-4抑制剂"
                ],
                'lifestyle': [
                    "严格控制碳水化合物摄入",
                    "规律运动（每周至少150分钟）",
                    "定期监测血糖",
                    "控制体重"
                ],
                'follow_up': "每2周复诊一次"
            }
        elif severity == 'moderate':
            return {
                'medications': [
                    "二甲双胍",
                    "磺脲类药物"
                ],
                'lifestyle': [
                    "控制碳水化合物摄入",
                    "规律运动（每周至少150分钟）",
                    "定期监测血糖"
                ],
                'follow_up': "每4周复诊一次"
            }
        else:  # mild
            return {
                'medications': [
                    "二甲双胍"
                ],
                'lifestyle': [
                    "控制碳水化合物摄入",
                    "规律运动（每周至少150分钟）"
                ],
                'follow_up': "每8周复诊一次"
            }
    
    def _generate_hyperlipidemia_treatment(self, severity: str) -> Dict[str, Any]:
        """生成高血脂治疗方案"""
        if severity == 'severe':
            return {
                'medications': [
                    "他汀类药物（如阿托伐他汀）",
                    "依折麦布"
                ],
                'lifestyle': [
                    "低脂肪饮食",
                    "规律运动（每周至少150分钟）",
                    "控制体重"
                ],
                'follow_up': "每4周复诊一次"
            }
        elif severity == 'moderate':
            return {
                'medications': [
                    "他汀类药物（如阿托伐他汀）"
                ],
                'lifestyle': [
                    "低脂肪饮食",
                    "规律运动（每周至少150分钟）"
                ],
                'follow_up': "每8周复诊一次"
            }
        else:  # mild
            return {
                'medications': [],
                'lifestyle': [
                    "低脂肪饮食",
                    "规律运动（每周至少150分钟）"
                ],
                'follow_up': "每12周复诊一次"
            }
    
    def _generate_generic_treatment(self) -> Dict[str, Any]:
        """生成通用治疗方案"""
        return {
            'medications': [],
            'lifestyle': [
                "健康饮食",
                "规律运动",
                "充足睡眠",
                "减少压力"
            ],
            'follow_up': "每8周复诊一次"
        }
    
    def _postprocess_result(self, treatment_plan: Dict[str, Any]) -> Dict[str, Any]:
        """后处理推荐结果"""
        return {
            "treatment_plan": treatment_plan,
            "adherence_tips": [
                "按时服药，不要自行停药",
                "定期复查，监测病情变化",
                "遵循医生建议的生活方式调整",
                "如有不适，及时就医"
            ],
            "expected_outcome": "通过规范治疗和生活方式调整，病情有望得到有效控制"
        }


class HealthQAService(AIService):
    """健康问题问答服务"""
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """回答健康问题
        
        Args:
            data: 问题数据
            
        Returns:
            dict: 问答结果
        """
        # 1. 处理用户问题
        question = data.get('question', '')
        
        # 2. 调用DeepSeek API
        answer = self._call_deepseek_api(question)
        
        # 3. 后处理问答结果
        result = self._postprocess_result(question, answer)
        
        # 4. 返回问答结果
        return result
    
    def _call_deepseek_api(self, question: str) -> str:
        """调用DeepSeek API"""
        import requests
        import time
        
        print(f"开始调用DeepSeek API，问题长度: {len(question)}")
        print(f"问题内容: {question}")
        
        # DeepSeek API配置
        api_config = {
            'endpoint': 'https://api.deepseek.com/v1/chat/completions',
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-6d1b9c7be2ae41419b0ca45a8b11c795'
            },
            'data': {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一个专业的健康助手，专注于慢性病管理和健康咨询。请提供专业、准确的健康建议，基于医学知识和最佳实践。回答字数请控制在900字以内。'
                    },
                    {
                        'role': 'user',
                        'content': question
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1500
            }
        }
        
        # 添加重试机制
        max_retries = 3
        retry_delay = 2
        
        for retry in range(max_retries):
            print(f"尝试API端点: {api_config['endpoint']}，方法: {api_config['method']}，重试次数: {retry+1}/{max_retries}")
            print(f"请求头: {api_config['headers']}")
            print(f"请求数据: {api_config['data']}")
            
            # 发送请求
            response = requests.post(
                api_config['endpoint'],
                headers=api_config['headers'],
                json=api_config['data'],
                timeout=60
            )
            
            print(f"响应状态码: {response.status_code}")
            print(f"响应头: {dict(response.headers)}")
            print(f"响应内容: {response.text}")
            
            if response.ok:
                # 解析响应
                data = response.json()
                print(f"响应JSON: {data}")
                
                # 检查是否有错误
                if 'error' in data:
                    print(f"API返回错误: {data['error']}")
                    if retry < max_retries - 1:
                        print(f"等待 {retry_delay} 秒后重试...")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # 指数退避
                        continue
                    else:
                        raise Exception(f"API返回错误: {data['error']}")
                
                # 获取回答
                if 'choices' in data and data['choices'] and 'message' in data['choices'][0]:
                    answer = data['choices'][0]['message']['content']
                    print(f"成功获取回答，长度: {len(answer)}")
                    print(f"回答内容: {answer[:100]}...")
                    # 限制回答长度，避免内存溢出
                    if len(answer) > 1000:
                        answer = answer[:1000] + "...\n\n（回答已截断，如需完整回答请简化问题）"
                    return answer
                else:
                    raise Exception(f"API响应格式不正确: {data}")
            else:
                print(f"API调用失败: {response.status_code} - {response.text}")
                if retry < max_retries - 1:
                    print(f"等待 {retry_delay} 秒后重试...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # 指数退避
                    continue
                else:
                    raise Exception(f"API调用失败: {response.status_code} - {response.text}")
        
        # 如果所有重试都失败，抛出异常
        raise Exception("DeepSeek API调用失败，所有重试都已尝试")
    
    def _get_mock_answer(self, question: str) -> str:
        """获取模拟回答"""
        mock_answers = {
            '高血压': '高血压患者应注意：1. 低盐饮食，每日盐摄入量不超过5克；2. 规律运动，每周至少150分钟；3. 控制体重；4. 戒烟限酒；5. 按医嘱服药。',
            '糖尿病': '糖尿病患者应注意：1. 控制碳水化合物摄入；2. 规律运动；3. 定期监测血糖；4. 按医嘱服药；5. 保持健康体重。',
            '高血脂': '高血脂患者应注意：1. 低脂肪饮食；2. 增加膳食纤维摄入；3. 规律运动；4. 控制体重；5. 按医嘱服药。',
            '健康饮食': '健康饮食应包括：1. 多吃蔬菜水果；2. 适量摄入蛋白质；3. 控制脂肪和糖的摄入；4. 多喝水；5. 规律饮食。'
        }
        
        # 匹配关键词
        for keyword, answer in mock_answers.items():
            if keyword in question:
                return answer
        
        # 默认回答
        return "作为您的健康助手，我建议您保持健康的生活方式，包括均衡饮食、规律运动、充足睡眠和定期体检。如果您有具体的健康问题，请咨询专业医生。"
    
    def _postprocess_result(self, question: str, answer: str) -> Dict[str, Any]:
        """后处理问答结果"""
        return {
            "question": question,
            "answer": answer,
            "source": "DeepSeek API",
            "confidence": 0.9,
            "follow_up_questions": self._generate_follow_up_questions(question)
        }
    
    def _generate_follow_up_questions(self, question: str) -> List[str]:
        """生成后续问题建议"""
        if '高血压' in question:
            return [
                "高血压患者的饮食注意事项有哪些？",
                "如何正确测量血压？",
                "高血压患者适合哪些运动？"
            ]
        elif '糖尿病' in question:
            return [
                "糖尿病患者的饮食控制方法？",
                "如何正确监测血糖？",
                "糖尿病患者的运动建议？"
            ]
        elif '高血脂' in question:
            return [
                "高血脂患者的饮食建议？",
                "如何降低胆固醇水平？",
                "高血脂的危害有哪些？"
            ]
        else:
            return [
                "如何保持健康的生活方式？",
                "常见慢性疾病的预防方法？",
                "定期体检的重要性？"
            ]


class HealthDataAnalysisService(AIService):
    """健康数据分析服务"""
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """分析健康数据
        
        Args:
            data: 健康数据
            
        Returns:
            dict: 分析结果
        """
        # 1. 处理输入数据
        health_data = data.get('health_data', [])
        patient_info = data.get('patient_info', {})
        
        # 2. 分析健康数据
        analysis_result = self._analyze_health_data(health_data, patient_info)
        
        # 3. 生成健康评估
        health_assessment = self._generate_health_assessment(analysis_result)
        
        # 4. 后处理分析结果
        result = self._postprocess_result(health_assessment)
        
        # 5. 返回分析结果
        return result
    
    def _analyze_health_data(self, health_data: List[Dict[str, Any]], patient_info: Dict[str, Any]) -> Dict[str, Any]:
        """分析健康数据"""
        # 构建健康数据的文本描述
        health_data_text = '患者健康数据:\n'
        for item in health_data:
            data_type = item.get('data_type')
            value = item.get('value')
            unit = item.get('unit')
            recorded_at = item.get('recorded_at')
            health_data_text += f"{data_type}: {value} {unit} (记录时间: {recorded_at})\n"
        
        # 调用百度千问API
        model_response = self._call_qianwen_api(health_data_text)
        
        # 按数据类型分组
        data_by_type = {}
        for data_item in health_data:
            data_type = data_item.get('data_type')
            if data_type not in data_by_type:
                data_by_type[data_type] = []
            data_by_type[data_type].append(data_item)
        
        # 分析每种数据类型
        analysis = {}
        for data_type, items in data_by_type.items():
            if data_type == 'blood_pressure':
                analysis[data_type] = self._analyze_blood_pressure(items)
            elif data_type == 'blood_sugar':
                analysis[data_type] = self._analyze_blood_sugar(items)
            elif data_type == 'heart_rate':
                analysis[data_type] = self._analyze_heart_rate(items)
            elif data_type == 'cholesterol':
                analysis[data_type] = self._analyze_cholesterol(items)
            elif data_type == 'weight':
                analysis[data_type] = self._analyze_generic_data(items)
            elif data_type == 'height':
                analysis[data_type] = self._analyze_generic_data(items)
            else:
                analysis[data_type] = self._analyze_generic_data(items)
        
        return analysis
    
    def _analyze_blood_pressure(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析血压数据"""
        values = [item.get('value') for item in items if item.get('value')]
        if not values:
            return {'status': '无数据', 'advice': '请定期测量血压'}
        
        # 计算平均值
        avg_value = sum(values) / len(values)
        
        # 分析血压状态
        if avg_value < 90:
            status = '低血压'
            advice = '建议增加盐分摄入，避免长时间站立，定期监测血压'
        elif 90 <= avg_value < 120:
            status = '正常血压'
            advice = '保持健康生活方式，定期监测血压'
        elif 120 <= avg_value < 140:
            status = '血压偏高'
            advice = '建议减少盐分摄入，增加运动，定期监测血压'
        else:
            status = '高血压'
            advice = '建议立即就医，遵循医生建议进行治疗，定期监测血压'
        
        return {
            'status': status,
            'average': round(avg_value, 2),
            'latest': values[-1],
            'advice': advice
        }
    
    def _analyze_blood_sugar(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析血糖数据"""
        values = [item.get('value') for item in items if item.get('value')]
        if not values:
            return {'status': '无数据', 'advice': '请定期测量血糖'}
        
        # 计算平均值
        avg_value = sum(values) / len(values)
        
        # 分析血糖状态
        if avg_value < 3.9:
            status = '低血糖'
            advice = '建议随身携带糖果，按时进食，定期监测血糖'
        elif 3.9 <= avg_value < 6.1:
            status = '正常血糖'
            advice = '保持健康生活方式，定期监测血糖'
        elif 6.1 <= avg_value < 7.0:
            status = '血糖偏高'
            advice = '建议控制碳水化合物摄入，增加运动，定期监测血糖'
        else:
            status = '高血糖'
            advice = '建议立即就医，遵循医生建议进行治疗，定期监测血糖'
        
        return {
            'status': status,
            'average': round(avg_value, 2),
            'latest': values[-1],
            'advice': advice
        }
    
    def _analyze_heart_rate(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析心率数据"""
        values = [item.get('value') for item in items if item.get('value')]
        if not values:
            return {'status': '无数据', 'advice': '请定期测量心率'}
        
        # 计算平均值
        avg_value = sum(values) / len(values)
        
        # 分析心率状态
        if avg_value < 60:
            status = '心动过缓'
            advice = '建议咨询医生，定期监测心率'
        elif 60 <= avg_value < 100:
            status = '正常心率'
            advice = '保持健康生活方式，定期监测心率'
        else:
            status = '心动过速'
            advice = '建议减少咖啡因摄入，避免剧烈运动，定期监测心率'
        
        return {
            'status': status,
            'average': round(avg_value, 2),
            'latest': values[-1],
            'advice': advice
        }
    
    def _analyze_cholesterol(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析胆固醇数据"""
        values = [item.get('value') for item in items if item.get('value')]
        if not values:
            return {'status': '无数据', 'advice': '请定期检测胆固醇'}
        
        # 计算平均值
        avg_value = sum(values) / len(values)
        
        # 分析胆固醇状态
        if avg_value < 5.2:
            status = '正常胆固醇'
            advice = '保持健康生活方式，定期检测胆固醇'
        elif 5.2 <= avg_value < 6.2:
            status = '胆固醇偏高'
            advice = '建议低脂肪饮食，增加运动，定期检测胆固醇'
        else:
            status = '高胆固醇'
            advice = '建议立即就医，遵循医生建议进行治疗，定期检测胆固醇'
        
        return {
            'status': status,
            'average': round(avg_value, 2),
            'latest': values[-1],
            'advice': advice
        }
    
    def _analyze_generic_data(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析通用健康数据"""
        values = [item.get('value') for item in items if item.get('value')]
        if not values:
            return {'status': '无数据', 'advice': '请定期监测数据'}
        
        # 计算平均值
        avg_value = sum(values) / len(values)
        
        return {
            'status': '正常',
            'average': round(avg_value, 2),
            'latest': values[-1],
            'advice': '保持健康生活方式，定期监测数据'
        }
    
    def _generate_health_assessment(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """生成健康评估"""
        # 汇总分析结果
        health_issues = []
        for data_type, result in analysis.items():
            if result.get('status') not in ['正常', '无数据']:
                health_issues.append(f"{data_type}: {result.get('status')}")
        
        # 生成健康评估
        if not health_issues:
            assessment = "您的健康状况良好，请继续保持健康的生活方式。"
            risk_level = "低"
        elif len(health_issues) == 1:
            assessment = f"您有一项健康指标异常：{health_issues[0]}。建议及时调整生活方式并定期监测。"
            risk_level = "中"
        else:
            assessment = f"您有多项健康指标异常：{', '.join(health_issues)}。建议立即就医并遵循医生建议进行治疗。"
            risk_level = "高"
        
        return {
            'assessment': assessment,
            'risk_level': risk_level,
            'detailed_analysis': analysis
        }
    
    def _postprocess_result(self, health_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """后处理分析结果"""
        return {
            "health_assessment": health_assessment['assessment'],
            "risk_level": health_assessment['risk_level'],
            "detailed_analysis": health_assessment['detailed_analysis'],
            "recommendations": self._generate_recommendations(health_assessment['risk_level']),
            "follow_up": self._generate_follow_up_advice(health_assessment['risk_level'])
        }
    
    def _generate_recommendations(self, risk_level: str) -> List[str]:
        """生成健康建议"""
        if risk_level == "高":
            return [
                "立即就医，遵循医生建议进行治疗",
                "严格控制饮食，避免高盐、高糖、高脂肪食物",
                "适当运动，避免剧烈运动",
                "定期监测健康数据",
                "保持充足睡眠，减少压力"
            ]
        elif risk_level == "中":
            return [
                "调整生活方式，改善饮食习惯",
                "增加运动，保持健康体重",
                "定期监测健康数据",
                "保持充足睡眠，减少压力"
            ]
        else:
            return [
                "保持健康的生活方式",
                "定期体检，监测健康状况",
                "均衡饮食，适量运动",
                "保持充足睡眠，减少压力"
            ]
    
    def _generate_follow_up_advice(self, risk_level: str) -> str:
        """生成后续建议"""
        if risk_level == "高":
            return "建议每周监测健康数据，并在1-2周内就医复诊。"
        elif risk_level == "中":
            return "建议每两周监测健康数据，并在1个月内就医复诊。"
        else:
            return "建议每月监测健康数据，每年进行一次全面体检。"
    
    def _call_qianwen_api(self, health_data_text: str) -> str:
        """调用百度千问API"""
        import requests
        import json
        
        print(f"开始调用百度千问API")
        print(f"健康数据文本长度: {len(health_data_text)}")
        
        # 使用配置中的API密钥和URL
        API_KEY = ai_config.QIANWEN_API_KEY
        url = ai_config.QIANWEN_API_URL
        
        # 首先获取access token
        token_url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={API_KEY}&client_secret={ai_config.BAIDU_SECRET_KEY}"
        
        try:
            # 获取access token
            token_response = requests.get(token_url)
            token_data = token_response.json()
            
            if "access_token" not in token_data:
                return f"获取access token失败：{token_data}"
            
            access_token = token_data["access_token"]
            
            # 构建请求参数
            headers = {
                "Content-Type": "application/json"
            }
            
            data = {
                "messages": [
                    {"role": "system", "content": "你是一个专业的健康数据分析助手，负责分析患者的健康数据并提供专业的健康评估和建议。请基于提供的健康数据，生成详细的健康分析报告，包括健康评估、风险等级、详细分析、健康建议和后续建议。"},
                    {"role": "user", "content": f"请分析以下健康数据并生成详细的健康分析报告：\n{health_data_text}"}
                ],
                "temperature": 0.7,
                "max_tokens": 2048
            }
            
            # 发送请求
            response = requests.post(f"{url}?access_token={access_token}", headers=headers, json=data)
            print("状态码:", response.status_code)
            print("返回内容:", response.text)
            
            if response.status_code == 200:
                result = response.json()
                if "result" in result:
                    return result["result"]
                else:
                    return f"API响应格式不正确：{result}"
            else:
                return f"调用失败：{response.status_code} → {response.text}"
                
        except Exception as e:
            print("异常：", str(e))
            return f"异常：{str(e)}"
    
    def _parse_model_response(self, model_response: str) -> Dict[str, Any]:
        """解析模型响应，构建分析结果"""
        # 这里简单返回一个空的分析结果
        # 实际应用中，应该根据模型的响应格式进行解析
        # 注意：这个方法现在不再需要，因为我们直接使用模型的原始响应
        return {}


class AIServiceFactory:
    """AI服务工厂类"""
    @staticmethod
    def get_service(service_type: str) -> AIService:
        """获取AI服务实例
        
        Args:
            service_type: 服务类型
            
        Returns:
            AIService: AI服务实例
        """
        if service_type == "risk_prediction":
            return RiskPredictionService()
        elif service_type == "treatment_recommendation":
            return TreatmentRecommendationService()
        elif service_type == "health_qa":
            return HealthQAService()
        elif service_type == "health_data_analysis":
            return HealthDataAnalysisService()
        else:
            raise ValueError(f"Unknown service type: {service_type}")