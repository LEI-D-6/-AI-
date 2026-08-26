import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Layout, 
  Typography, 
  Table, 
  Space, 
  Button, 
  Card, 
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Descriptions,
  Row,
  Col,
  Statistic,
  Upload
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  HeartOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { medicalRecordsApi, doctorPatientApi } from '../../services/api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function MedicalRecords() {
  const navigate = useNavigate()
  // 使用useRef来存储当前的translate值，避免频繁的状态更新
  const translateRef = useRef({ x: 0, y: 0 })

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [imageScale, setImageScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchMedicalRecords()
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await doctorPatientApi.getDoctors()
      console.log('获取医生列表:', response)
      setDoctors(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('获取医生列表失败:', error)
    }
  }

  const fetchMedicalRecords = async () => {
    setLoading(true)
    try {
      const response = await medicalRecordsApi.getRecords()
      console.log('获取病历响应:', response)
      setRecords(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('获取病历失败:', error)
      message.error('获取病历失败')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (record) => {
    setSelectedRecord(record)
    setViewModalVisible(true)
  }

  const handleImageClick = (imagePath) => {
    const encodedPath = encodeURIComponent(imagePath)
    setSelectedImage(`http://localhost:8000/uploads/${encodedPath}`)
    setImageScale(1) // 重置缩放比例
    setTranslateX(0) // 重置位置
    setTranslateY(0)
    setImageModalVisible(true)
  }

  const handleImageWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1 // 缩小或放大
    setImageScale(prevScale => {
      // 限制缩放范围，防止图片过大或过小
      const newScale = Math.max(0.1, Math.min(5, prevScale * delta))
      return newScale
    })
  }

  // 存储动画帧ID
  const animationFrameId = useRef(null)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX - translateX)
    setStartY(e.clientY - translateY)
    // 初始化translateRef
    translateRef.current = { x: translateX, y: translateY }
  }

  // 使用requestAnimationFrame优化鼠标移动事件处理
  const handleMouseMove = (e) => {
    if (!isDragging) return

    // 取消之前的动画帧
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }

    // 使用requestAnimationFrame来优化性能
    animationFrameId.current = requestAnimationFrame(() => {
      const newX = e.clientX - startX
      const newY = e.clientY - startY
      setTranslateX(newX)
      setTranslateY(newY)
      translateRef.current = { x: newX, y: newY }
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // 取消动画帧
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    // 取消动画帧
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
  }

  // 组件卸载时清理动画帧
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  const handleUpload = () => {
    form.resetFields()
    setUploadModalVisible(true)
  }

  const handleUploadSubmit = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)
      
      console.log('表单值:', values)
      console.log('用户信息:', user)
      
      // 创建FormData对象
      const formData = new FormData()
      
      // 添加必要的字段
      const patientId = parseInt(user.id)
      console.log('患者ID:', patientId)
      formData.append('patient_id', patientId) // 确保是整数类型
      
      // 使用从医生列表中获取的第一个医生ID
      const doctorId = doctors.length > 0 ? doctors[0].id : 1
      console.log('医生ID:', doctorId)
      formData.append('doctor_id', doctorId) // 使用有效的医生ID
      
      formData.append('visit_date', values.visit_date.format('YYYY-MM-DD'))
      formData.append('department', values.department)
      formData.append('diagnosis', values.diagnosis)
      
      // 添加可选字段
      if (values.treatment_plan) {
        formData.append('treatment_plan', values.treatment_plan)
      }
      if (values.notes) {
        formData.append('notes', values.notes)
      }
      
      // 添加上传的文件：确保是真实的File对象
      const fileList = values.files || []
      console.log('文件列表:', fileList)
      let fileCount = 0
      fileList.forEach(item => {
        // 检查item结构
        console.log('文件项:', item)
        console.log('item类型:', typeof item)
        console.log('item是否为对象:', item instanceof Object)
        
        // 尝试获取文件对象
        let file = null
        if (item.originFileObj) {
          file = item.originFileObj
          console.log('使用originFileObj:', file)
        } else if (item.file) {
          file = item.file
          console.log('使用file属性:', file)
        } else if (item instanceof File) {
          file = item
          console.log('直接使用File对象:', file)
        }
        
        if (file instanceof File) {
          formData.append('files', file)
          fileCount++
          console.log('添加文件:', file.name, '大小:', file.size, '类型:', file.type)
        } else {
          console.warn('非文件对象被忽略:', item)
        }
      })
      console.log('成功添加文件数量:', fileCount)
      
      // 检查FormData内容
      console.log('FormData字段数量:', formData.entries().next().value)
      for (let [key, value] of formData.entries()) {
        console.log('FormData字段:', key, value)
      }
      
      // 调用API上传病历
      console.log('准备上传病历...')
      const uploadResponse = await medicalRecordsApi.createRecord(formData)
      console.log('上传病历响应:', uploadResponse)
      message.success('病历上传成功')
      setUploadModalVisible(false)
      
      // 重新获取病历列表
      fetchMedicalRecords()
    } catch (error) {
      console.error('上传病历失败:', error)
      if (error.response) {
        console.error('后端返回:', error.response.data)
        // 处理错误信息，避免显示[object Object]
        let errorMessage = '未知错误'
        if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map(item => 
              typeof item === 'object' ? JSON.stringify(item) : item
            ).join(', ')
          } else {
            errorMessage = JSON.stringify(error.response.data.detail)
          }
        }
        message.error(`上传失败: ${errorMessage}`)
      } else {
        message.error('上传失败，请检查网络')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (record) => {
    try {
      await medicalRecordsApi.deleteRecord(record.id)
      // 更新本地状态
      setRecords(records.filter(r => r.id !== record.id))
      message.success('病历删除成功！')
    } catch (error) {
      console.error('删除病历失败:', error)
      message.error('删除病历失败')
    }
  }

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList || []
  }

  const getStatusColor = (diagnosis) => {
    // 根据诊断内容简单判断状态
    if (diagnosis.includes('正常') || diagnosis.includes('良好')) {
      return 'green'
    } else if (diagnosis.includes('异常') || diagnosis.includes('偏高') || diagnosis.includes('偏低')) {
      return 'red'
    }
    return 'blue'
  }

  const columns = [
    {
      title: '就诊日期',
      dataIndex: 'visit_date',
      key: 'visit_date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (diagnosis) => (
        <div>
          <Text ellipsis={{ rows: 2 }}>{diagnosis}</Text>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看详情
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          历史病例
        </Title>
        <Button type="primary" icon={<UploadOutlined />} onClick={handleUpload}>
          上传病例
        </Button>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总病例数" value={records.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月病例" value={records.filter(r => {
              const recordDate = new Date(r.visit_date)
              const now = new Date()
              return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
            }).length} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="健康状态" 
              value={records.length > 0 ? '良好' : '无记录'} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<HeartOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="最近就诊" value={records.length > 0 ? new Date(records[0].visit_date).toLocaleDateString() : '无记录'} />
          </Card>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={records} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="病例详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="就诊日期">{new Date(selectedRecord.visit_date).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="科室">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="诊断">{selectedRecord.diagnosis}</Descriptions.Item>
              {selectedRecord.treatment_plan && (
                <Descriptions.Item label="治疗方案">{selectedRecord.treatment_plan}</Descriptions.Item>
              )}
              {selectedRecord.notes && (
                <Descriptions.Item label="备注">{selectedRecord.notes}</Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedRecord.image_paths && selectedRecord.image_paths.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>病历图片</Title>
                <Row gutter={16}>
                  {selectedRecord.image_paths.map((imagePath, index) => (
                    <Col span={8} key={index}>
                      <Card
                        hoverable
                        style={{ marginBottom: 16, cursor: 'pointer' }}
                        cover={
                          <img 
                            alt={`病历图片 ${index + 1}`} 
                            src={`http://localhost:8000/uploads/${encodeURIComponent(imagePath)}`} 
                            style={{ height: 200, objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => handleImageClick(imagePath)}
                          />
                        }
                      >
                        <Text>图片 {index + 1}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="上传病例"
        open={uploadModalVisible}
        onOk={handleUploadSubmit}
        onCancel={() => setUploadModalVisible(false)}
        okText="上传"
        cancelText="取消"
        width={800}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="visit_date"
            label="就诊日期"
            rules={[{ required: true, message: '请选择就诊日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="department"
            label="科室"
            rules={[{ required: true, message: '请输入科室' }]}
          >
            <Input placeholder="例如: 内科、外科、心内科等" />
          </Form.Item>
          <Form.Item
            name="diagnosis"
            label="诊断"
            rules={[{ required: true, message: '请输入诊断结果' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入诊断结果..." />
          </Form.Item>
          <Form.Item
            name="treatment_plan"
            label="治疗方案"
          >
            <Input.TextArea rows={3} placeholder="请输入治疗方案..." />
          </Form.Item>
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={2} placeholder="请输入备注信息..." />
          </Form.Item>
          <Form.Item
            name="files"
            label="病历图片"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload.Dragger
              name="files"
              multiple
              beforeUpload={() => false}
              maxCount={5}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持上传最多5张图片，格式为JPG、PNG等
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="病历图片"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setImageModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedImage && (
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: 20,
              overflow: 'auto',
              maxHeight: 600,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onWheel={handleImageWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={selectedImage} 
              alt="放大图片"
              style={{ 
                transform: `translate(${translateX}px, ${translateY}px) scale(${imageScale})`,
                transition: 'transform 0.1s ease',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MedicalRecords