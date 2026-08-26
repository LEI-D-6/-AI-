import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Space,
  Statistic,
  Progress,
  List,
  Tag,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Badge,
  Input,
  Checkbox,
  Switch,
  Table,
  Select
} from 'antd'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  HomeOutlined,
  HeartOutlined,
  PlusOutlined,
  MobileOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  CameraOutlined,
  AppleOutlined
} from '@ant-design/icons'
import { healthDataApi, aiApi, authApi } from '../../services/api'

const { Option } = Select

const { Title, Text } = Typography

function HealthMonitor() {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [healthDataModalVisible, setHealthDataModalVisible] = useState(false)
  const [foodAnalysisModalVisible, setFoodAnalysisModalVisible] = useState(false)
  const [foodImage, setFoodImage] = useState(null)
  const [foodAnalysisResult, setFoodAnalysisResult] = useState(null)
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false)
  
  // 果蔬识别相关状态
  const [fruitAnalysisModalVisible, setFruitAnalysisModalVisible] = useState(false)
  const [fruitImage, setFruitImage] = useState(null)
  const [fruitAnalysisResult, setFruitAnalysisResult] = useState(null)
  const [isAnalyzingFruit, setIsAnalyzingFruit] = useState(false)
  const [todayData, setTodayData] = useState([
    {
      id: 1,
      type: '血压',
      value: '120/80 mmHg',
      time: '08:30',
      status: 'normal'
    },
    {
      id: 2,
      type: '心率',
      value: '72 次/分',
      time: '08:31',
      status: 'normal'
    },
    {
      id: 3,
      type: '血糖',
      value: '5.6 mmol/L',
      time: '08:32',
      status: 'normal'
    },
    {
      id: 4,
      type: '体重',
      value: '70.5 kg',
      time: '08:33',
      status: 'normal'
    }
  ])
  const [form] = Form.useForm()
  const [healthDataForm] = Form.useForm()
  
  // 健康数据管理相关状态
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [patientId, setPatientId] = useState(null) // 从用户信息获取患者ID
  const [healthData, setHealthData] = useState([])
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // 健康趋势相关状态
  const [healthTrends, setHealthTrends] = useState({})
  const [healthIndex, setHealthIndex] = useState(85)
  const [healthStatus, setHealthStatus] = useState({
    blood_pressure: '正常',
    blood_sugar: '良好',
    heart_rate: '稳定',
    cholesterol: '正常',
    weight: '正常'
  })
  const [weekChange, setWeekChange] = useState(3) // 本周较上周的变化百分比
  
  // 数据类型选项
  const dataTypeOptions = [
    { value: 'blood_pressure', label: '血压', unit: 'mmHg' },
    { value: 'blood_sugar', label: '血糖', unit: 'mmol/L' },
    { value: 'heart_rate', label: '心率', unit: 'bpm' },
    { value: 'cholesterol', label: '胆固醇', unit: 'mmol/L' },
    { value: 'weight', label: '体重', unit: 'kg' },
    { value: 'height', label: '身高', unit: 'cm' }
  ]
  
  // 检查登录状态并自动登录
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token || !user.id) {
        try {
          const result = await authApi.login({ username: 'patientlisi', password: 'password123' })
          localStorage.setItem('token', result.access_token)
          
          const tokenPayload = JSON.parse(atob(result.access_token.split('.')[1]))
          const userInfo = {
            id: tokenPayload.sub,
            username: tokenPayload.username,
            role: tokenPayload.role
          }
          localStorage.setItem('user', JSON.stringify(userInfo))
          setUser(userInfo)
          setPatientId(tokenPayload.sub)
        } catch (error) {
          console.error('自动登录失败:', error)
          navigate('/login')
        }
      } else {
        // 已经登录，设置patientId
        setPatientId(user.id)
      }
    }
    
    checkLoginStatus()
  }, [navigate, user.id])
  
  // 计算健康趋势
  const calculateHealthTrends = () => {
    if (!healthData || healthData.length === 0) return
    
    // 按数据类型分组
    const dataByType = healthData.reduce((acc, item) => {
      if (!acc[item.data_type]) {
        acc[item.data_type] = []
      }
      acc[item.data_type].push({
        value: item.value,
        recorded_at: new Date(item.recorded_at)
      })
      return acc
    }, {})
    
    // 计算每种类型的趋势

    const trends = {}
    const status = {}
    let totalIndex = 0
    let validTypes = 0

    Object.entries(dataByType).forEach(([type, data]) => {
        // 按时间排序
      data.sort((a, b) => a.recorded_at - b.recorded_at)
        
        // 计算平均值
      const sum = data.reduce((acc, item) => acc + (parseFloat(item.value) || 0), 0)
      const average = sum / data.length
        
        // 获取最新值
      const latest = parseFloat(data[data.length - 1].value) || 0
        
        // 计算趋势（比较最近两个值）
      let trend = 'stable'
      if (data.length >= 2) {
        const previous = parseFloat(data[data.length - 2].value) || 0
        const diff = latest - previous
        if (Math.abs(diff) > 0.5) {
          trend = diff > 0 ? 'up' : 'down'
        }
      }
      
      // 计算健康指数和状态
      let index = 85
      let statusText = '正常'
      
      switch (type) {
        case 'blood_pressure':
          if (latest < 120) {
            index = 95
            statusText = '优秀'
          } else if (latest < 130) {
            index = 90
            statusText = '正常'
          } else if (latest < 140) {
            index = 80
            statusText = '偏高'
          } else {
            index = 60
            statusText = '高血压'
          }
          break
        case 'blood_sugar':
          if (latest < 5.6) {
            index = 95
            statusText = '优秀'
          } else if (latest < 6.1) {
            index = 90
            statusText = '正常'
          } else if (latest < 7.0) {
            index = 80
            statusText = '偏高'
          } else {
            index = 60
            statusText = '高血糖'
          }
          break
        case 'heart_rate':
          if (latest >= 60 && latest <= 75) {
            index = 95
            statusText = '优秀'
          } else if (latest >= 55 && latest <= 85) {
            index = 90
            statusText = '正常'
          } else if (latest >= 50 && latest <= 95) {
            index = 80
            statusText = '稳定'
          } else {
            index = 60
            statusText = '异常'
          }
          break
        case 'cholesterol':
          if (latest < 5.2) {
            index = 95
            statusText = '优秀'
          } else if (latest < 6.2) {
            index = 90
            statusText = '正常'
          } else if (latest < 7.0) {
            index = 80
            statusText = '偏高'
          } else {
            index = 60
            statusText = '高胆固醇'
          }
          break
        case 'weight':
          // 简单的体重评估，实际应该结合身高计算BMI
          index = 90
          statusText = '正常'
          break
        default:
          index = 85
          statusText = '正常'
      }
      
      trends[type] = {
        average: average.toFixed(1),
        latest: latest.toFixed(1),
        trend,
        data: data.slice(-7) // 最近7天数据
      }
      
      status[type] = statusText
      totalIndex += index
      validTypes++
    })
    
    // 计算总体健康指数
    if (validTypes > 0) {
      setHealthIndex(Math.round(totalIndex / validTypes))
    }
    
    setHealthTrends(trends || {})
    setHealthStatus(status || {})
    
    // 自动分析健康数据
    analyzeHealthData()
  }

  // 加载健康数据
  const loadHealthData = async () => {
    if (!patientId) return
    
    try {
      setLoading(true)
      console.log('加载健康数据，patientId:', patientId)
      const data = await healthDataApi.getHealthData(patientId)
      console.log('健康数据加载成功:', data)
      setHealthData(data)
    } catch (error) {
      console.error('加载健康数据失败:', error)
      console.error('错误详情:', error.response)
      message.error('加载健康数据失败')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (patientId) {
      loadHealthData()
    }
  }, [patientId])
  
  // 健康数据变化时计算趋势
  useEffect(() => {
    if (healthData.length > 0) {
      calculateHealthTrends()
    }
  }, [healthData])
  
  // 处理健康数据，转换为折线图格式
  const processChartData = () => {
    // 生成最近30天的日期范围
    const dates = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric'
      }));
    }
    
    // 按日期分组，只保留当天最后一次记录
    const dataByDate = {};
    
    // 初始化所有日期
    dates.forEach(date => {
      dataByDate[date] = {
        bp: 0,
        hr: 0,
        bs: 0,
        weight: 0,
        cholesterol: 0
      };
    });
    
    // 填充实际健康数据，只保留当天最后一次记录
    if (healthData && healthData.length > 0) {
      // 按日期和数据类型分组，保留最后一次记录
      const latestDataByDateAndType = {};
      
      healthData.forEach(item => {
        const date = new Date(item.recorded_at).toLocaleDateString('zh-CN', {
          month: 'numeric',
          day: 'numeric'
        });
        const type = item.data_type;
        const key = `${date}_${type}`;
        const recordedAt = new Date(item.recorded_at).getTime();
        
        // 如果是第一次记录，或者当前记录比之前的记录晚，则更新
        if (!latestDataByDateAndType[key] || 
            recordedAt > new Date(latestDataByDateAndType[key].recorded_at).getTime()) {
          latestDataByDateAndType[key] = item;
        }
      });
      
      // 填充最后一次记录的数据
      Object.values(latestDataByDateAndType).forEach(item => {
        const date = new Date(item.recorded_at).toLocaleDateString('zh-CN', {
          month: 'numeric',
          day: 'numeric'
        });
        
        if (dataByDate[date]) {
          // 根据数据类型存储值
          switch (item.data_type) {
            case 'blood_pressure':
              dataByDate[date].bp = parseFloat(item.value);
              break;
            case 'heart_rate':
              dataByDate[date].hr = parseFloat(item.value);
              break;
            case 'blood_sugar':
              dataByDate[date].bs = parseFloat(item.value);
              break;
            case 'weight':
              dataByDate[date].weight = parseFloat(item.value);
              break;
            case 'cholesterol':
              dataByDate[date].cholesterol = parseFloat(item.value);
              break;
            default:
              break;
          }
        }
      });
    }
    
    // 转换为数组格式
    const chartData = dates.map(date => ({
      date,
      bp: dataByDate[date].bp,
      hr: dataByDate[date].hr,
      bs: dataByDate[date].bs,
      weight: dataByDate[date].weight,
      cholesterol: dataByDate[date].cholesterol
    }));
    
    return chartData;
  }

  const mockTrendData = [
    { date: '周一', bp: 125, hr: 78, bs: 5.8, weight: 70.5, cholesterol: 5.2 },
    { date: '周二', bp: 122, hr: 75, bs: 5.6, weight: 70.3, cholesterol: 5.1 },
    { date: '周三', bp: 118, hr: 72, bs: 5.4, weight: 70.2, cholesterol: 5.0 },
    { date: '周四', bp: 120, hr: 74, bs: 5.5, weight: 70.2, cholesterol: 5.1 },
    { date: '周五', bp: 123, hr: 76, bs: 5.7, weight: 70.4, cholesterol: 5.2 },
    { date: '周六', bp: 120, hr: 73, bs: 5.6, weight: 70.3, cholesterol: 5.1 },
    { date: '周日', bp: 120, hr: 72, bs: 5.6, weight: 70.2, cholesterol: 5.0 }
  ]

  const handleAddRecord = () => {
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      const newRecords = []
      const healthDataToSave = []
      
      if (values.systolic && values.diastolic) {
        newRecords.push({
          id: Date.now(),
          type: '血压',
          value: `${values.systolic}/${values.diastolic} mmHg`,
          time,
          status: values.systolic <= 130 && values.diastolic <= 85 ? 'normal' : 
                  values.systolic <= 140 && values.diastolic <= 90 ? 'warning' : 'danger'
        })
        // 保存血压数据（收缩压）
        healthDataToSave.push({
          patient_id: patientId,
          data_type: 'blood_pressure',
          value: parseFloat(values.systolic),
          unit: 'mmHg',
          notes: `收缩压: ${values.systolic}, 舒张压: ${values.diastolic}`
        })
      }
      if (values.heart_rate) {
        newRecords.push({
          id: Date.now() + 1,
          type: '心率',
          value: `${values.heart_rate} 次/分`,
          time,
          status: values.heart_rate >= 60 && values.heart_rate <= 100 ? 'normal' : 
                  values.heart_rate >= 50 && values.heart_rate <= 110 ? 'warning' : 'danger'
        })
        // 保存心率数据
        healthDataToSave.push({
          patient_id: patientId,
          data_type: 'heart_rate',
          value: parseFloat(values.heart_rate),
          unit: 'bpm',
          notes: '心率数据'
        })
      }
      if (values.blood_sugar) {
        newRecords.push({
          id: Date.now() + 2,
          type: '血糖',
          value: `${values.blood_sugar} mmol/L`,
          time,
          status: values.blood_sugar >= 3.9 && values.blood_sugar <= 6.1 ? 'normal' : 
                  values.blood_sugar >= 3.5 && values.blood_sugar <= 7.0 ? 'warning' : 'danger'
        })
        // 保存血糖数据
        healthDataToSave.push({
          patient_id: patientId,
          data_type: 'blood_sugar',
          value: parseFloat(values.blood_sugar),
          unit: 'mmol/L',
          notes: '血糖数据'
        })
      }
      if (values.weight) {
        newRecords.push({
          id: Date.now() + 3,
          type: '体重',
          value: `${values.weight} kg`,
          time,
          status: 'normal'
        })
        // 保存体重数据
        healthDataToSave.push({
          patient_id: patientId,
          data_type: 'weight',
          value: parseFloat(values.weight),
          unit: 'kg',
          notes: '体重数据'
        })
      }
      
      if (newRecords.length > 0) {
        setTodayData([...newRecords, ...todayData])
      }
      
      // 保存数据到后端
      if (healthDataToSave.length > 0 && patientId) {
        for (const data of healthDataToSave) {
          try {
            await healthDataApi.addHealthData(data)
          } catch (error) {
            console.error('保存健康数据失败:', error)
          }
        }
        // 重新加载健康数据
        loadHealthData()
      }
      
      message.success('健康数据记录成功！')
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Failed to add record:', error)
      message.error('记录失败')
    }
  }



  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return 'green'
      case 'warning': return 'orange'
      case 'danger': return 'red'
      default: return 'blue'
    }
  }
  
  // 提交健康数据
  const handleHealthDataSubmit = async (values) => {
    try {
      console.log('开始添加健康数据，值:', values)
      console.log('患者ID:', patientId)
      
      // 确保patientId存在
      if (!patientId) {
        message.error('患者ID不存在，请重新登录')
        return
      }
      
      // 确保数据类型正确
      const data = {
        patient_id: parseInt(patientId), // 转换为整数
        data_type: values.dataType,
        value: parseFloat(values.value), // 转换为浮点数
        unit: values.unit,
        notes: values.notes
      }
      
      console.log('添加健康数据:', data)
      
      await healthDataApi.addHealthData(data)
      message.success('健康数据添加成功')
      setHealthDataModalVisible(false)
      healthDataForm.resetFields()
      loadHealthData()
    } catch (error) {
      console.error('添加健康数据失败:', error)
      if (error.response) {
        console.error('后端返回:', error.response.data)
        message.error(`添加健康数据失败: ${error.response.data.detail || error.response.statusText}`)
      } else if (error.request) {
        console.error('请求已发出但没有收到响应:', error.request)
        message.error('网络错误，请检查连接')
      } else {
        console.error('请求配置出错:', error.message)
        message.error('添加健康数据失败，请重试')
      }
    }
  }
  
  // 分析健康数据 - 调用后端API
  // 分析健康数据 - 调用后端API
const analyzeHealthData = async () => {
  try {
    setIsAnalyzing(true)
    const data = {
      health_data: healthData.map(item => ({
        data_type: item.data_type,
        value: item.value,
        unit: item.unit,
        recorded_at: item.recorded_at
      })),
      patient_info: {
        id: patientId,
        name: user.full_name || user.username || '患者'
      }
    }
    
    const result = await aiApi.analyzeData(data)
    setAnalysisResult(result)
    message.success('健康数据分析成功')
  } catch (error) {
    console.error('分析健康数据失败:', error)
    message.error('分析健康数据失败')
  } finally {
    setIsAnalyzing(false)
  }
}
  
  // 保存到健康档案
  const saveToHealthRecord = () => {
    if (!analysisResult) {
      message.error('请先分析健康数据')
      return
    }
    
    if (!patientId) {
      message.error('患者ID不存在，请重新登录')
      return
    }
    
    try {
      const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        analysis: analysisResult.analysis,  // 使用新字段
        health_data: healthData
      }
      
      console.log('保存健康档案，patientId:', patientId)
      console.log('保存记录:', record)
      
      // 从本地存储获取现有记录
      const existingRecords = JSON.parse(localStorage.getItem(`health_records_${patientId}`) || '[]')
      console.log('现有记录:', existingRecords)
      
      // 添加新记录
      const updatedRecords = [record, ...existingRecords]
      console.log('更新后记录:', updatedRecords)
      
      // 保存回本地存储
      localStorage.setItem(`health_records_${patientId}`, JSON.stringify(updatedRecords))
      console.log('保存成功')
      
      message.success('保存到健康档案成功')
    } catch (error) {
      console.error('保存到健康档案失败:', error)
      message.error('保存到健康档案失败')
    }
  }
  
  // 删除健康数据
  const handleDeleteHealthData = async (dataId) => {
    try {
      await healthDataApi.deleteHealthData(dataId)
      message.success('健康数据删除成功')
      loadHealthData()
    } catch (error) {
      console.error('删除健康数据失败:', error)
      message.error('删除健康数据失败')
    }
  }
  
  // 处理食物图片上传
  const handleFoodImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFoodImage(file)
    }
  }
  
  // 分析食物图片
  const analyzeFoodImage = async () => {
    // 1. 强制校验文件有效性
    if (!foodImage) {
      message.error('请先上传图片！');
      console.error('❌ 未上传图片，无法分析');
      return;
    }
    if (!foodImage.type.startsWith('image/')) {
      message.error('请上传有效的图片文件！');
      console.error('❌ 文件不是图片类型');
      return;
    }
    
    setIsAnalyzingFood(true)
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // 2. 彻底清除Base64前缀，保证百度API可识别
        const fullBase64 = e.target.result;
        const base64 = fullBase64.replace(/^data:image\/[a-zA-Z0-9+./-]+;base64,/, '');
        console.log('✅ 前端发送Base64长度:', base64.length);
        
        // 3. 构造请求体（严格匹配后端参数）
        const formData = new FormData();
        formData.append('image', base64);
        formData.append('health_data', JSON.stringify({
          diabetes: false,
          hypertension: false,
          gout: false,
          allergies: []
        }));
        
        // 4. 发起请求（强制日志+异常捕获）
        console.log('🚀 发起食物分析请求...');
        const result = await aiApi.analyzeFood(base64, {
          diabetes: false,
          hypertension: false,
          gout: false,
          allergies: []
        })
        console.log('【后端完整返回】', result);
        
        if (result.code === 200) {
          setFoodAnalysisResult(result)
          message.success('食物分析成功！');
        } else {
          setFoodAnalysisResult(result)
          message.error(result.msg);
          console.error('❌ 百度API错误:', result.msg);
        }
      } catch (err) {
        console.error('❌ 食物分析异常:', err);
        message.error('食物分析失败，请重试');
      } finally {
        setIsAnalyzingFood(false)
      }
    };
    
    // 5. 强制读取图片，避免截断
    reader.readAsDataURL(foodImage);
  }
  
  // 打开食物分析模态框
  const openFoodAnalysisModal = () => {
    setFoodAnalysisResult(null)
    setFoodImage(null)
    setFoodAnalysisModalVisible(true)
  }
  
  // 处理果蔬图片上传
  const handleFruitImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFruitImage(file)
    }
  }
  
  // 分析果蔬图片
  const analyzeFruitImage = async () => {
    // 1. 强制校验文件有效性
    if (!fruitImage) {
      message.error('请先上传图片！');
      console.error('❌ 未上传图片，无法分析');
      return;
    }
    if (!fruitImage.type.startsWith('image/')) {
      message.error('请上传有效的图片文件！');
      console.error('❌ 文件不是图片类型');
      return;
    }
    
    setIsAnalyzingFruit(true)
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // 2. 彻底清除Base64前缀，保证百度API可识别
        const fullBase64 = e.target.result;
        const base64 = fullBase64.replace(/^data:image\/[a-zA-Z0-9+./-]+;base64,/, '');
        console.log('✅ 前端发送Base64长度:', base64.length);
        
        // 3. 构造请求体（严格匹配后端参数）
        const formData = new FormData();
        formData.append('image', base64);
        formData.append('health_data', JSON.stringify({
          diabetes: false,
          hypertension: false,
          gout: false,
          allergies: []
        }));
        
        // 4. 发起请求（强制日志+异常捕获）
        console.log('🚀 发起果蔬分析请求...');
        const result = await aiApi.analyzeFruit(base64, {
          diabetes: false,
          hypertension: false,
          gout: false,
          allergies: []
        })
        console.log('【后端完整返回】', result);
        
        if (result.code === 200) {
          setFruitAnalysisResult(result)
          message.success('果蔬分析成功！');
        } else {
          setFruitAnalysisResult(result)
          message.error(result.msg);
          console.error('❌ 百度API错误:', result.msg);
        }
      } catch (err) {
        console.error('❌ 果蔬分析异常:', err);
        message.error('果蔬分析失败，请重试');
      } finally {
        setIsAnalyzingFruit(false)
      }
    };
    
    // 5. 强制读取图片，避免截断
    reader.readAsDataURL(fruitImage);
  }
  
  // 打开果蔬分析模态框
  const openFruitAnalysisModal = () => {
    setFruitAnalysisResult(null)
    setFruitImage(null)
    setFruitAnalysisModalVisible(true)
  }
  
  // 表格列定义
  const healthDataColumns = [
    {
      title: '数据类型',
      dataIndex: 'data_type',
      key: 'data_type',
      render: (text) => {
        const type = dataTypeOptions.find(item => item.value === text)
        return type ? type.label : text
      }
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: '记录时间',
      dataIndex: 'recorded_at',
      key: 'recorded_at',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleDeleteHealthData(record.id)}>
          删除
        </Button>
      ),
    }
  ]

  return (
    <div style={{ padding: '24px', maxHeight: 'calc(100vh - 128px)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <HeartOutlined style={{ marginRight: 8 }} />
          健康监测
        </Title>
        <Space>
          <Button icon={<FileTextOutlined />} onClick={() => navigate('/health-records')}>
            健康档案
          </Button>
          <Button icon={<CameraOutlined />} onClick={openFoodAnalysisModal}>
            食物分析
          </Button>
          <Button icon={<AppleOutlined />} onClick={openFruitAnalysisModal}>
            果蔬识别
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRecord}>
            手动记录
          </Button>
        </Space>
      </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="健康数据趋势" extra={<Tag color="green">最近30天</Tag>}>
                <div style={{ height: 400, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={processChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" interval={Math.ceil(30/10)} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bp" stroke="#8884d8" name="血压" strokeWidth={2} />
                      <Line type="monotone" dataKey="hr" stroke="#82ca9d" name="心率" strokeWidth={2} />
                      <Line type="monotone" dataKey="bs" stroke="#ffc658" name="血糖" strokeWidth={2} />
                      <Line type="monotone" dataKey="weight" stroke="#ff8042" name="体重" strokeWidth={2} />
                      <Line type="monotone" dataKey="cholesterol" stroke="#0088fe" name="胆固醇" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="健康状态" style={{ height: '100%' }}>
                <Statistic
                  title="健康指数"
                  value={healthIndex}
                  suffix="/ 100"
                  valueStyle={{ 
                    color: healthIndex >= 90 ? '#52c41a' : 
                           healthIndex >= 70 ? '#faad14' : '#f5222d' 
                  }}
                  prefix={<CheckCircleOutlined />}
                />
                  <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {healthStatus && Object.entries(healthStatus).map(([type, status]) => {
                    const typeInfo = dataTypeOptions.find(item => item.value === type)
                    if (!typeInfo) return null
                    
                    let tagColor = 'green'
                    if (status.includes('偏高') || status.includes('稳定')) {
                      tagColor = 'orange'
                    } else if (status.includes('高') || status.includes('异常')) {
                      tagColor = 'red'
                    } else if (status.includes('良好')) {
                      tagColor = 'blue'
                    }
                    
                    return (
                      <Tag key={type} color={tagColor}>
                        {typeInfo.label}{status}
                      </Tag>
                    )
                  })}
                </div>
                <div style={{ 
                  marginTop: 16, 
                  fontSize: '12px', 
                  color: weekChange > 0 ? '#52c41a' : weekChange < 0 ? '#f5222d' : '#1890ff' 
                }}>
                  {weekChange > 0 ? <RiseOutlined /> : weekChange < 0 ? <ArrowDownOutlined /> : <MinusOutlined />}
                  {' '}本周健康状况较上周{weekChange > 0 ? '提升' : weekChange < 0 ? '下降' : '持平'} {Math.abs(weekChange)}%
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="健康数据管理">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setHealthDataModalVisible(true)}
                  style={{ marginBottom: 16 }}
                >
                  添加健康数据
                </Button>
                <Table 
                  columns={healthDataColumns} 
                  dataSource={healthData} 
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="健康数据分析">
                <Button 
                  type="primary" 
                  icon={<BarChartOutlined />} 
                  onClick={analyzeHealthData}
                  loading={isAnalyzing}
                  style={{ marginBottom: 16 }}
                >
                  分析健康数据
                </Button>
                {analysisResult && (
                  <div style={{ marginTop: 16, maxHeight: 550, overflowY: 'auto' }}>
                    <Card title="分析结果" type="inner">
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>健康分析:</Text>
                        <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {analysisResult.analysis}
                        </p>
                      </div>
                      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          type="primary" 
                          icon={<FileTextOutlined />} 
                          onClick={saveToHealthRecord}
                        >
                          保存到健康档案
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

      <Modal
        title="手动记录健康数据"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="record_date"
            label="记录日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="systolic"
            label="收缩压 (mmHg)"
          >
            <InputNumber style={{ width: '100%' }} placeholder="120" />
          </Form.Item>
          <Form.Item
            name="diastolic"
            label="舒张压 (mmHg)"
          >
            <InputNumber style={{ width: '100%' }} placeholder="80" />
          </Form.Item>
          <Form.Item
            name="heart_rate"
            label="心率 (次/分)"
          >
            <InputNumber style={{ width: '100%' }} placeholder="72" />
          </Form.Item>
          <Form.Item
            name="blood_sugar"
            label="血糖 (mmol/L)"
          >
            <InputNumber style={{ width: '100%' }} step={0.1} placeholder="5.6" />
          </Form.Item>
          <Form.Item
            name="weight"
            label="体重 (kg)"
          >
            <InputNumber style={{ width: '100%' }} step={0.1} placeholder="70.5" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 添加健康数据模态框 */}
      <Modal
        title="添加健康数据"
        open={healthDataModalVisible}
        onCancel={() => setHealthDataModalVisible(false)}
        footer={null}
      >
        <Form
          form={healthDataForm}
          layout="vertical"
          onFinish={handleHealthDataSubmit}
        >
          <Form.Item
            name="dataType"
            label="数据类型"
            rules={[{ required: true, message: '请选择数据类型' }]}
          >
            <Select 
              placeholder="请选择数据类型"
              onChange={(value) => {
                // 根据选择的数据类型自动填充单位
                const selectedOption = dataTypeOptions.find(option => option.value === value)
                if (selectedOption) {
                  healthDataForm.setFieldsValue({ unit: selectedOption.unit })
                }
              }}
            >
              {dataTypeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="value"
            label="数值"
            rules={[{ required: true, message: '请输入数值' }]}
          >
            <Input type="number" placeholder="请输入数值" />
          </Form.Item>
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setHealthDataModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 食物分析模态框 */}
      <Modal
        title="食物分析"
        open={foodAnalysisModalVisible}
        onCancel={() => setFoodAnalysisModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 24 }}>
            <h4>上传食物图片</h4>
            <div style={{ border: '2px dashed #d9d9d9', borderRadius: 8, padding: 40, textAlign: 'center', margin: '20px 0' }}>
              {foodImage ? (
                <div>
                  <img 
                    src={URL.createObjectURL(foodImage)} 
                    alt="食物" 
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                  />
                  <p style={{ marginTop: 12 }}>{foodImage.name}</p>
                </div>
              ) : (
                <div>
                  <CameraOutlined style={{ fontSize: 48, color: '#999' }} />
                  <p style={{ marginTop: 12, color: '#999' }}>点击或拖拽文件到此处上传</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFoodImageUpload} 
                    style={{ display: 'none' }} 
                    id="food-image-upload"
                  />
                  <Button 
                    type="primary" 
                    style={{ marginTop: 16 }}
                    onClick={() => document.getElementById('food-image-upload').click()}
                  >
                    选择图片
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <Button 
              type="primary" 
              icon={<BarChartOutlined />}
              onClick={analyzeFoodImage}
              loading={isAnalyzingFood}
              disabled={!foodImage}
              style={{ width: '100%' }}
            >
              分析食物
            </Button>
          </div>
          
          {foodAnalysisResult && (
            <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
              <h4>分析结果</h4>
              <Card type="inner" style={{ marginTop: 16 }}>
                {foodAnalysisResult.code === 200 && foodAnalysisResult.data ? (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>食物名称:</Text>
                      <p style={{ marginTop: 8 }}>{foodAnalysisResult.data.food || '未识别'}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>置信度:</Text>
                      <p style={{ marginTop: 8 }}>{foodAnalysisResult.data.confidence || '未知'}</p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text strong>是否适合食用:</Text>
                      <Tag color={foodAnalysisResult.data.can_eat ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                        {foodAnalysisResult.data.can_eat ? '适合' : '不适合'}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>风险等级:</Text>
                      <Tag color={
                        foodAnalysisResult.data.risk === '禁止食用' ? 'red' :
                        foodAnalysisResult.data.risk === '需控制' ? 'orange' : 'green'
                      } style={{ marginLeft: 8 }}>
                        {foodAnalysisResult.data.risk}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>分析原因:</Text>
                      <p style={{ marginTop: 8 }}>{foodAnalysisResult.data.reason}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>健康建议:</Text>
                      <p style={{ marginTop: 8 }}>{foodAnalysisResult.data.suggestion}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>专业分析:</Text>
                      <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{foodAnalysisResult.data.deepseek_analysis || '无法获取专业分析'}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>食物识别失败，请尝试上传更清晰的图片。</p>
                    {foodAnalysisResult.msg && (
                      <p style={{ color: 'red' }}>错误信息: {foodAnalysisResult.msg}</p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </Modal>
      
      {/* 果蔬识别模态框 */}
      <Modal
        title="果蔬识别"
        open={fruitAnalysisModalVisible}
        onCancel={() => setFruitAnalysisModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 24 }}>
            <h4>上传果蔬图片</h4>
            <div style={{ border: '2px dashed #d9d9d9', borderRadius: 8, padding: 40, textAlign: 'center', margin: '20px 0' }}>
              {fruitImage ? (
                <div>
                  <img 
                    src={URL.createObjectURL(fruitImage)} 
                    alt="果蔬" 
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                  />
                  <p style={{ marginTop: 12 }}>{fruitImage.name}</p>
                </div>
              ) : (
                <div>
                  <CameraOutlined style={{ fontSize: 48, color: '#999' }} />
                  <p style={{ marginTop: 12, color: '#999' }}>点击或拖拽文件到此处上传</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFruitImageUpload} 
                    style={{ display: 'none' }} 
                    id="fruit-image-upload"
                  />
                  <Button 
                    type="primary" 
                    style={{ marginTop: 16 }}
                    onClick={() => document.getElementById('fruit-image-upload').click()}
                  >
                    选择图片
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <Button 
              type="primary" 
              icon={<BarChartOutlined />}
              onClick={analyzeFruitImage}
              loading={isAnalyzingFruit}
              disabled={!fruitImage}
              style={{ width: '100%' }}
            >
              分析果蔬
            </Button>
          </div>
          
          {fruitAnalysisResult && (
            <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
              <h4>分析结果</h4>
              <Card type="inner" style={{ marginTop: 16 }}>
                {fruitAnalysisResult.code === 200 && fruitAnalysisResult.data ? (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>果蔬名称:</Text>
                      <p style={{ marginTop: 8 }}>{fruitAnalysisResult.data.food || '未识别'}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>置信度:</Text>
                      <p style={{ marginTop: 8 }}>{fruitAnalysisResult.data.confidence || '未知'}</p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text strong>是否适合食用:</Text>
                      <Tag color={fruitAnalysisResult.data.can_eat ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                        {fruitAnalysisResult.data.can_eat ? '适合' : '不适合'}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>风险等级:</Text>
                      <Tag color={
                        fruitAnalysisResult.data.risk === '禁止食用' ? 'red' :
                        fruitAnalysisResult.data.risk === '需控制' ? 'orange' : 'green'
                      } style={{ marginLeft: 8 }}>
                        {fruitAnalysisResult.data.risk}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>分析原因:</Text>
                      <p style={{ marginTop: 8 }}>{fruitAnalysisResult.data.reason}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>健康建议:</Text>
                      <p style={{ marginTop: 8 }}>{fruitAnalysisResult.data.suggestion}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>专业分析:</Text>
                      <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{fruitAnalysisResult.data.deepseek_analysis || '无法获取专业分析'}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>果蔬识别失败，请尝试上传更清晰的图片。</p>
                    {fruitAnalysisResult.msg && (
                      <p style={{ color: 'red' }}>错误信息: {fruitAnalysisResult.msg}</p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default HealthMonitor
