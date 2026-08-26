import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  message,
  Modal,
  Descriptions,
  List,
  Badge
} from 'antd'
import {
  HomeOutlined,
  FileTextOutlined,
  HeartOutlined,
  DownloadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { authApi } from '../../services/api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

// 数据类型选项，与健康监测页保持一致
const dataTypeOptions = [
  { value: 'blood_pressure', label: '血压', unit: 'mmHg' },
  { value: 'blood_sugar', label: '血糖', unit: 'mmol/L' },
  { value: 'heart_rate', label: '心率', unit: 'bpm' },
  { value: 'cholesterol', label: '胆固醇', unit: 'mmol/L' },
  { value: 'weight', label: '体重', unit: 'kg' },
  { value: 'height', label: '身高', unit: 'cm' }
]

function HealthRecords() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [patientId, setPatientId] = useState(null)
  const [healthRecords, setHealthRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

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

  // 加载健康档案
  const loadHealthRecords = async () => {
    if (!patientId) return
    
    try {
      setLoading(true)
      console.log('加载健康档案，patientId:', patientId)
      // 从本地存储获取健康档案
      const records = JSON.parse(localStorage.getItem(`health_records_${patientId}`) || '[]')
      console.log('加载的记录:', records)
      setHealthRecords(records)
    } catch (error) {
      console.error('加载健康档案失败:', error)
      message.error('加载健康档案失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (patientId) {
      loadHealthRecords()
    }
  }, [patientId])

  // 下载健康档案记录为txt文档
  const downloadRecord = (record) => {
    try {
      // 构建txt文档内容
      let txtContent = `健康档案分析报告\n`
      txtContent += `=============================\n\n`
      
      // 分析时间
      txtContent += `分析时间: ${new Date(record.timestamp).toLocaleString()}\n\n`
      
      // 健康评估
      txtContent += `健康评估:\n${record.health_assessment}\n\n`
      
      // 风险等级
      txtContent += `风险等级: ${record.risk_level}\n\n`
      
      // 详细分析
      if (record.detailed_analysis) {
        txtContent += `详细分析:\n`
        Object.entries(record.detailed_analysis).map(([key, value]) => {
          const typeInfo = dataTypeOptions.find(item => item.value === key)
          const label = typeInfo ? typeInfo.label : key
          txtContent += `\n${label}:\n`
          txtContent += `  状态: ${value.status}\n`
          if (value.average) {
            const unit = typeInfo ? typeInfo.unit : ''
            txtContent += `  平均值: ${value.average} ${unit}\n`
          }
          if (value.latest) {
            const unit = typeInfo ? typeInfo.unit : ''
            txtContent += `  最新值: ${value.latest} ${unit}\n`
          }
          if (value.min) {
            const unit = typeInfo ? typeInfo.unit : ''
            txtContent += `  最低值: ${value.min} ${unit}\n`
          }
          if (value.max) {
            const unit = typeInfo ? typeInfo.unit : ''
            txtContent += `  最高值: ${value.max} ${unit}\n`
          }
          txtContent += `  建议: ${value.advice}\n`
        })
        txtContent += `\n`
      }
      
      // 健康建议
      if (record.recommendations) {
        txtContent += `健康建议:\n`
        record.recommendations.forEach((item, index) => {
          txtContent += `${index + 1}. ${item}\n`
        })
        txtContent += `\n`
      }
      
      // 健康数据
      if (record.health_data && record.health_data.length > 0) {
        txtContent += `健康数据:\n`
        record.health_data.forEach((item) => {
          const typeInfo = dataTypeOptions.find(dataType => dataType.value === item.data_type)
          const label = typeInfo ? typeInfo.label : item.data_type
          const unit = typeInfo ? typeInfo.unit : item.unit
          txtContent += `${label}: ${item.value} ${unit} (${new Date(item.recorded_at).toLocaleString()})`
          if (item.notes) {
            txtContent += ` - 备注: ${item.notes}`
          }
          txtContent += `\n`
        })
        txtContent += `\n`
      }
      
      // 后续建议
      if (record.follow_up) {
        txtContent += `后续建议:\n${record.follow_up}\n`
      }
      
      // 创建Blob对象
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 设置文件名
      const timestamp = new Date(record.timestamp).toISOString().replace(/[:.]/g, '-')
      link.download = `健康档案_${timestamp}.txt`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      message.success('健康档案下载成功')
    } catch (error) {
      console.error('下载健康档案失败:', error)
      message.error('下载健康档案失败')
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '分析时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '健康评估',
      dataIndex: 'health_assessment',
      key: 'health_assessment',
      ellipsis: true
    },
    {
      title: '风险等级',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (text) => (
        <Tag color={
          text === '高' ? 'red' :
          text === '中' ? 'orange' : 'green'
        }>
          {text}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedRecord(record)
              setDetailModalVisible(true)
            }}
          >
            查看详情
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={() => downloadRecord(record)}
          >
            下载
          </Button>
        </div>
      ),
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patient/monitor')} style={{ marginRight: 16 }}>
                返回
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                健康档案
              </Title>
            </div>
          </div>

          <Card title="历史分析记录">
            <Table 
              columns={columns} 
              dataSource={healthRecords} 
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
            {healthRecords.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Text type="secondary">暂无健康档案记录</Text>
              </div>
            )}
          </Card>

      <Modal
        title="分析详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="分析时间">{new Date(selectedRecord.timestamp).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="健康评估">{selectedRecord.health_assessment}</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={
                  selectedRecord.risk_level === '高' ? 'red' :
                  selectedRecord.risk_level === '中' ? 'orange' : 'green'
                }>
                  {selectedRecord.risk_level}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>详细分析</Title>
              {selectedRecord.detailed_analysis && Object.entries(selectedRecord.detailed_analysis).map(([key, value]) => {
                const typeInfo = dataTypeOptions.find(item => item.value === key)
                const label = typeInfo ? typeInfo.label : key
                return (
                  <div key={key} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <Text strong>{label}:</Text>
                    <div style={{ marginLeft: 16, marginTop: 8 }}>
                      <p>状态: {value.status}</p>
                      {value.average && <p>平均值: {value.average} {typeInfo?.unit}</p>}
                      {value.latest && <p>最新值: {value.latest} {typeInfo?.unit}</p>}
                      {value.min && <p>最低值: {value.min} {typeInfo?.unit}</p>}
                      {value.max && <p>最高值: {value.max} {typeInfo?.unit}</p>}
                      <p>建议: {value.advice}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>健康建议</Title>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {selectedRecord.recommendations && selectedRecord.recommendations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>健康数据</Title>
              {selectedRecord.health_data && selectedRecord.health_data.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedRecord.health_data}
                  renderItem={(item) => {
                    const typeInfo = dataTypeOptions.find(dataType => dataType.value === item.data_type)
                    const label = typeInfo ? typeInfo.label : item.data_type
                    const unit = typeInfo ? typeInfo.unit : item.unit
                    
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Badge status="default" />}
                          title={label}
                          description={
                            <div>
                              <Text strong>{item.value} {unit}</Text>
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                {new Date(item.recorded_at).toLocaleString()}
                              </Text>
                              {item.notes && (
                                <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                                  备注: {item.notes}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )
                  }}
                />
              ) : (
                <Text type="secondary">暂无健康数据</Text>
              )}
            </div>
            
            <div>
              <Title level={5}>后续建议</Title>
              <p style={{ marginTop: 8 }}>{selectedRecord.follow_up}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HealthRecords