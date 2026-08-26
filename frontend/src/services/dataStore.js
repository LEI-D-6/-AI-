const DATA_KEYS = {
  MEDICAL_RECORDS: 'medical_records',
  TREATMENT_PLANS: 'treatment_plans',
  PATIENT_HEALTH_DATA: 'patient_health_data',
  CONVERSATIONS: 'conversations'
}

export const dataStore = {
  getMedicalRecords() {
    const records = localStorage.getItem(DATA_KEYS.MEDICAL_RECORDS)
    return records ? JSON.parse(records) : []
  },

  saveMedicalRecord(record) {
    const records = this.getMedicalRecords()
    const newRecord = {
      ...record,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString()
    }
    records.unshift(newRecord)
    localStorage.setItem(DATA_KEYS.MEDICAL_RECORDS, JSON.stringify(records))
    return newRecord
  },

  getMedicalRecordsByPatient(patientId) {
    return this.getMedicalRecords().filter(r => r.patientId === patientId)
  },

  getTreatmentPlans() {
    const plans = localStorage.getItem(DATA_KEYS.TREATMENT_PLANS)
    return plans ? JSON.parse(plans) : []
  },

  saveTreatmentPlan(plan) {
    const plans = this.getTreatmentPlans()
    const newPlan = {
      ...plan,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString()
    }
    plans.unshift(newPlan)
    localStorage.setItem(DATA_KEYS.TREATMENT_PLANS, JSON.stringify(plans))
    return newPlan
  },

  getTreatmentPlansByPatient(patientId) {
    return this.getTreatmentPlans().filter(p => p.patientId === patientId)
  },

  getPatientHealthData() {
    const data = localStorage.getItem(DATA_KEYS.PATIENT_HEALTH_DATA)
    return data ? JSON.parse(data) : []
  },

  savePatientHealthData(data) {
    const healthData = this.getPatientHealthData()
    const newData = {
      ...data,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString()
    }
    healthData.unshift(newData)
    localStorage.setItem(DATA_KEYS.PATIENT_HEALTH_DATA, JSON.stringify(healthData))
    return newData
  },

  getHealthDataByPatient(patientId) {
    return this.getPatientHealthData().filter(d => d.patientId === patientId)
  },

  clearAllData() {
    localStorage.removeItem(DATA_KEYS.MEDICAL_RECORDS)
    localStorage.removeItem(DATA_KEYS.TREATMENT_PLANS)
    localStorage.removeItem(DATA_KEYS.PATIENT_HEALTH_DATA)
  },

  removeDuplicates() {
    const removeDuplicatesById = (arr) => {
      const seen = new Set()
      return arr.filter(item => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
    }

    const records = removeDuplicatesById(this.getMedicalRecords())
    localStorage.setItem(DATA_KEYS.MEDICAL_RECORDS, JSON.stringify(records))

    const plans = removeDuplicatesById(this.getTreatmentPlans())
    localStorage.setItem(DATA_KEYS.TREATMENT_PLANS, JSON.stringify(plans))

    const healthData = removeDuplicatesById(this.getPatientHealthData())
    localStorage.setItem(DATA_KEYS.PATIENT_HEALTH_DATA, JSON.stringify(healthData))
  },

  getConversations() {
    const convs = localStorage.getItem(DATA_KEYS.CONVERSATIONS)
    return convs ? JSON.parse(convs) : []
  },

  getConversationByKey(key) {
    const conversations = this.getConversations()
    return conversations.find(c => String(c.key) === String(key)) || null
  },
  
  saveConversation(conversation) {
    const conversations = this.getConversations()
    const existingIndex = conversations.findIndex(c => String(c.key) === String(conversation.key))
    
    const newConversation = {
      ...conversation,
      id: conversation.id || Date.now() + Math.random(),
      updatedAt: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      conversations[existingIndex] = newConversation
    } else {
      conversations.unshift(newConversation)
    }
    
    localStorage.setItem(DATA_KEYS.CONVERSATIONS, JSON.stringify(conversations))
    console.log('Saved conversation:', newConversation)
    return newConversation
  },
  
  sendMessage(key, message) {
    const conversation = this.getConversationByKey(key) || {
      key: key,
      messages: []
    }

    const newMessage = {
      ...message,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      read: message.type === 'doctor' // 医生发送的消息默认已读
    }

    conversation.messages = [...(conversation.messages || []), newMessage]
    return this.saveConversation(conversation)
  },
  
  getMessages(key) {
    console.log('Getting messages with key:', key)
    const conversation = this.getConversationByKey(key)
    if (!conversation) {
      console.log('No conversation found for key:', key)
      return []
    }
    
    console.log('Found conversation with messages:', conversation.messages.length)
    
    // 标记患者消息为已读（当医生查看时）
    const messages = conversation.messages.map(msg => {
      if (msg.type === 'patient' && !msg.read) {
        return { ...msg, read: true }
      }
      return msg
    })
    
    // 如果有消息被标记为已读，更新会话
    if (messages.some(msg => msg.type === 'patient' && msg.read)) {
      conversation.messages = messages
      this.saveConversation(conversation)
      console.log('Updated conversation with read status')
    }
    
    return messages
  }
}
