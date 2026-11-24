---
title: Personalized Route Recommendation with Neural Network Enhanced A∗ Search Algorithm
authors: J. Wang, N. Wu, and X. Zhao
venue: TKDE
year: 2021
topic: optimization
topic_label: 组合优化
project: ''
paper_url: /downloads/Personalized Route Recommendation with Neural Network Enhanced
  A∗ Search Algorithm.pdf
code_url: https://github.com/bigscity/NASR
source_url: https://www.bigscity.net/publications/personalized-route-recommendation-with-neural-network-enhanced-a-search-algorithm/
draft: false
rankings:
- CCF A
publication_type: journal
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

In this work, we study an important task in location-based services, namely Personalized Route Recommendation (PRR). Given a road network, the PRR task aims to generate user-specific route suggestions for replying to users’ route queries. A classic approach is to adapt search algorithms to construct pathfinding-like solutions. These methods typically focus on reducing search space with suitable heuristic strategies. For these search algorithms, heuristic strategies are often handcrafted, which are not flexible to work in complicated task settings. In addition, it is difficult to utilize useful context information in the search procedure. To develop a more principled solution to the PRR task, we propose to improve search algorithms with neural networks for solving the PRR task based on the widely used A∗ algorithm. The main idea of our solution is to automatically learn the cost functions in A∗ algorithms, which is the key of heuristic search algorithms. Our model consists of two main components. First, we employ attention-based Recurrent Neural Networks (RNN) to model the cost from the source to the candidate location by incorporating useful context information. Instead of learning a single cost value, the RNN component is able to learn a time-varying vectorized representation for the moving state of a user. Second, we propose to use an estimation network for predicting the cost from a candidate location to the destination. For capturing structural characteristics, the estimation network is built on top of position-aware graph attention networks. The two components are integrated in a principled way for deriving a more accurate cost of a candidate location for the A∗ algorithm. Extensive experiment results on three real-world datasets have shown the effectiveness and robustness of the proposed model.
