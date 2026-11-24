---
title: 'OrthoSolver: A Neural Proper Orthogonal Decomposition Solver for PDEs'
authors: Y. Pang, J. Wang, J. Ji, and F. Mu
venue: ICLR
year: 2026
topic: foundations
topic_label: 基础与交叉
project: ''
paper_url: /downloads/OrthoSolver- A Neural Proper Orthogonal Decomposition Solver
  for PDEs.pdf
code_url: ''
source_url: https://www.bigscity.net/publications/orthosolver-a-neural-proper-orthogonal-decomposition-solver-for-pdes/
draft: false
rankings:
- CCF A
publication_type: conference
member_ids:
- jingyuan-wang
tags:
- 机器学习
- AI for Science
coverage: []
quality_selected: false
rank_source: ../bigscity-hugo/content/jingyuan-wang/index.html
build:
  render: never
  list: always
---

Proper Orthogonal Decomposition (POD) is a cornerstone reduced-order modeling technique for accelerating the solution of partial differential equations (PDEs) by extracting energy-optimal orthogonal bases. However, POD’s inherent linear assumption limits its expressive power for complex nonlinear dynamics, and its snapshot-based fixed bases generalize poorly to unseen scenarios. Meanwhile, emerging deep learning solvers have explored integrating decomposition architectures, yet their purely data-driven nature lacks essential physical priors and leads to modal collapse, where decomposed modes lose discriminative power. To address these challenges, we revisit POD from an information-theoretic perspective. We theoretically establish that POD’s classical energy-maximization criterion is, in essence, a principle of maximizing mutual information. Guided by this insight, we propose OrthoSolver, a neural proper orthogonal decomposition framework that generalizes this core information-theoretic principle to the nonlinear domain. OrthoSolver iteratively and adaptively extracts a set of compact and expressive nonlinear basis modes by directly maximizing their mutual information with the data field. Furthermore, an orthogonality regularization is imposed to preserve the diversity of the learned modes and effectively mitigate mode collapse. Extensive experiments on seven PDE benchmarks demonstrate that OrthoSolver consistently outperforms state-of-the-art deep learning baselines.
