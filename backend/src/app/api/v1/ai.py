"""AI服务模块API路由"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ...core.database import get_db
from .auth import get_current_active_user
from ...models.user import User
from ...ai.services import AIServiceFactory

router = APIRouter()


@router.post("/risk-prediction")
async def predict_risk(patient_data: Dict[str, Any], current_user: User = Depends(get_current_active_user)):
    """慢性病风险预测
    
    Args:
        patient_data: 患者数据
        current_user: 当前活跃用户
        
    Returns:
        dict: 风险预测结果
    """
    # 1. 验证患者数据
    if not patient_data:
        raise HTTPException(status_code=400, detail="患者数据不能为空")
    
    # 2. 调用风险预测模型
    try:
        service = AIServiceFactory.get_service("risk_prediction")
        result = service.predict(patient_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"风险预测失败: {str(e)}")
    
    # 3. 返回预测结果
    return result


@router.post("/treatment-recommendation")
async def recommend_treatment(patient_data: Dict[str, Any], current_user: User = Depends(get_current_active_user)):
    """治疗方案推荐
    
    Args:
        patient_data: 患者数据
        current_user: 当前活跃用户
        
    Returns:
        dict: 治疗方案推荐结果
    """
    # 1. 验证患者数据
    if not patient_data:
        raise HTTPException(status_code=400, detail="患者数据不能为空")
    
    # 2. 调用治疗方案推荐模型
    try:
        service = AIServiceFactory.get_service("treatment_recommendation")
        result = service.predict(patient_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"治疗方案推荐失败: {str(e)}")
    
    # 3. 返回推荐结果
    return result


@router.post("/health-qa")
async def health_qa(question: Dict[str, str], current_user: User = Depends(get_current_active_user)):
    """健康问题问答
    
    Args:
        question: 健康问题
        current_user: 当前活跃用户
        
    Returns:
        dict: 问答结果
    """
    # 1. 处理用户问题
    if not question or "question" not in question:
        raise HTTPException(status_code=400, detail="问题不能为空")
    
    # 2. 调用问答模型
    try:
        service = AIServiceFactory.get_service("health_qa")
        result = service.predict(question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问答失败: {str(e)}")
    
    # 3. 返回问答结果
    return result


@router.post("/data-analysis")
async def analyze_data(data: Dict[str, Any], current_user: User = Depends(get_current_active_user)):
    """健康数据分析 - 使用 DeepSeek API"""
    if not data:
        raise HTTPException(status_code=400, detail="健康数据不能为空")
    
    try:
        import requests
        import os
        
        health_data = data.get('health_data', [])
        patient_info = data.get('patient_info', {})
        
        text_lines = ["请分析以下患者的健康数据："]
        if patient_info:
            text_lines.append(f"患者: {patient_info.get('name', '未知')}")
        for item in health_data:
            text_lines.append(f"{item.get('data_type', '')}: {item.get('value', '')} {item.get('unit', '')}")
        
        health_text = '\n'.join(text_lines)
        
        prompt = f"""你是一位专业的健康管理专家，请分析以下患者的健康数据，给出专业的评估和建议。

{health_text}

请用纯文本格式回复，不要使用任何 Markdown 格式符号（如 *、#、-、` 等）。
直接以自然段落的形式输出分析内容。"""
        
        api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-6b4b8259f83940f9b0985f5c2153b129')
        api_url = 'https://api.deepseek.com/v1/chat/completions'
        
        headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
        request_data = {
            'model': 'deepseek-chat',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.3,
            'max_tokens': 500
        }
        
        response = requests.post(api_url, headers=headers, json=request_data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            return {"analysis": content}
        else:
            raise Exception(f"API 错误: {response.text}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据分析失败: {str(e)}")

# 百度云密钥
API_KEY = "tKMWZXh2vZpBlWWgLxYO6ZvY"
SECRET_KEY = "s08EPu3JqgqmNREeywrowk6WBGdScfXo"

# 营养数据库（热量：kcal / 每100g）
nutrition_map = {
    "苹果": {"calorie": 52, "protein": 0.3, "fat": 0.2, "carb": 14.0},
    "香蕉": {"calorie": 89, "protein": 1.1, "fat": 0.3, "carb": 23.0},
    "橙子": {"calorie": 47, "protein": 0.9, "fat": 0.2, "carb": 12.0},
    "梨": {"calorie": 57, "protein": 0.4, "fat": 0.2, "carb": 15.0},
    "西瓜": {"calorie": 30, "protein": 0.6, "fat": 0.2, "carb": 8.0},
    "番茄": {"calorie": 18, "protein": 0.9, "fat": 0.2, "carb": 3.9},
    "黄瓜": {"calorie": 16, "protein": 0.7, "fat": 0.1, "carb": 3.6},
    "鸡蛋": {"calorie": 155, "protein": 13, "fat": 11, "carb": 1.1},
    "米饭": {"calorie": 130, "protein": 2.7, "fat": 0.3, "carb": 28},
    "面条": {"calorie": 138, "protein": 4.5, "fat": 0.5, "carb": 28},
    "馒头": {"calorie": 223, "protein": 7.0, "fat": 1.1, "carb": 45},
    "宫保鸡丁": {"calorie": 190, "protein": 18, "fat": 10, "carb": 8},
    "鱼香肉丝": {"calorie": 185, "protein": 12, "fat": 11, "carb": 9},
    "水煮肉": {"calorie": 250, "protein": 16, "fat": 20, "carb": 4},
    "炸鸡": {"calorie": 297, "protein": 20, "fat": 21, "carb": 10},
    "薯条": {"calorie": 298, "protein": 4.0, "fat": 17, "carb": 35},
    "汉堡": {"calorie": 250, "protein": 12, "fat": 10, "carb": 30},
    "墨西哥卷饼": {"calorie": 220, "protein": 10, "fat": 8, "carb": 28},
    "鸡肉卷": {"calorie": 210, "protein": 12, "fat": 7, "carb": 25},
    "卷饼": {"calorie": 200, "protein": 9, "fat": 7, "carb": 26},
    "披萨": {"calorie": 266, "protein": 11, "fat": 10, "carb": 30},
}

# 高糖水果（糖尿病需注意）
high_sugar_fruits = {"香蕉", "荔枝", "榴莲", "芒果", "龙眼", "葡萄"}

# 获取access_token
def get_access_token():
    url = "https://aip.baidubce.com/oauth/2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": API_KEY,
        "client_secret": SECRET_KEY
    }
    try:
        import requests
        res = requests.post(url, data=data)
        return res.json().get("access_token")
    except Exception as e:
        print(f"【获取token失败】{str(e)}")
        return None

# 调用deepseek API获取营养信息和健康分析
def get_deepseek_analysis(food_name, nutrition, user_health):
    try:
        # deepseek API配置
        api_key = "sk-6b4b8259f83940f9b0985f5c2153b129"
        url = "https://api.deepseek.com/chat/completions"
        
        # 构建请求体
        health_info = ""
        if user_health.get("diabetes"):
            health_info += "糖尿病，"
        if user_health.get("hypertension"):
            health_info += "高血压，"
        if user_health.get("gout"):
            health_info += "痛风，"
        if user_health.get("allergies"):
            health_info += f"对{', '.join(user_health.get('allergies'))}过敏，"
        
        if health_info:
            health_info = health_info.rstrip("，")
        else:
            health_info = "无特殊健康问题"
        
        # 构建提示词，要求包含详细的营养信息
        prompt = f"你是一位专业的营养师，请根据以下信息分析食物是否适合患者食用，并提供详细的健康建议。\n\n食物名称：{food_name}\n患者健康状况：{health_info}\n\n请提供：\n1. 食物的详细营养成分（热量、蛋白质、脂肪、碳水化合物，单位为kcal/100g或g/100g）\n2. 食物是否适合患者食用\n3. 适合或不适合的原因\n4. 具体的食用建议\n5. 注意事项\n\n要求：回答简洁明了，控制在200字以内，不要使用任何引导性语言，直接给出分析结果。"
        
        # 发送请求
        import requests
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 200
        }
        
        print(f"【deepseek API请求】URL: {url}")
        print(f"【deepseek API请求】Headers: {headers}")
        print(f"【deepseek API请求】Data: {data}")
        
        response = requests.post(url, headers=headers, json=data, timeout=10)
        print(f"【deepseek API响应】Status Code: {response.status_code}")
        print(f"【deepseek API响应】Content: {response.text}")
        
        response_json = response.json()
        print(f"【deepseek API响应】JSON: {response_json}")
        
        # 提取回复
        if "choices" in response_json and len(response_json["choices"]) > 0:
            return response_json["choices"][0]["message"]["content"]
        else:
            return "无法获取健康分析，请咨询专业医生。"
    except Exception as e:
        print(f"【deepseek API调用失败】{str(e)}")
        return f"无法获取健康分析，错误：{str(e)}"

@router.post("/analyze-food")
async def analyze_food(data: Dict[str, Any], current_user: User = Depends(get_current_active_user)):
    """食物分析
    
    Args:
        data: 包含图片base64和健康数据的请求数据
        current_user: 当前活跃用户
        
    Returns:
        dict: 食物分析结果
    """
    print("【接收到食物分析请求】")
    print("【请求数据】", data)
    
    # 1. 验证请求数据
    if not data:
        print("【请求数据为空】")
        raise HTTPException(status_code=400, detail="请求数据不能为空")
    
    if "image" not in data:
        print("【图片数据为空】")
        raise HTTPException(status_code=400, detail="图片数据不能为空")
    
    # 2. 清洗图片Base64，100%解决百度识别失败
    image_base64 = data["image"].strip()  # 去空格
    
    # 2.1 标准Base64处理（兼容所有前端）
    if "base64," in image_base64:
        image_base64 = image_base64.split(",")[1]
    
    # 2.2 只保留纯图片数据（百度强制要求）
    image_base64 = image_base64.strip()
    print(f"【清洗后图片Base64长度】{len(image_base64)}")
    
    # 3. 调用百度菜品识别API
    import requests
    import base64
    
    # 菜品识别 + 健康建议
    def analyze_food_impl(image_base64, user_health):
        try:
            token = get_access_token()
            if not token:
                print("【获取token失败】")
                return {"code": 500, "msg": "获取token失败"}

            # ==========================
            # 【核心：优先调用菜品识别】
            # ==========================
            dish_api_url = f"https://aip.baidubce.com/rest/2.0/image-classify/v2/dish?access_token={token}"
            dish_data = {"image": image_base64, "top_num": 5}
            # 正确：直接使用data传参，不设置headers
            dish_res = requests.post(dish_api_url, data=dish_data).json()
            print(f"【菜品识别返回】: {dish_res}")

            # 解析菜品识别结果
            final_result = None
            
            # 检查菜品识别是否成功
            if "result" in dish_res and len(dish_res["result"]) > 0:
                # 优先选择不是「非菜」的结果，进一步降低置信度阈值以提高识别率
                for item in dish_res["result"]:
                    if item.get("name") != "非菜" and float(item.get("probability", 0)) > 0.01:
                        final_result = item
                        print(f"【菜品识别成功】: {final_result.get('name')} (置信度: {final_result.get('probability')})")
                        break
                
                # 如果没有找到符合条件的结果，选择置信度最高的非「非菜」结果
                if not final_result:
                    for item in dish_res["result"]:
                        if item.get("name") != "非菜":
                            final_result = item
                            print(f"【菜品识别成功】: {final_result.get('name')} (置信度: {final_result.get('probability')})")
                            break

            # 不再使用植物识别API，避免返回不符合的结果

            # ==========================
            # 【最终判断：两个接口都失败】
            # ==========================
            if not final_result:
                print("【识别失败】两个接口都未识别到食物")
                return {"code": 400, "msg": "未识别到食物"}

            # 解析最终识别结果
            food_name = final_result.get("name", "未知食物")
            # 植物识别API返回的置信度字段是score，菜品识别API返回的是probability
            prob = float(final_result.get("score", final_result.get("probability", 0)))

            # 获取营养信息
            nutrition = nutrition_map.get(food_name, {"calorie": "未知", "protein": "未知", "fat": "未知", "carb": "未知"})

            # 调用deepseek API获取健康分析
            deepseek_analysis = get_deepseek_analysis(food_name, nutrition, user_health)

            # 健康建议
            can_eat = True
            risk = "安全"
            reason = "无禁忌"
            suggestion = "可正常食用"

            # 糖尿病患者建议
            if user_health.get("diabetes"):
                if food_name in high_sugar_fruits:
                    risk = "需控制"
                    reason = "高糖水果"
                    suggestion = "建议少量食用"
                elif nutrition.get("calorie", 0) > 300:
                    risk = "需控制"
                    reason = "高热量食物"
                    suggestion = "建议控制摄入量"

            # 高血压患者建议
            if user_health.get("hypertension"):
                if food_name in ["炸鸡", "薯条", "汉堡"]:
                    risk = "需控制"
                    reason = "高盐高脂肪食物"
                    suggestion = "建议减少食用"

            # 过敏检查
            allergies = user_health.get("allergies", [])
            for allergy in allergies:
                if allergy in food_name:
                    can_eat = False
                    risk = "禁止食用"
                    reason = f"含有过敏原: {allergy}"
                    suggestion = "严禁食用"
                    break

            print("【最终识别结果】", food_name)
            return {
                "code": 200,
                "data": {
                    "food": food_name,
                    "confidence": f"{round(prob*100, 2)}%",
                    "calorie": nutrition["calorie"],
                    "protein": nutrition["protein"],
                    "fat": nutrition["fat"],
                    "carb": nutrition["carb"],
                    "can_eat": can_eat,
                    "risk": risk,
                    "reason": reason,
                    "suggestion": suggestion,
                    "deepseek_analysis": deepseek_analysis
                }
            }

        except Exception as e:
            print(f"【服务器报错】{str(e)}")
            return {"code": 500, "msg": f"错误：{str(e)}"}
    
    try:
        # 准备健康数据
        health_data = data.get("health_data", {})
        user_health = {
            "diabetes": False,
            "gout": False,
            "hypertension": False,
            "allergies": [],
            "blood_sugar": 5.6,
            "blood_urate": 360,
            "blood_pressure": (120, 80)
        }
        
        # 从健康数据中提取关键信息
        if health_data:
            # 检查是否有血糖数据
            if "blood_sugar" in health_data and isinstance(health_data["blood_sugar"], list) and len(health_data["blood_sugar"]) > 0:
                try:
                    latest_blood_sugar = max(health_data["blood_sugar"], key=lambda x: x.get("recorded_at", ""))
                    user_health["blood_sugar"] = latest_blood_sugar.get("value", 5.6)
                    if user_health["blood_sugar"] > 7.0:
                        user_health["diabetes"] = True
                except Exception as e:
                    print(f"处理血糖数据失败: {str(e)}")
            
            # 检查是否有血压数据
            if "blood_pressure" in health_data and isinstance(health_data["blood_pressure"], list) and len(health_data["blood_pressure"]) > 0:
                try:
                    latest_blood_pressure = max(health_data["blood_pressure"], key=lambda x: x.get("recorded_at", ""))
                    user_health["blood_pressure"] = (latest_blood_pressure.get("value", 120), 80)
                    if user_health["blood_pressure"][0] > 140:
                        user_health["hypertension"] = True
                except Exception as e:
                    print(f"处理血压数据失败: {str(e)}")
        
        # 调用分析函数
        print("【调用分析函数】")
        result = analyze_food_impl(data["image"], user_health)
        
        # 3. 返回分析结果
        print("【返回分析结果】", result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"食物分析失败: {str(e)}")

@router.post("/analyze-fruit")
async def analyze_fruit(data: Dict[str, Any], current_user: User = Depends(get_current_active_user)):
    """果蔬识别
    
    Args:
        data: 包含图片base64和健康数据的请求数据
        current_user: 当前活跃用户
        
    Returns:
        dict: 果蔬分析结果
    """
    print("【接收到果蔬分析请求】")
    print("【请求数据】", data)
    
    # 1. 验证请求数据
    if not data:
        print("【请求数据为空】")
        raise HTTPException(status_code=400, detail="请求数据不能为空")
    
    if "image" not in data:
        print("【图片数据为空】")
        raise HTTPException(status_code=400, detail="图片数据不能为空")
    
    # 2. 清洗图片Base64，100%解决百度识别失败
    image_base64 = data["image"].strip()  # 去空格
    
    # 2.1 标准Base64处理（兼容所有前端）
    if "base64," in image_base64:
        image_base64 = image_base64.split(",")[1]
    
    # 2.2 只保留纯图片数据（百度强制要求）
    image_base64 = image_base64.strip()
    print(f"【清洗后图片Base64长度】{len(image_base64)}")
    
    # 3. 调用百度果蔬识别API
    import requests
    import base64
    
    # 果蔬识别 + 健康建议
    def analyze_fruit_impl(image_base64, user_health):
        try:
            token = get_access_token()
            if not token:
                print("【获取token失败】")
                return {"code": 500, "msg": "获取token失败"}

            # ==========================
            # 【核心：调用果蔬识别】
            # ==========================
            fruit_api_url = f"https://aip.baidubce.com/rest/2.0/image-classify/v1/plant?access_token={token}"
            fruit_data = {"image": image_base64, "top_num": 5}
            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            fruit_res = requests.post(fruit_api_url, data=fruit_data, headers=headers).json()
            print(f"【果蔬识别返回】: {fruit_res}")

            # 解析果蔬识别结果
            final_result = None
            
            # 检查果蔬识别是否成功
            if "result" in fruit_res and len(fruit_res["result"]) > 0:
                # 取果蔬识别的第一个结果
                final_result = fruit_res["result"][0]
                print(f"【果蔬识别成功】: {final_result.get('name')} (置信度: {final_result.get('probability')})")

            # ==========================
            # 【最终判断：识别失败】
            # ==========================
            if not final_result:
                print("【识别失败】未识别到果蔬")
                return {"code": 400, "msg": "未识别到果蔬"}

            # 解析最终识别结果
            food_name = final_result.get("name", "未知果蔬")
            # 百度植物识别API返回的置信度字段是score
            prob = float(final_result.get("score", 0))

            # 调用deepseek API获取营养信息和健康分析
            # 构建营养信息，通过deepseek获取
            nutrition = {
                "calorie": "未知",
                "protein": "未知", 
                "fat": "未知", 
                "carb": "未知"
            }

            # 调用deepseek API获取详细的营养信息和健康分析
            deepseek_analysis = get_deepseek_analysis(food_name, nutrition, user_health)

            # 健康建议
            can_eat = True
            risk = "安全"
            reason = "无禁忌"
            suggestion = "可正常食用"

            # 糖尿病患者建议
            if user_health.get("diabetes"):
                if food_name in high_sugar_fruits:
                    risk = "需控制"
                    reason = "高糖水果"
                    suggestion = "建议少量食用"
                elif nutrition.get("calorie", 0) > 300:
                    risk = "需控制"
                    reason = "高热量食物"
                    suggestion = "建议控制摄入量"

            # 高血压患者建议
            if user_health.get("hypertension"):
                if food_name in ["炸鸡", "薯条", "汉堡"]:
                    risk = "需控制"
                    reason = "高盐高脂肪食物"
                    suggestion = "建议减少食用"

            # 过敏检查
            allergies = user_health.get("allergies", [])
            for allergy in allergies:
                if allergy in food_name:
                    can_eat = False
                    risk = "禁止食用"
                    reason = f"含有过敏原: {allergy}"
                    suggestion = "严禁食用"
                    break

            print("【最终识别结果】", food_name)
            return {
                "code": 200,
                "data": {
                    "food": food_name,
                    "confidence": f"{round(prob*100, 2)}%",
                    "calorie": nutrition["calorie"],
                    "protein": nutrition["protein"],
                    "fat": nutrition["fat"],
                    "carb": nutrition["carb"],
                    "can_eat": can_eat,
                    "risk": risk,
                    "reason": reason,
                    "suggestion": suggestion,
                    "deepseek_analysis": deepseek_analysis
                }
            }

        except Exception as e:
            print(f"【服务器报错】{str(e)}")
            return {"code": 500, "msg": f"错误：{str(e)}"}
    
    try:
        # 准备健康数据
        health_data = data.get("health_data", {})
        user_health = {
            "diabetes": False,
            "gout": False,
            "hypertension": False,
            "allergies": [],
            "blood_sugar": 5.6,
            "blood_urate": 360,
            "blood_pressure": (120, 80)
        }
        
        # 从健康数据中提取关键信息
        if health_data:
            # 检查是否有血糖数据
            if "blood_sugar" in health_data and isinstance(health_data["blood_sugar"], list) and len(health_data["blood_sugar"]) > 0:
                try:
                    latest_blood_sugar = max(health_data["blood_sugar"], key=lambda x: x.get("recorded_at", ""))
                    user_health["blood_sugar"] = latest_blood_sugar.get("value", 5.6)
                    if user_health["blood_sugar"] > 7.0:
                        user_health["diabetes"] = True
                except Exception as e:
                    print(f"处理血糖数据失败: {str(e)}")
            
            # 检查是否有血压数据
            if "blood_pressure" in health_data and isinstance(health_data["blood_pressure"], list) and len(health_data["blood_pressure"]) > 0:
                try:
                    latest_blood_pressure = max(health_data["blood_pressure"], key=lambda x: x.get("recorded_at", ""))
                    user_health["blood_pressure"] = (latest_blood_pressure.get("value", 120), 80)
                    if user_health["blood_pressure"][0] > 140:
                        user_health["hypertension"] = True
                except Exception as e:
                    print(f"处理血压数据失败: {str(e)}")
        
        # 调用分析函数
        print("【调用分析函数】")
        result = analyze_fruit_impl(data["image"], user_health)
        
        # 3. 返回分析结果
        print("【返回分析结果】", result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"果蔬分析失败: {str(e)}")