import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Layout, 
  Typography, 
  Table, 
  Space, 
  Button, 
  Card, 
  Avatar, 
  Tag,
  Modal,
  Form,
  Input,
  message,
  Popconfirm
} from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { patientApi } from '../services/api'

const { Header, Sider, Content, Footer } = Layout
const { Title, Text } = Typography

function PatientManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [form] = Form.useForm()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const data = await patientApi.getPatients()
      setPatients(data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      message.error('获取患者列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleAdd = () => {
    setEditingPatient(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingPatient(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      message.success('删除功能开发中')
    } catch (error) {
      console.error('Failed to delete patient:', error)
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingPatient) {
        await patientApi.updatePatient(editingPatient.id, values)
        message.success('更新成功')
      } else {
        await patientApi.createPatient(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchPatients()
    } catch (error) {
      console.error('Failed to save patient:', error)
      message.error('保存失败')
    }
  }

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_, record) => (
        <Avatar icon={<UserOutlined />} />
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? '男' : '女'}
        </Tag>
      ),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除这个患者吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
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
          <Button type="primary" onClick={() => navigate('/dashboard')}>返回首页</Button>
        </Space>
      </Header>
      <Layout>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>患者管理</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增患者
              </Button>
            </div>
            
            <Table 
              columns={columns} 
              dataSource={patients} 
              rowKey="id"
              loading={loading}
            />
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            慢性病智能管理系统 ©2026
          </Footer>
        </Layout>
      </Layout>

      <Modal
        title={editingPatient ? '编辑患者' : '新增患者'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="user_id"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Input placeholder="请输入性别 (male/female)" />
          </Form.Item>
          <Form.Item
            name="age"
            label="年龄"
            rules={[{ required: true, message: '请输入年龄' }]}
          >
            <Input type="number" placeholder="请输入年龄" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
          >
            <Input.TextArea placeholder="请输入地址" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default PatientManagement
