import React, { useState, useEffect } from 'react'
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
  InputNumber,
  DatePicker,
  message,
  Descriptions,
  Row,
  Col,
  Statistic
} from 'antd'
import { 
  PlusOutlined, 
  EyeOutlined,
  HeartOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { healthDataApi } from '../services/api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function HealthRecords() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [form] = Form.useForm()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const mockRecords = [
    {
      id: 1,
      record_date: '2024-01-15',
      blood_pressure: '120/80',
      heart_rate: 75,
      blood_sugar: 5.6,
      weight: 70.5,
      height: 175,
      notes: '正常体检'
    },
    {
      id: 2,
      record_date: '2024-01-08',
      blood_pressure: '125/82',
      heart_rate: 78,
      blood_sugar: 5.8,
      weight: 71.0,
      height: 175,
      notes: '略有波动，注意饮食'
    },
    {
      id: 3,
      record_date: '2024-01-01',
      blood_pressure: '118/78',
      heart_rate: 72,
      blood_sugar: 5.4,
      weight: 70.0,
      height: 175,
      notes: '新年体检，状态良好'
    }
  ]

  useEffect(() => {
    setRecords(mockRecords)
  }, [])

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleView = (record) => {
    setSelectedRecord(record)
    setViewModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const newRecord = {
        id: records.length + 1,
        ...values,
        record_date: values.record_date.format('YYYY-MM-DD')
      }
      setRecords([newRecord, ...records])
      message.success('健康记录添加成功')
      setModalVisible(false)
    } catch (error) {
      console.error('Failed to add health record:', error)
      message.error('添加失败')
    }
  }

  const getHealthStatus = (record) => {
    const bp = record.blood_pressure?.split('/')
    const systolic = parseInt(bp?.[0])
    const diastolic = parseInt(bp?.[1])
    
    if (systolic > 140 || diastolic > 90) {
      return <Tag color="red">偏高</Tag>
    } else if (systolic < 90 || diastolic < 60) {
      return <Tag color="blue">偏低</Tag>
    }
    return <Tag color="green">正常</Tag>
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'record_date',
      key: 'record_date',
    },
    {
      title: '血压',
      dataIndex: 'blood_pressure',
      key: 'blood_pressure',
    },
    {
      title: '心率',
      dataIndex: 'heart_rate',
      key: 'heart_rate',
      render: (val) => `${val} 次/分`,
    },
    {
      title: '血糖',
      dataIndex: 'blood_sugar',
      key: 'blood_sugar',
      render: (val) => `${val} mmol/L`,
    },
    {
      title: '体重',
      dataIndex: 'weight',
      key: 'weight',
      render: (val) => `${val} kg`,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getHealthStatus(record),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#001529',
        padding: '0 24px'
      }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>慢性病智能管理系统</Title>
        <Space>
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/dashboard')}>
            返回首页
          </Button>
        </Space>
      </Header>
      <Layout style={{ padding: '24px' }}>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>
              <HeartOutlined style={{ marginRight: 8 }} />
              健康记录
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增记录
            </Button>
          </div>
          
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="总记录数" value={records.length} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="本月记录" value={2} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="健康状态" 
                  value="良好" 
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<HeartOutlined />} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="BMI指数" value={23.0} precision={1} />
              </Card>
            </Col>
          </Row>
          
          <Table 
            columns={columns} 
            dataSource={records} 
            rowKey="id"
            loading={loading}
          />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          慢性病智能管理系统 ©2026
        </Footer>
      </Layout>

      <Modal
        title="新增健康记录"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="record_date"
            label="记录日期"
            rules={[{ required: true, message: '请选择记录日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="blood_pressure"
                label="血压 (mmHg)"
                rules={[{ required: true, message: '请输入血压' }]}
              >
                <Input placeholder="例如: 120/80" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="heart_rate"
                label="心率 (次/分)"
                rules={[{ required: true, message: '请输入心率' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="75" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="blood_sugar"
                label="血糖 (mmol/L)"
                rules={[{ required: true, message: '请输入血糖' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} placeholder="5.6" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="体重 (kg)"
                rules={[{ required: true, message: '请输入体重' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} placeholder="70.5" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="height"
            label="身高 (cm)"
          >
            <InputNumber style={{ width: '100%' }} placeholder="175" />
          </Form.Item>
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="添加备注信息..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="健康记录详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedRecord && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="记录日期">{selectedRecord.record_date}</Descriptions.Item>
            <Descriptions.Item label="血压">{selectedRecord.blood_pressure} mmHg</Descriptions.Item>
            <Descriptions.Item label="心率">{selectedRecord.heart_rate} 次/分</Descriptions.Item>
            <Descriptions.Item label="血糖">{selectedRecord.blood_sugar} mmol/L</Descriptions.Item>
            <Descriptions.Item label="体重">{selectedRecord.weight} kg</Descriptions.Item>
            {selectedRecord.height && (
              <Descriptions.Item label="身高">{selectedRecord.height} cm</Descriptions.Item>
            )}
            {selectedRecord.notes && (
              <Descriptions.Item label="备注">{selectedRecord.notes}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </Layout>
  )
}

export default HealthRecords
