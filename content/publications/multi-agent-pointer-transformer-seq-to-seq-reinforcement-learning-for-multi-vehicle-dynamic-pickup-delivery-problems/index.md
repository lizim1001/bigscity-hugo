---
title: 'Multi-Agent Pointer Transformer: Seq-to-Seq Reinforcement Learning for Multi-Vehicle
  Dynamic Pickup-Delivery Problems'
authors: Z. Zou, J. Wang, Y. Huang, and J. Wu
venue: AAAI
year: 2026
topic: optimization
topic_label: 组合优化
project: ''
paper_url: ''
code_url: ''
source_url: https://www.bigscity.net/publications/multi-agent-pointer-transformer-seq-to-seq-reinforcement-learning-for-multi-vehicle-dynamic-pickup-delivery-problems/
draft: false
rankings:
- CCF A
publication_type: conference
member_ids:
- jingyuan-wang
tags:
- 组合优化
- 智能决策
coverage: []
quality_selected: false
rank_source: ../bigscity-hugo/content/jingyuan-wang/index.html
build:
  render: never
  list: always
---

This paper addresses the cooperative Multi-Vehicle Dynamic Pickup and Delivery Problem with Stochastic Requests (MVDPDPSR) and proposes an end-to-end centralized decision-making framework based on sequence-to-sequence, named Multi-Agent Pointer Transformer (MAPT). MVDPDPSR is an extension of the vehicle routing problem and a spatio-temporal system optimization problem, widely applied in scenarios such as on-demand delivery. Classical operations research methods face bottlenecks in computational complexity and time efficiency when handling large-scale dynamic problems. Although existing reinforcement learning methods have achieved some progress, they still encounter several challenges: 1) Independent decoding across multiple vehicles fails to model joint action distributions; 2) The feature extraction network struggles to capture inter-entity relationships; 3) The joint action space is exponentially large. To address these issues, we designed the MAPT framework, which employs a Transformer Encoder to extract entity representations, combines a Transformer Decoder with a Pointer Network to generate joint action sequences in an AutoRegressive manner, and introduces a Relation-Aware Attention module to capture inter-entity relationships. Additionally, we guide the model’s decision-making using informative priors to facilitate effective exploration. Experiments on 8 datasets demonstrate that MAPT significantly outperforms existing baseline methods in terms of performance and exhibits substantial computational time advantages compared to classical operations research methods.
