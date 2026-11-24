---
title: 'BIGCity: A Universal Spatiotemporal Model for Unified Trajectory and Traffic
  State Data Analysis'
authors: X. Yu, J. Wang, Y. Yang, Q. Huang, and K. Qu
venue: ICDE
year: 2025
topic: cities
topic_label: 城市智能
project: ''
paper_url: /downloads/BIGCity- A Universal Spatiotemporal Model for Unified Trajectory
  and Traffic State Data Analysis.pdf
code_url: ''
source_url: https://www.bigscity.net/publications/bigcity-a-universal-spatiotemporal-model-for-unified-trajectory-and-traffic-state-data-analysis/
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

Spatiotemporal (ST) data analysis is a critical area of research in data engineering. Typical dynamic ST data includes trajectory data (representing individual-level mobility) and traffic state data (representing population-level mobility). Traditional studies often treat trajectory and traffic state data as distinct, independent modalities, each tailored to specific tasks within a single modality. However, real-world applications, such as navigation apps, require joint analysis of trajectory and traffic state data. Treating these data types as two separate domains can lead to suboptimal model performance. Although recent advances in ST data pre-training and ST foundation models aim to develop universal models for ST data analysis, most existing models are “multi-task, solo-data modality” (MTSM), meaning they can handle multiple tasks within either trajectory data or traffic state data, but not both simultaneously. To address this gap, this paper introduces BIGCity, a pioneer multi-task, multi-data modality (MTMD) model for ST data analysis. The model targets two key challenges in designing an MTMD ST model: (1) unifying the representations of different ST data modalities, and (2) unifying heterogeneous ST analysis tasks. To overcome the first challenge, BIGCity introduces a novel STunit that represents both trajectories and traffic states in a unified format. Additionally, for the second challenge, BIGCity adopts a tunable large model with ST task-oriented prompt, enabling it to perform a range of heterogeneous tasks without the need for fine-tuning. Extensive experiments on real-world datasets demonstrate that BIGCity achieves state-of-the-art performance across 8 tasks, outperforming 17 baselines. Our code are available at https://github.com/bigscity/BIGCity.
