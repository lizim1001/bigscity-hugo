---
title: 'VecCity: A Taxonomy-guided Library for Map Entity Representation Learning'
authors: W. Zhang, J. Wang, Y. Yang, and L. H. U
venue: VLDB
year: 2025
topic: cities
topic_label: 城市智能
project: ''
paper_url: /downloads/VecCity- A Taxonomy-guided Library for Map Entity Representation
  Learning.pdf
code_url: https://github.com/Bigscity-VecCity/VecCity
source_url: https://www.bigscity.net/publications/veccity-a-taxonomy-guided-library-for-map-entity-representation-learning/
draft: false
rankings:
- CCF A
publication_type: journal
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

Electronic maps consist of diverse entities, such as points of interest (POIs), road segments, and land parcels, playing a vital role in applications like ITS and LBS. Map entity representation learning (MapRL) generates versatile and reusable data representations, providing essential tools for efficiently managing and utilizing map entity data. Despite the progress in MapRL, two key challenges constrain further development. First, existing research is fragmented, with models classified by the type of map entity, limiting the reusability of techniques across different tasks. Second, the lack of unified benchmarks makes systematic evaluation and comparison of models difficult. To address these challenges, we propose a novel taxonomy for MapRL that organizes models based on functional modules—such as encoders, pre-training tasks, and downstream tasks—rather than by entity type. Building on this taxonomy, we present a taxonomy-driven library, VecCity, which offers easy-to-use interfaces for encoding, pre-training, fine-tuning, and evaluation. The library integrates datasets from nine cities and reproduces 21 mainstream MapRL models, establishing the first standardized benchmarks for the field. VecCity also allows users to modify and extend models through modular components, facilitating seamless experimentation. Our comprehensive experiments cover multiple types of map entities and evaluate 21 Vec- City pre-built models across various downstream tasks. Experimental results demonstrate the effectiveness of VecCity in streamlining model development and provide insights into the impact of various components on performance. By promoting modular design and reusability, VecCity offers a unified framework to advance research and innovation in MapRL. The code is available at https://github.com/Bigscity-VecCity/VecCity.
