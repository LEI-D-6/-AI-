import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000 // 增加超时时间到30秒
  // 移除默认的Content-Type设置，让axios根据请求体自动设置
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从本地存储获取token并添加到请求头
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      // 跳转到登录页面
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authApi = {
  login: (data) => {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  register: (data) => api.post('/auth/register', data),
  refreshToken: (token) => api.post('/auth/refresh', { refresh_token: token })
}

// 用户相关API
export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  updateCurrentUser: (data) => api.put('/users/me', data),
  getUser: (userId) => api.get(`/users/${userId}`),
  getUsers: (params) => api.get('/users', { params })
}

// 患者相关API
export const patientApi = {
  getPatients: (params) => api.get('/patients', { params }),
  getPatient: (patientId) => api.get(`/patients/${patientId}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (patientId, data) => api.put(`/patients/${patientId}`, data),
  getPatientMedicalRecords: (patientId) => api.get('/medical-records', { params: { patient_id: patientId } })
}

// 健康数据相关API
export const healthDataApi = {
  getHealthData: (patientId, params) => api.get(`/health-data/${patientId}`, { params }),
  addHealthData: (data) => api.post('/health-data', data),
  deleteHealthData: (dataId) => api.delete(`/health-data/${dataId}`)
}

// AI服务相关API
export const aiApi = {
  predictRisk: (data) => api.post('/ai/risk-prediction', data),
  recommendTreatment: (data) => api.post('/ai/treatment-recommendation', data),
  healthQA: (question) => api.post('/ai/health-qa', { question }),
  analyzeData: (data) => api.post('/ai/data-analysis', data),
  analyzeFood: (image, healthData) => {
    return api.post('/ai/analyze-food', {
      image: image,
      health_data: healthData
    });
  },
  // 通过后端API调用百度文心一言API
  baiduAIFoodAnalysis: async (imageBase64, healthData) => {
    return api.post('/ai/analyze-food', {
      image: imageBase64,
      health_data: healthData
    });
  },
  // 通过后端API调用百度果蔬识别API
  analyzeFruit: async (imageBase64, healthData) => {
    return api.post('/ai/analyze-fruit', {
      image: imageBase64,
      health_data: healthData
    });
  }
}

// 病历相关API
export const medicalRecordsApi = {
  getRecords: (params) => api.get('/medical-records', { params }),
  getRecord: (recordId) => api.get(`/medical-records/${recordId}`),
  createRecord: (formData) => {
    console.log('上传病历数据:', formData)
    return api.post('/medical-records', formData)
  },
  updateRecord: (recordId, data) => api.put(`/medical-records/${recordId}`, data),
  deleteRecord: (recordId) => api.delete(`/medical-records/${recordId}`)
}

// 消息相关API
export const messageApi = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (patientId, doctorId) => api.get('/messages', { params: { patient_id: patientId, doctor_id: doctorId } }),
  getUnreadCount: (patientId, doctorId) => api.get('/messages/unread-count', { params: { patient_id: patientId, doctor_id: doctorId } })
}

// 治疗方案相关API
export const treatmentApi = {
  getTreatmentPlans: (patientId) => api.get('/treatment-plans', { params: { patient_id: patientId } }),
  getTreatmentPlan: (planId) => api.get(`/treatment-plans/${planId}`),
  createTreatmentPlan: (data) => api.post('/treatment-plans', data),
  updateTreatmentPlan: (planId, data) => api.put(`/treatment-plans/${planId}`, data),
  deleteTreatmentPlan: (planId) => api.delete(`/treatment-plans/${planId}`)
}

// 医生患者关系相关API
export const doctorPatientApi = {
  getDoctors: () => api.get('/doctors'),
  sendDoctorRequest: (doctorId) => api.post('/doctor-requests', { doctor_id: doctorId }),
  getDoctorRequests: () => api.get('/doctor-requests'),
  updateDoctorRequest: (requestId, status) => api.put(`/doctor-requests/${requestId}`, { status }),
  getMyDoctors: () => api.get('/my-doctors'),
  getMyPatients: () => api.get('/my-patients')
}

export default api