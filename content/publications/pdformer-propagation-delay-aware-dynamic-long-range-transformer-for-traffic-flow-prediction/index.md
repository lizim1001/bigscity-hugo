---
title: 'PDFormer: Propagation Delay-aware Dynamic Long-range Transformer for Traffic
  Flow Prediction'
authors: J. Jiang, C. Han, W. X. Zhao, and J. Wang
venue: AAAI
year: 2023
topic: cities
topic_label: 城市智能
project: ''
paper_url: /downloads/PDFormer_ Propagation Delay-Aware Dynamic Long-Range Transformer
  for Traffic Flow Prediction.pdf
code_url: https://github.com/BUAABIGSCity/PDFormer
source_url: https://www.bigscity.net/publications/pdformer-propagation-delay-aware-dynamic-long-range-transformer-for-traffic-flow-prediction/
draft: false
rankings:
- CCF A
publication_type: conference
member_ids:
- jingyuan-wang
tags:
- 城市计算
- 时空学习
coverage: []
quality_selected: false
rank_source: ../bigscity-hugo/content/jingyuan-wang/index.html
build:
  render: never
  list: always
---

As a core technology of Intelligent Transportation System, traffic flow prediction has a wide range of applications. The fundamental challenge in traffic flow prediction is to effec- tively model the complex spatial-temporal dependencies in traffic data. Spatial-temporal Graph Neural Network (GNN) models have emerged as one of the most promising meth- ods to solve this problem. However, GNN-based models have three major limitations for traffic prediction: i) Most methods model spatial dependencies in a static manner, which limits the ability to learn dynamic urban traffic patterns; ii) Most methods only consider short-range spatial information and are unable to capture long-range spatial dependencies; iii) These methods ignore the fact that the propagation of traf- fic conditions between locations has a time delay in traffic systems. To this end, we propose a novel Propagation Delay- aware dynamic long-range transFormer, namely PDFormer, for accurate traffic flow prediction. Specifically, we design a spatial self-attention module to capture the dynamic spatial dependencies. Then, two graph masking matrices are intro- duced to highlight spatial dependencies from short- and long- range views. Moreover, a traffic delay-aware feature transfor- mation module is proposed to empower PDFormer with the capability of explicitly modeling the time delay of spatial in- formation propagation. Extensive experimental results on six real-world public traffic datasets show that our method can not only achieve state-of-the-art performance but also exhibit competitive computational efficiency. Moreover, we visualize the learned spatial-temporal attention map to make our model highly interpretable.
