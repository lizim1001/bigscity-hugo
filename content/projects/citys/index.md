---
title: AI + 城市管理
key: citys
order: 1
category: 城市体系
cover_alt: 暮色中的滨水天际线，细蓝色数据线沿水面向远处汇聚（AI 生成场景示意）
category_en: AI FOR URBAN MANAGEMENT
description: 用城市数据与时空模型分析交通、出行和城市运行，为城市管理提供决策依据。
tags:
- 城市计算
- 时空数据
- 城市表征
topic: cities
draft: false
featured: true
flow:
- title: 城市数据
  detail: 空间、轨迹与交通状态
- title: 城市表示
  detail: 结构与时空关系
- title: 城市分析
  detail: 预测与决策
resources:
- name: LibCity
  description: 交通预测开源库
  url: https://github.com/LibCity/Bigscity-LibCity
  docs: https://libcity.ai/
  paper: https://dl.acm.org/doi/10.1145/3474717.3483923
- name: VecCity
  description: 地图实体表征学习
  url: https://github.com/Bigscity-VecCity/VecCity
  paper: /publications/#paper-veccity-a-taxonomy-guided-library-for-map-entity-representation-learning
- name: BIGCity
  description: 轨迹与交通状态统一建模
  url: https://github.com/bigscity/BIGCity
  paper: /publications/#paper-bigcity-a-universal-spatiotemporal-model-for-unified-trajectory-and-traffic-state-data-analysis
- name: PDFormer
  description: 传播延迟感知交通预测
  url: https://github.com/BUAABIGSCity/PDFormer
  paper: /publications/#paper-pdformer-propagation-delay-aware-dynamic-long-range-transformer-for-traffic-flow-prediction
aliases:
- /resources/
---

## 项目概述

用城市数据与时空模型分析交通、出行和城市运行，为城市管理提供决策依据。

## 研究问题

### 城市数据

如何描述空间结构、个体轨迹与群体交通状态之间的联系？

### 城市表示

如何结合静态结构与动态状态，学习可用于不同任务的城市表征？

### 城市分析

如何比较城市分析方法的预测表现、泛化能力与实验可复现性？
