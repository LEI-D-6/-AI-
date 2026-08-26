import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography, Card, Row, Col, Tag, Input, Select, Pagination, Empty } from 'antd'
import {
  ReadOutlined,
  CalendarOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

// 健康资讯数据
const healthNewsData = [
  {
    id: 1,
    title: '京东发布首个院内部署的大模型产品——京东卓医',
    summary: '2025京东健康数智医疗大会在北京成功举行，会上发布了业内首个医院全场景应用大模型产品——京东卓医（JOY DOC），面向患者就医、医生诊疗、医院管理全场景。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hospital%20technology%20conference%20with%20AI%20medical%20technology%20展示&image_size=landscape_16_9',
    category: '医疗科技',
    date: '2026-04-03',
    views: 1567,
    content: '2025京东健康数智医疗大会在北京成功举行。会上，京东健康全新发布了业内首个医院全场景应用大模型产品——京东卓医（JOY DOC）。面向患者就医、医生诊疗、医院管理全场景，京东健康依托“京医千询”医疗大模型技术底座，通过构建京东卓医“个人就医管家”（AiP-Ai for Patient）、京东卓医“医生数字分身”（AiD-Ai for Doctor）、京东卓医“未来数字医院”（AiH-Ai forHospital），致力于让患者看病更舒心、医生临床科研更高效、医院管理更智能。'
  },
  {
    id: 2,
    title: '免疫警报器的奥秘被揭示',
    summary: '科学家揭示了“免疫警报器”的奥秘，这一发现对于理解免疫系统如何应对病原体和开发新的免疫治疗方法具有重要意义。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=immune%20system%20cells%20fighting%20pathogens%20microscopic%20view&image_size=landscape_16_9',
    category: '医学研究',
    date: '2026-04-02',
    views: 1234,
    content: '科学家最近揭示了“免疫警报器”的奥秘，这一发现对于理解免疫系统如何应对病原体和开发新的免疫治疗方法具有重要意义。研究人员发现，免疫系统中的特定细胞能够通过识别病原体的特征分子，迅速启动免疫反应，保护机体免受感染。这一机制的发现为开发更有效的疫苗和免疫治疗策略提供了新的思路。'
  },
  {
    id: 3,
    title: '硅藻微米机器人精准狙击脑胶质瘤',
    summary: '科学家开发出一种基于硅藻的微米机器人，能够精准“狙击”脑胶质瘤，为脑肿瘤的治疗提供了新的可能。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=microscopic%20robots%20targeting%20brain%20tumor%20medical%20technology&image_size=landscape_16_9',
    category: '医学研究',
    date: '2026-04-01',
    views: 987,
    content: '科学家开发出一种基于硅藻的微米机器人，能够精准“狙击”脑胶质瘤，为脑肿瘤的治疗提供了新的可能。这种微米机器人利用硅藻的天然结构，装载治疗药物，通过磁场引导，能够穿越血脑屏障，直达肿瘤部位，释放药物，实现精准治疗。这一技术的出现为脑胶质瘤患者带来了新的希望。'
  },
  {
    id: 4,
    title: '内质网膜平衡及脂质分配调控机制揭示',
    summary: '研究人员揭示了内质网膜平衡及脂质分配的调控机制，这一发现对于理解细胞代谢和相关疾病的发生机制具有重要意义。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=endoplasmic%20reticulum%20cell%20structure%20microscopic%20view&image_size=landscape_16_9',
    category: '医学研究',
    date: '2026-03-31',
    views: 876,
    content: '研究人员揭示了内质网膜平衡及脂质分配的调控机制，这一发现对于理解细胞代谢和相关疾病的发生机制具有重要意义。内质网是细胞内重要的细胞器，参与蛋白质合成、脂质代谢等多种生理过程。研究发现，特定的蛋白质能够调节内质网膜的动态平衡和脂质的分配，这一机制的异常与多种疾病的发生密切相关。'
  },
  {
    id: 5,
    title: '开心时步履轻快是多巴胺在起效',
    summary: '研究发现，开心时步履轻快与多巴胺的分泌有关，这一发现有助于理解情绪与身体运动之间的联系。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20person%20walking%20lightly%20dopamine%20effect&image_size=landscape_16_9',
    category: '心理健康',
    date: '2026-03-30',
    views: 765,
    content: '研究发现，开心时步履轻快与多巴胺的分泌有关，这一发现有助于理解情绪与身体运动之间的联系。当人们感到开心时，大脑会分泌更多的多巴胺，这种神经递质不仅能够改善情绪，还能够影响身体的运动方式，使步履变得轻快。这一发现为通过运动改善情绪提供了科学依据。'
  },
  {
    id: 6,
    title: '春季养生指南：如何预防慢性疾病复发',
    summary: '春季是慢性疾病高发季节，专家为您详细解读春季养生要点，帮助您预防疾病复发，保持健康体魄。春季气温变化大，人体新陈代谢加快，慢性病患者需要特别注意...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20health%20care%20traditional%20Chinese%20medicine&image_size=landscape_16_9',
    category: '养生知识',
    date: '2026-03-28',
    views: 1256,
    content: '春季养生是中医养生的重要组成部分。春季阳气生发，万物复苏，人体的新陈代谢也开始加快。对于慢性病患者来说，春季是一个需要特别注意的季节...'
  },
  {
    id: 7,
    title: '糖尿病患者的饮食管理：科学控糖有方法',
    summary: '合理饮食是控制糖尿病的关键，本文为您介绍科学的饮食管理方法，帮助您更好地控制血糖水平。饮食控制是糖尿病治疗的基础...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=diabetes%20healthy%20diet%20nutrition%20management&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-27',
    views: 982,
    content: '糖尿病是一种慢性代谢性疾病，饮食控制是糖尿病治疗的基础。合理的饮食可以帮助患者控制血糖，减少并发症的发生...'
  },
  {
    id: 8,
    title: '高血压患者的运动指南：安全有效的锻炼方式',
    summary: '适当的运动有助于控制血压，但高血压患者需要注意运动方式和强度，本文为您详细解读。运动是控制高血压的重要手段...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hypertension%20patient%20doing%20safe%20exercise&image_size=landscape_16_9',
    category: '运动健康',
    date: '2026-03-26',
    views: 756,
    content: '高血压是一种常见的慢性疾病，适当的运动可以帮助控制血压。但是，高血压患者在运动时需要注意运动方式和强度...'
  },
  {
    id: 9,
    title: '慢性病患者的自我管理：从生活方式开始',
    summary: '慢性病患者的自我管理对于疾病控制至关重要，本文为您介绍如何从生活方式入手，科学管理慢性病。包括饮食、运动、用药、定期检查等多个方面...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chronic%20disease%20self%20management%20lifestyle%20health&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-25',
    views: 1056,
    content: `慢性病是指病程长、病情迁延不愈的疾病，如高血压、糖尿病、冠心病、慢性阻塞性肺疾病等。这些疾病需要长期管理，患者的自我管理能力直接影响疾病的控制效果和生活质量。

**饮食管理**
饮食是慢性病管理的基础。不同的慢性病有不同的饮食要求：
- 高血压患者：低盐饮食，每日盐摄入量不超过5克，避免腌制食品、酱油等高盐食物。
- 糖尿病患者：控制总热量，合理分配碳水化合物、蛋白质和脂肪，选择低GI食物。
- 冠心病患者：低脂饮食，减少饱和脂肪和胆固醇的摄入，增加膳食纤维。
- 慢性肾病患者：低蛋白、低盐、低钾、低磷饮食。

**运动管理**
适当的运动有助于控制慢性病的进展：
- 有氧运动：散步、慢跑、游泳、骑自行车等，每周至少150分钟。
- 力量训练：增强肌肉力量，提高基础代谢率。
- 柔韧性训练：瑜伽、太极、拉伸等，改善关节活动度。

**用药管理**
- 按时服药：严格按照医嘱服药，不要自行增减药量或停药。
- 了解药物：了解药物的作用、副作用、服用时间等。
- 定期复查：根据医生的建议定期检查相关指标，调整治疗方案。

**心理管理**
慢性病患者常伴有焦虑、抑郁等心理问题：
- 保持积极心态：接受疾病，积极面对，树立战胜疾病的信心。
- 寻求支持：与家人、朋友、医生保持良好的沟通，必要时寻求心理医生的帮助。
- 培养兴趣爱好：转移注意力，丰富生活，提高生活质量。

**定期检查**
- 高血压患者：定期测量血压，至少每周1-2次。
- 糖尿病患者：定期监测血糖，包括空腹血糖、餐后血糖和糖化血红蛋白。
- 冠心病患者：定期检查心电图、血脂、血压等。
- 慢性肾病患者：定期检查肾功能、尿常规等。

**总结**
慢性病的自我管理是一个长期的过程，需要患者的坚持和努力。通过科学的饮食、适当的运动、规范的用药、良好的心理状态和定期的检查，患者可以有效地控制病情，减少并发症的发生，提高生活质量。`
  },
  {
    id: 10,
    title: '冠心病患者的日常护理与急救措施',
    summary: '冠心病是一种常见的慢性心血管疾病，日常护理对于病情控制非常重要。本文为您介绍冠心病患者的日常护理要点和急救措施，帮助患者和家属更好地应对疾病...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coronary%20heart%20disease%20patient%20care%20first%20aid&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-24',
    views: 923,
    content: `冠心病是由于冠状动脉粥样硬化导致心肌缺血、缺氧而引起的心脏病，是一种常见的慢性心血管疾病。日常护理对于冠心病患者的病情控制和生活质量提高至关重要。

**日常护理要点**

**饮食护理**
- 低盐饮食：每日盐摄入量应控制在5克以下，避免腌制食品、酱油等高盐食物。
- 低脂饮食：减少动物脂肪和胆固醇的摄入，选择植物油，避免油炸食品、肥肉等。
- 高纤维饮食：多吃蔬菜、水果、全谷物等，促进肠道蠕动，减少便秘。
- 适量蛋白质：选择瘦肉、鱼、豆制品等优质蛋白质。
- 控制总热量：保持理想体重，避免超重和肥胖。

**运动护理**
- 适量运动：根据病情选择适合的运动方式，如散步、慢跑、太极拳等。
- 运动时间：每次30分钟左右，每周3-5次，避免过度劳累。
- 运动强度：以不引起不适为原则，运动时心率应控制在最大心率的60-70%。
- 运动前热身：避免突然剧烈运动，运动前应进行5-10分钟的热身。
- 运动后放松：运动后应进行5-10分钟的放松活动，避免突然停止运动。

**用药护理**
- 按时服药：严格按照医嘱服药，不要自行增减药量或停药。
- 了解药物：了解药物的作用、副作用、服用时间等。
- 随身携带急救药物：如硝酸甘油等，以备不时之需。
- 定期复查：根据医生的建议定期检查心电图、血脂、血压等指标。

**生活护理**
- 戒烟限酒：吸烟是冠心病的重要危险因素，应彻底戒烟；限制饮酒，男性每日酒精摄入量不超过25克，女性不超过15克。
- 规律作息：保证充足的睡眠，避免熬夜。
- 避免劳累：避免过度体力和脑力劳动，注意劳逸结合。
- 保持心情舒畅：避免情绪激动、紧张、焦虑等不良情绪。
- 注意保暖：寒冷天气应注意保暖，避免寒冷刺激导致血管收缩。

**急救措施**

**心绞痛发作时**
- 立即停止活动，坐下或躺下休息。
- 舌下含服硝酸甘油片，每次1片，每5分钟可重复1次，最多3次。
- 如果疼痛持续不缓解，应立即拨打急救电话。

**心肌梗死发作时**
- 立即拨打急救电话，等待救援。
- 让患者保持安静，避免活动。
- 如果患者出现心跳骤停，应立即进行心肺复苏。

**预防措施**
- 控制危险因素：如高血压、糖尿病、高血脂、肥胖等。
- 健康生活方式：合理饮食、适量运动、戒烟限酒、保持心情舒畅。
- 定期体检：定期检查心电图、血脂、血压等指标，及早发现和治疗冠心病。
- 遵医嘱服药：按照医生的建议服用抗血小板药物、他汀类药物等，预防冠心病的发生和发展。

**总结**
冠心病患者的日常护理是一个长期的过程，需要患者和家属的共同努力。通过科学的饮食、适当的运动、规范的用药、良好的生活习惯和及时的急救措施，患者可以有效地控制病情，减少急性发作的风险，提高生活质量。`
  },
  {
    id: 11,
    title: '慢性阻塞性肺疾病的预防与管理',
    summary: '慢性阻塞性肺疾病（COPD）是一种常见的慢性呼吸系统疾病，严重影响患者的生活质量。本文为您介绍COPD的预防措施和管理方法，帮助患者更好地控制疾病...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=COPD%20chronic%20obstructive%20pulmonary%20disease%20patient%20breathing%20exercise&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-23',
    views: 876,
    content: `慢性阻塞性肺疾病（COPD）是一种以气流受限为特征的慢性呼吸系统疾病，主要包括慢性支气管炎和肺气肿。COPD的发病率和死亡率较高，严重影响患者的生活质量。

**COPD的危险因素**
- 吸烟：是COPD的主要危险因素，吸烟者患COPD的风险是非吸烟者的2-8倍。
- 空气污染：长期暴露于有害气体和颗粒物，如二氧化硫、二氧化氮、PM2.5等。
- 职业暴露：长期接触粉尘、化学物质等职业危害因素。
- 遗传因素：某些基因的突变可能增加COPD的易感性。
- 呼吸道感染：反复的呼吸道感染可能导致气道损伤。

**COPD的预防措施**
- 戒烟：是预防COPD的最重要措施，吸烟者应尽早戒烟。
- 避免暴露于有害气体和颗粒物：减少户外活动在空气污染严重的天气，使用空气净化器等。
- 职业防护：从事粉尘、化学物质等职业的人员应做好防护措施。
- 预防呼吸道感染：接种流感疫苗和肺炎球菌疫苗，避免接触呼吸道感染患者。
- 健康生活方式：合理饮食、适量运动、保持良好的心态。

**COPD的管理方法**

**药物治疗**
- 支气管扩张剂：如沙丁胺醇、异丙托溴铵等，缓解气流受限。
- 糖皮质激素：如布地奈德、氟替卡松等，减轻气道炎症。
- 祛痰药：如氨溴索、乙酰半胱氨酸等，促进痰液排出。
- 抗生素：用于治疗急性加重期的感染。

**非药物治疗**
- 氧疗：对于严重缺氧的患者，长期家庭氧疗可以提高生活质量和生存率。
- 呼吸康复：包括呼吸肌训练、运动训练、营养支持等。
- 肺减容术：对于严重肺气肿患者，可考虑肺减容术。
- 肺移植：对于终末期COPD患者，可考虑肺移植。

**日常管理**
- 避免诱因：避免接触过敏原、烟雾、粉尘等刺激性物质。
- 合理饮食：多吃富含蛋白质、维生素的食物，避免辛辣、刺激性食物。
- 适量运动：根据病情选择适合的运动方式，如散步、太极拳等。
- 呼吸训练：学习缩唇呼吸、腹式呼吸等呼吸技巧，改善呼吸功能。
- 定期复查：定期到医院检查肺功能、血气分析等指标，调整治疗方案。

**急性加重期的管理**
- 及时就医：出现咳嗽、咳痰、呼吸困难加重等症状时，应及时就医。
- 药物治疗：根据病情使用支气管扩张剂、糖皮质激素、抗生素等药物。
- 氧疗：根据病情给予适当的氧疗。
- 机械通气：对于严重呼吸困难的患者，可考虑机械通气治疗。

**总结**
COPD是一种慢性疾病，需要长期管理。通过戒烟、避免暴露于有害因素、合理的药物治疗和非药物治疗，患者可以有效地控制病情，减少急性加重的风险，提高生活质量。同时，患者应定期到医院复查，根据病情调整治疗方案。`
  },
  {
    id: 12,
    title: '慢性肾病的早期信号与预防措施',
    summary: '慢性肾病是一种常见的慢性疾病，早期症状不明显，容易被忽视。本文为您介绍慢性肾病的早期信号和预防措施，帮助您及早发现和预防慢性肾病...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chronic%20kidney%20disease%20early%20detection%20prevention&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-22',
    views: 789,
    content: `慢性肾病是指各种原因引起的肾脏结构和功能障碍，持续时间超过3个月。慢性肾病的早期症状不明显，容易被忽视，一旦发展到晚期，治疗难度大，预后差。因此，了解慢性肾病的早期信号和预防措施非常重要。

**慢性肾病的早期信号**
- 泡沫尿：尿液中出现大量泡沫，不易消失，可能是蛋白尿的表现。
- 血尿：尿液颜色变红，可能是血尿的表现。
- 尿量变化：尿量过多或过少，夜间尿量增多。
- 水肿：眼睑、面部、下肢等部位出现水肿。
- 高血压：血压升高，尤其是年轻人出现高血压。
- 疲劳乏力：由于肾脏功能下降，体内毒素堆积，导致疲劳乏力。
- 食欲不振：由于肾功能下降，体内毒素堆积，导致食欲不振。
- 皮肤瘙痒：由于肾功能下降，体内毒素堆积，导致皮肤瘙痒。

**慢性肾病的危险因素**
- 糖尿病：是慢性肾病的主要危险因素，约30%的糖尿病患者会发展为慢性肾病。
- 高血压：是慢性肾病的重要危险因素，约20%的高血压患者会发展为慢性肾病。
- 肥胖：肥胖会增加慢性肾病的风险。
- 吸烟：吸烟会损害肾脏血管，增加慢性肾病的风险。
- 家族史：有慢性肾病家族史的人患慢性肾病的风险较高。
- 年龄：随着年龄的增长，慢性肾病的发病率逐渐增加。
- 某些药物：长期使用某些药物，如非甾体抗炎药、抗生素等，可能损害肾脏。

**慢性肾病的预防措施**
- 控制血糖：糖尿病患者应严格控制血糖，定期监测血糖水平。
- 控制血压：高血压患者应严格控制血压，定期监测血压水平。
- 健康饮食：低盐、低脂、优质低蛋白饮食，多吃新鲜蔬菜、水果。
- 适量运动：保持适量的运动，控制体重。
- 戒烟限酒：戒烟，限制饮酒。
- 避免滥用药物：避免长期使用可能损害肾脏的药物，如非甾体抗炎药、抗生素等。
- 定期体检：定期检查尿常规、肾功能等指标，及早发现慢性肾病。
- 积极治疗原发病：积极治疗糖尿病、高血压等可能导致慢性肾病的疾病。

**慢性肾病的早期筛查**
- 尿常规：检查尿液中的蛋白质、红细胞等。
- 肾功能：检查血肌酐、尿素氮等指标。
- 肾脏B超：检查肾脏的大小、形态等。
- 血压：定期测量血压。

**总结**
慢性肾病的早期症状不明显，容易被忽视。通过了解慢性肾病的早期信号和危险因素，采取有效的预防措施，定期进行筛查，可以及早发现和预防慢性肾病，减少慢性肾病的发生和发展，提高生活质量。`
  },
  {
    id: 13,
    title: '骨质疏松症的预防与治疗',
    summary: '骨质疏松症是一种常见的慢性骨骼疾病，主要表现为骨量减少、骨组织微结构破坏，导致骨折风险增加。本文为您介绍骨质疏松症的预防与治疗方法...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=osteoporosis%20bone%20health%20prevention%20treatment&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-21',
    views: 756,
    content: `骨质疏松症是一种常见的慢性骨骼疾病，主要表现为骨量减少、骨组织微结构破坏，导致骨脆性增加，容易发生骨折。骨质疏松症的发病率随着年龄的增长而增加，尤其是绝经后的女性。

**骨质疏松症的危险因素**
- 年龄：随着年龄的增长，骨量逐渐减少，骨质疏松症的发病率增加。
- 性别：女性患骨质疏松症的风险高于男性，尤其是绝经后的女性。
- 家族史：有骨质疏松症家族史的人患骨质疏松症的风险较高。
- 种族：白人和亚洲人患骨质疏松症的风险高于黑人。
- 生活方式：吸烟、过度饮酒、缺乏运动、低钙饮食等。
- 疾病：某些疾病，如甲状腺功能亢进、糖尿病、类风湿关节炎等，可能增加骨质疏松症的风险。
- 药物：长期使用某些药物，如糖皮质激素、抗癫痫药物等，可能导致骨质疏松症。

**骨质疏松症的预防措施**
- 补充钙和维生素D：钙是骨骼的主要成分，维生素D有助于钙的吸收。建议每天摄入1000-1200毫克钙和800-1000国际单位维生素D。
- 适量运动：运动可以增加骨密度，减少骨量丢失。建议每周进行至少150分钟的中等强度有氧运动，如散步、慢跑、游泳等，同时进行力量训练。
- 戒烟限酒：吸烟会损害骨骼健康，增加骨质疏松症的风险；过度饮酒会影响钙的吸收和利用，增加骨质疏松症的风险。
- 避免跌倒：跌倒是导致骨质疏松症患者骨折的主要原因，应采取措施避免跌倒，如保持家居环境安全、使用辅助工具等。
- 定期检查：定期检查骨密度，及早发现骨质疏松症。

**骨质疏松症的治疗方法**
- 基础治疗：包括补充钙和维生素D、适量运动、戒烟限酒等。
- 药物治疗：
  - 双膦酸盐类药物：如阿仑膦酸钠、唑来膦酸等，抑制骨吸收，增加骨密度。
  - 甲状旁腺激素类似物：如特立帕肽，促进骨形成，增加骨密度。
  - 雌激素替代治疗：适用于绝经后的女性，缓解绝经症状，增加骨密度。
  - 选择性雌激素受体调节剂：如雷洛昔芬，模拟雌激素的作用，增加骨密度。
  - 降钙素：抑制骨吸收，缓解骨质疏松症引起的疼痛。
- 手术治疗：对于严重的骨质疏松症患者，如发生骨折，可能需要手术治疗。

**骨质疏松症的饮食建议**
- 多吃富含钙的食物：如牛奶、酸奶、奶酪、豆制品、绿叶蔬菜等。
- 多吃富含维生素D的食物：如鱼肝油、蛋黄、深海鱼等。
- 多吃富含蛋白质的食物：如瘦肉、鱼、鸡蛋、豆制品等。
- 多吃富含维生素K的食物：如绿叶蔬菜、豆类、坚果等。
- 避免过多摄入咖啡因和盐：咖啡因和盐会增加钙的流失。

**总结**
骨质疏松症是一种常见的慢性骨骼疾病，严重影响患者的生活质量。通过采取有效的预防措施，如补充钙和维生素D、适量运动、戒烟限酒等，可以减少骨质疏松症的发生和发展。对于已经患有骨质疏松症的患者，应及时就医，采取药物治疗等措施，减少骨折的风险，提高生活质量。`
  },
  {
    id: 14,
    title: '类风湿关节炎的日常管理与治疗',
    summary: '类风湿关节炎是一种常见的慢性自身免疫性疾病，主要表现为关节疼痛、肿胀、畸形等。本文为您介绍类风湿关节炎的日常管理与治疗方法，帮助患者更好地控制疾病...',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rheumatoid%20arthritis%20joint%20pain%20management%20treatment&image_size=landscape_16_9',
    category: '疾病管理',
    date: '2026-03-20',
    views: 723,
    content: `类风湿关节炎是一种常见的慢性自身免疫性疾病，主要表现为对称性、多关节肿胀、疼痛、畸形等，严重影响患者的生活质量。类风湿关节炎的病因尚不清楚，可能与遗传、环境、感染等因素有关。

**类风湿关节炎的症状**
- 关节症状：关节疼痛、肿胀、僵硬，尤其是早晨起床后关节僵硬明显，称为晨僵。
- 关节外症状：发热、乏力、体重下降、皮下结节、眼炎等。
- 晚期症状：关节畸形、功能障碍，甚至残疾。

**类风湿关节炎的日常管理**

**饮食管理**
- 均衡饮食：多吃新鲜蔬菜、水果、全谷物、瘦肉、鱼等，保证营养均衡。
- 避免食用可能加重炎症的食物：如辛辣、刺激性食物、高脂肪食物、加工食品等。
- 补充 omega-3 脂肪酸：如深海鱼、亚麻籽、核桃等，有助于减轻炎症。
- 补充维生素和矿物质：如维生素D、钙、锌等，有助于骨骼健康。

**运动管理**
- 适当运动：适当的运动可以保持关节的灵活性，增强肌肉力量，改善生活质量。
- 选择适合的运动方式：如散步、游泳、骑自行车、太极拳等，避免剧烈运动和高冲击运动。
- 运动前热身：运动前应进行5-10分钟的热身，避免关节损伤。
- 运动后放松：运动后应进行5-10分钟的放松活动，缓解肌肉疲劳。
- 循序渐进：逐渐增加运动强度和时间，避免过度劳累。

**生活管理**
- 保持良好的心态：接受疾病，积极面对，树立战胜疾病的信心。
- 避免过度劳累：注意休息，避免过度体力和脑力劳动。
- 注意保暖：避免关节受凉，尤其是在寒冷的天气。
- 保持良好的姿势：避免长时间保持同一姿势，如久坐、久站等。
- 使用辅助工具：如拐杖、轮椅等，减轻关节负担。

**类风湿关节炎的治疗方法**

**药物治疗**
- 非甾体抗炎药：如布洛芬、双氯芬酸钠等，缓解关节疼痛和肿胀。
- 改善病情抗风湿药：如甲氨蝶呤、柳氮磺吡啶、来氟米特等，延缓疾病进展。
- 生物制剂：如肿瘤坏死因子抑制剂、白细胞介素-6抑制剂等，靶向治疗类风湿关节炎。
- 糖皮质激素：如泼尼松、地塞米松等，快速缓解炎症，但长期使用可能有副作用。

**非药物治疗**
- 物理治疗：如热疗、冷敷、按摩、针灸等，缓解关节疼痛和肿胀。
- 康复训练：如关节活动度训练、肌肉力量训练等，改善关节功能。
- 手术治疗：对于严重的关节畸形和功能障碍，可考虑手术治疗，如关节置换术。

**定期复查**
- 定期到医院复查，监测疾病活动度、药物副作用等。
- 根据病情调整治疗方案，确保治疗效果。

**总结**
类风湿关节炎是一种慢性疾病，需要长期管理。通过科学的饮食、适当的运动、规范的药物治疗和良好的生活习惯，患者可以有效地控制病情，减少关节畸形和功能障碍的发生，提高生活质量。同时，患者应定期到医院复查，根据病情调整治疗方案。`
  }
]

// 分类选项
const categories = ['全部', '医疗科技', '医学研究', '养生知识', '疾病管理', '运动健康', '心理健康', '安全防护']

function HealthNews() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // 从URL参数中获取页码
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const page = params.get('page')
    if (page) {
      setCurrentPage(parseInt(page))
    }
  }, [location.search])

  // 过滤资讯
  const filteredNews = healthNewsData.filter(news => {
    const matchSearch = news.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       news.summary.toLowerCase().includes(searchText.toLowerCase())
    const matchCategory = selectedCategory === '全部' || news.category === selectedCategory
    return matchSearch && matchCategory
  })

  // 分页
  const total = filteredNews.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentNews = filteredNews.slice(startIndex, endIndex)

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>
          <ReadOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          健康资讯
        </Title>
        <Text type="secondary">了解最新的健康知识和疾病管理方法</Text>
      </div>

      {/* 搜索和筛选 */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索健康资讯..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value)}
          style={{ width: 150 }}
        >
          {categories.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>
      </div>

      {/* 资讯列表 */}
      {currentNews.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {currentNews.map((news) => (
              <Col xs={24} md={12} lg={8} key={news.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img
                        alt={news.title}
                        src={news.image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/health-news/${news.id}?page=${currentPage}`)}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Tag color="blue">{news.category}</Tag>
                  </div>
                  <Title level={4} style={{ marginBottom: 12, fontSize: '16px' }} ellipsis={{ rows: 2 }}>
                    {news.title}
                  </Title>
                  <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 12, fontSize: '14px' }}>
                    {news.summary}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '13px' }}>
                    <span><CalendarOutlined style={{ marginRight: 4 }} />{news.date}</span>
                    <span><EyeOutlined style={{ marginRight: 4 }} />{news.views}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 分页 */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无相关资讯" />
      )}
    </div>
  )
}

export default HealthNews