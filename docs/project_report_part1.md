
# Bansilal Ramnath Agarwal Charitable Trust's
# Vishwakarma Institute of Technology, Pune – 37
# Department of Computer Science and Engineering (Artificial Intelligence)

---

# PROJECT REPORT

**Group No :** TY B 14

---

## Members


---

**Academic Year :** 2025–26

**Project Title :** Crop Disease Prediction and Smart Advisory Platform

**Project Area :** Deep Learning / Computer Vision / AgriTech

**Internal Guide :** PROF. (MRS.) SMITA BHOSALE

---

*(Prof. Smita Bhosale)*
**Signature of Internal Guide**

---

# ACKNOWLEDGEMENT

We would like to express our sincere gratitude to **PROF. (MRS.) SMITA BHOSALE**, our subject teacher for **Deep Learning**, for her invaluable guidance, constant support, and encouragement throughout the entire duration of this project. Her insightful suggestions, timely feedback, and scholarly direction have been the cornerstone of the successful completion of this work.

We are also deeply thankful to **Dr. Nilesh P. Sable**, Head of the Department of Computer Science and Engineering (AI), for providing continuous academic motivation, infrastructural support, and an environment that fosters innovative research. His leadership has been instrumental in building a culture of excellence within the department.

Our heartfelt thanks go to all the faculty members of the **Department of Computer Science and Engineering (AI)** at Vishwakarma Institute of Technology, Pune, for their valuable guidance, encouragement, and constant support extended to us during this project. Their academic insights helped us refine our ideas and improve the quality of this work.

We would like to extend our gratitude to **Vishwakarma Institute of Technology, Pune**, for providing the necessary infrastructure, high-performance laboratory facilities, high-speed internet connectivity, and a rich learning environment that made this project possible.

A special acknowledgement is extended to the creators of the **PlantVillage dataset** and the open-source deep learning community whose publicly available tools, frameworks, and pre-trained models formed the technical foundation of this project.

Lastly, we sincerely thank our classmates, friends, and family members for their unwavering cooperation, moral support, and encouragement throughout this endeavour. Their patience and motivation kept us committed during the challenging phases of development.

---

# ABSTRACT

Agriculture forms the backbone of India's economy, supporting the livelihoods of over 58% of the rural population. Crop diseases remain one of the most devastating threats to agricultural productivity, causing estimated annual yield losses of 20–30% globally. Early and accurate identification of crop diseases is critical to enabling timely interventions, reducing excessive pesticide use, and safeguarding farmer incomes.

This project, titled **"Crop Disease Prediction and Smart Advisory Platform"**, proposes and implements an end-to-end deep learning solution for automated crop disease detection and intelligent advisory generation, tailored specifically for the agricultural context of India. The system integrates two state-of-the-art convolutional neural networks — **EfficientNetV2-S** and **MobileNetV3-Large** — into a weighted ensemble model with **8-pass Test-Time Augmentation (TTA)**, delivering both high accuracy and robust real-world generalization.

The model was trained on a curated subset of the **PlantVillage dataset**, focusing on crops highly relevant to Indian agriculture, including Tomato, Potato, Corn (Maize), Apple, Grape, and others. After filtering non-Indian crops, the system was trained to identify **28 distinct disease classes** across these crops. The ensemble model achieved an overall classification accuracy of **99.34%**, a Macro F1-Score of **0.9923**, and an average inference time of **124 milliseconds per image** on the test set of 3,928 samples.

The system goes beyond mere classification. Upon detecting a disease, the platform triggers a **Smart Advisory Engine** that provides farmers with structured, actionable recommendations including the immediate remedial action, recommended chemical or organic treatment with dosage, preventive measures for the coming weeks, and the expected yield impact if the disease is left untreated.

The entire ML pipeline is deployed as a **FastAPI-based REST service** running on port 8000, which integrates seamlessly with the **AgriQ web platform** — a full-stack React.js + Node.js + MongoDB application. Farmers can upload a photograph of a diseased leaf directly through the web interface and receive a diagnosis report within seconds. Additionally, the system generates **Grad-CAM (Gradient-weighted Class Activation Mapping)** heatmaps that visually highlight the leaf regions responsible for the model's prediction, contributing to **Explainable AI (XAI)** in agriculture.

This work demonstrates how AI-driven computer vision can bridge the digital divide between computational research and practical farm-level application, enabling faster, more reliable, and more accessible crop health management for Indian farmers.

**Keywords:** Crop Disease Detection, Deep Learning, EfficientNetV2, MobileNetV3, Ensemble Learning, Test-Time Augmentation, GradCAM, FastAPI, PlantVillage, Smart Advisory, AgriTech, Explainable AI.

---

# TABLE OF CONTENTS

| Section | Title | Page No. |
|---------|-------|----------|
| — | Acknowledgement | ii |
| — | Abstract | iii |
| — | Table of Contents | iv |
| — | List of Figures | v |
| — | List of Tables | vi |
| **Chapter 1** | **Introduction** | 1 |
| 1.1 | Overview of the Project | 1 |
| 1.2 | Problem Statement | 2 |
| 1.3 | Objectives | 2 |
| 1.4 | Scope of the Project | 3 |
| **Chapter 2** | **Literature Review** | 4 |
| 2.1 | Introduction | 4 |
| 2.2 | Traditional Approaches to Crop Disease Detection | 4 |
| 2.3 | Deep Learning-Based Plant Disease Classification | 5 |
| 2.4 | EfficientNet and Compound Scaling | 5 |
| 2.5 | MobileNet for Lightweight Inference | 6 |
| 2.6 | Ensemble Learning in Deep Learning | 6 |
| 2.7 | Test-Time Augmentation (TTA) | 6 |
| 2.8 | Explainable AI in Agriculture | 7 |
| 2.9 | AI-Driven Agricultural Advisory Systems | 7 |
| 2.10 | Summary of Literature | 7 |
| **Chapter 3** | **System Design and Methodology** | 8 |
| 3.1 | Introduction | 8 |
| 3.2 | Overall System Architecture | 8 |
| 3.3 | Dataset Description | 9 |
| 3.4 | Data Preprocessing and Augmentation | 10 |
| 3.5 | Proposed Ensemble Model Architecture | 12 |
| 3.6 | Training Methodology | 14 |
| 3.7 | Model Evaluation Metrics | 16 |
| 3.8 | GradCAM Visualization | 16 |
| 3.9 | Smart Advisory Engine | 17 |
| 3.10 | Web Application and API Design | 18 |
| **Chapter 4** | **Implementation and Results** | 20 |
| 4.1 | Introduction | 20 |
| 4.2 | Implementation Environment | 20 |
| 4.3 | Data Processing and Loading | 21 |
| 4.4 | Model Implementation Details | 22 |
| 4.5 | Training Process | 23 |
| 4.6 | Model Evaluation and Confusion Matrix | 24 |
| 4.7 | GradCAM Visualization Results | 26 |
| 4.8 | Web Application Deployment | 27 |
| 4.9 | Result Analysis | 28 |
| 4.10 | Summary | 29 |
| **Chapter 5** | **Conclusion and Future Scope** | 30 |
| 5.1 | Conclusion | 30 |
| 5.2 | Major Contributions | 31 |
| 5.3 | Limitations | 31 |
| 5.4 | Future Scope | 32 |
| 5.5 | Summary | 33 |
| — | References | 34 |

---

# LIST OF FIGURES

| Figure No. | Particular | Page No. |
|------------|------------|----------|
| Figure 1 | Overall System Architecture of the Crop Disease Prediction Platform | 9 |
| Figure 2 | PlantVillage Dataset — Class Distribution Across 28 Disease Categories | 10 |
| Figure 3 | Proposed Ensemble Model Architecture (EfficientNetV2-S + MobileNetV3-Large) | 13 |
| Figure 4 | Phase-Based Training Methodology | 15 |
| Figure 5 | Training and Validation Loss / Accuracy Curves | 16 |
| Figure 6 | Confusion Matrix of Ensemble Model Predictions (28 Classes) | 25 |
| Figure 7 | Per-Crop Accuracy Breakdown | 26 |
| Figure 8 | GradCAM Heatmap Visualization — Correctly Predicted Samples | 27 |
| Figure 9 | Sample Correct Predictions with Confidence Scores | 27 |
| Figure 10 | AgriQ Web Platform — Home Page | 28 |
| Figure 11 | AgriQ Web Platform — Crop Doctor Upload and Diagnosis Page | 28 |

---

# LIST OF TABLES

| Table No. | Particular | Page No. |
|-----------|------------|----------|
| Table 1 | Comparison of Individual and Ensemble Model Performance | 24 |
| Table 2 | Class-wise Performance Metrics — Selected Disease Classes | 25 |
| Table 3 | Implementation Environment Specification | 21 |
| Table 4 | Training Hyperparameters Summary | 23 |
| Table 5 | Ablation Study — Impact of Key Techniques on Accuracy | 29 |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Overview of the Project

Agriculture is the primary source of livelihood for approximately 70% of India's rural population, and it contributes significantly to the national GDP. Despite its critical importance, the agricultural sector faces persistent and growing challenges — among the most damaging of which are crop diseases. Fungal, bacterial, and viral infections of crops can cause devastating yield losses, with global estimates suggesting that plant diseases are responsible for annual agricultural losses of 20–40% in production. In a country like India, where millions of smallholder farmers depend on their crops for sustenance and income, even a moderate disease outbreak can push families into debt and food insecurity.

Historically, crop disease diagnosis has relied upon the visual inspection skills of experienced agronomists and agricultural extension officers. While effective in expert hands, this approach suffers from critical limitations: it is slow, expensive, geographically constrained, and fundamentally inaccessible to the vast majority of farmers in rural India who lack proximity to certified experts. The time lag between the onset of infection symptoms and correct diagnosis often means that by the time a farmer receives guidance, the disease has already spread extensively, dramatically increasing both losses and the cost of intervention.

The advent of **Deep Learning** and **Computer Vision** has opened a transformative pathway to address this challenge. Convolutional Neural Networks (CNNs) trained on large, labelled datasets of plant images have demonstrated the ability to identify crop diseases with expert-level accuracy, instantly, from a simple photograph of a leaf. This capability, when combined with a robust **Smart Advisory Engine** and deployed through an accessible web or mobile interface, has the potential to function as a "digital agronomist" available to every farmer with a smartphone.

This project, titled **"Crop Disease Prediction and Smart Advisory Platform"**, represents exactly such a system. The platform is built on a weighted **Ensemble of two powerful CNN architectures** — EfficientNetV2-S and MobileNetV3-Large — trained on a curated version of the PlantVillage dataset with an augmentation strategy specifically designed to simulate real-world field photography conditions in India (varying light, motion blur, shadows, and partial occlusion by other leaves). The ensemble, further enhanced with **8-pass Test-Time Augmentation (TTA)**, achieves a classification accuracy of **99.34%** across **28 disease categories** for crops including Tomato, Potato, Corn, Apple, Grape, and more.

Beyond classification, the platform integrates a structured **Advisory Engine** that translates every prediction into actionable farmer guidance: the severity of the disease, the immediate action to take within 24–48 hours, the recommended chemical and organic treatment options, preventive measures for the next two weeks, and the projected yield impact if the infection is left untreated.

The entire system is deployed as a **FastAPI REST microservice** (Python) that serves as the AI backend to the **AgriQ platform** — a comprehensive full-stack web application built with React.js, Node.js, Express.js, and MongoDB. This integration allows farmers to upload a photograph directly through the AgriQ Crop Doctor interface and receive a complete diagnosis and advisory report in under two seconds.

## 1.2 Problem Statement

Despite significant advances in agricultural technology, crop disease detection in India and other developing nations continues to face several critical challenges that limit farmer outcomes:

**1. Dependence on Expert Visual Inspection:** The identification of crop diseases currently depends on the subjective visual assessment of trained agronomists. This expertise is unevenly distributed, with most qualified professionals concentrated in urban and semi-urban centres, leaving millions of rural farmers without access.

**2. Delayed Diagnosis and Intervention:** By the time a farmer identifies a problem, contacts an expert, and receives guidance, disease spread has often become systemic. Studies suggest that a delay of even 48–72 hours in identifying foliar diseases can increase crop losses by 15–25%.

**3. Visual Similarity Between Disease Stages and Types:** Many crop diseases exhibit visually similar early-stage symptoms, making even expert identification difficult. For instance, early blight and late blight in tomatoes can be confused by untrained observers, yet they require entirely different treatment protocols.

**4. Misapplication of Agrochemicals:** Without accurate diagnosis, farmers frequently apply incorrect or excessive quantities of pesticides and fungicides, leading to increased costs, chemical resistance in pathogens, and environmental harm.

**5. Absence of Integrated Advisory:** Even when disease is correctly identified, farmers rarely have access to structured, evidence-based guidance on treatment dosage, organic alternatives, and prevention strategies.

**6. Lack of Scalable, Accessible AI Tools:** Existing AI-based plant disease detection tools are predominantly research prototypes and are not integrated into production-ready, farmer-accessible platforms that work on low-bandwidth mobile connections.

This project addresses all of these challenges by building a **production-ready, accessible, and highly accurate deep learning platform** that provides not just classification, but a complete diagnostic advisory workflow.

## 1.3 Objectives

The primary objectives of this project are:

1. **To design and train a high-accuracy ensemble deep learning model** by combining EfficientNetV2-S and MobileNetV3-Large for multi-class crop disease classification across 28 disease categories relevant to Indian agriculture.

2. **To curate and preprocess the PlantVillage dataset** appropriately by filtering non-Indian crops and applying a heavy, field-condition-simulating augmentation pipeline to maximize real-world generalization.

3. **To implement a phase-based training strategy** with differential learning rates, MixUp and CutMix regularization, label smoothing, and cosine annealing with warm restarts to optimize model performance and prevent overfitting.

4. **To implement 8-pass Test-Time Augmentation (TTA)** at inference time to further boost prediction accuracy and confidence calibration.

5. **To generate GradCAM heatmaps** that visually highlight the regions of the leaf image responsible for the model's prediction, ensuring the system is explainable and trustworthy for farmers and agronomists.

6. **To develop a Smart Advisory Engine** that maps each predicted disease to a structured set of actionable recommendations including severity assessment, immediate action, chemical and organic treatments, and yield impact estimation.

7. **To deploy the complete system as a FastAPI REST API** and integrate it with the AgriQ full-stack web platform, enabling real-time crop disease prediction through a farmer-friendly browser interface.

8. **To achieve a classification accuracy exceeding 95%** on the holdout test set, with strong performance across all 28 disease classes including minority classes.

## 1.4 Scope of the Project

The proposed system has broad and meaningful applicability across agricultural technology, rural healthcare, and AI research domains. Its key scope areas include:

**Agricultural Decision Support:** The primary application is to serve as a digital crop doctor — enabling farmers, agricultural extension workers, and agronomists to obtain instantaneous, accurate disease identification and structured remediation guidance from a single leaf photograph.

**Scalable Rural Deployment:** The system's web-based architecture and lightweight MobileNetV3 component within the ensemble make it suitable for deployment on low-bandwidth connections, making it accessible in rural areas with limited internet infrastructure.

**Reduction of Agrochemical Misuse:** By providing accurate disease identification and targeted treatment protocols, the platform aims to reduce the blanket or incorrect application of pesticides, benefiting both farm economics and environmental health.

**Research and Dataset Expansion:** The platform can serve as a data-collection tool where farmer-verified images are logged and used to continuously expand and retrain the model, improving performance on under-represented disease classes over time.

**Integration with Broader AgriTech Ecosystems:** As a REST microservice, the AI engine can be integrated with other agricultural platforms, government schemes portals, and IoT-based precision farming systems.

**Scope Boundaries:** The current system is limited to the 28 crop-disease combinations present in the curated PlantVillage dataset and is designed for leaf-level image analysis. It does not perform soil health analysis, weather-based prediction, or biopsy-level pathological assessment. The system is intended as a clinical decision-support tool to assist farmers, not as a replacement for professional agronomic consultation.

---

# CHAPTER 2: LITERATURE REVIEW

## 2.1 Introduction

The intersection of computer vision, deep learning, and agricultural science has produced a rapidly growing body of research over the past decade. The fundamental challenge of automated crop disease detection — transforming a raw photograph of a leaf into a precise, actionable disease diagnosis — requires the synthesis of advances from image classification architectures, transfer learning, data augmentation, ensemble methods, and explainable AI. This chapter presents a comprehensive review of the existing literature in these domains, tracing the evolution from traditional handcrafted feature engineering approaches to the state-of-the-art deep learning methods that underpin the current project.

## 2.2 Traditional Approaches to Crop Disease Detection

Before the deep learning era, crop disease detection in computer vision relied on a multi-stage pipeline of handcrafted feature extraction followed by classical machine learning classifiers.

**Image Segmentation:** Early systems employed colour-based segmentation (HSV or RGB thresholding) and edge detection algorithms (Canny, Sobel) to isolate diseased regions of a leaf from the healthy tissue and background. Active contour models (snakes) and watershed algorithms were also used for lesion boundary delineation. Phadikar et al. (2012) demonstrated a segmentation-based approach for rice disease identification using K-means clustering.

**Handcrafted Feature Extraction:** Researchers extracted hand-engineered features from segmented lesion regions. Common feature descriptors included Local Binary Patterns (LBP) for texture characterisation, Gray Level Co-occurrence Matrix (GLCM) for spatial relationships between pixel intensities, colour histograms in multiple colour spaces, and Gabor filter responses for frequency and orientation information. Arivazhagan et al. (2013) used GLCM features with a multi-layer perceptron for classifying diseases in 12 plant species.

**Classical Classifiers:** Features were fed into conventional classifiers such as Support Vector Machines (SVM), Artificial Neural Networks (ANN), k-Nearest Neighbours (k-NN), Random Forests, and Naïve Bayes. Sannakki et al. (2013) used SVM with shape, colour, and texture features and reported approximately 83% accuracy on grape leaf diseases.

**Limitations:** These traditional methods suffered from significant drawbacks that limited their practical deployment: (i) the feature engineering process was highly manual, domain-specific, and required expert knowledge; (ii) performance was highly sensitive to variations in lighting, image quality, and background clutter; (iii) generalisation across different crop species and disease types was poor; and (iv) the approach fundamentally could not scale to the complexity and visual variability of real-world agricultural photography.

## 2.3 Deep Learning-Based Plant Disease Classification

The publication of deep convolutional neural network architectures — beginning with AlexNet's landmark performance on ImageNet (Krizhevsky et al., 2012) — fundamentally changed the trajectory of image-based plant disease research.

**Mohanty, Hughes & Salathé (2016)** published the seminal work "Using Deep Learning for Image-Based Plant Disease Detection" in *Frontiers in Plant Science*. Using the PlantVillage dataset and the GoogLeNet (Inception V1) architecture, they achieved 99.35% accuracy in laboratory conditions across 26 diseases from 14 crop species. This work established the PlantVillage dataset as the standard benchmark for plant disease classification research and demonstrated definitively that deep CNNs could match or exceed expert-level identification accuracy.

**Ferentinos (2018)** systematically evaluated AlexNet, AlexNetOWTBn, GoogLeNet (Inception V1), Overfeat, and VGGNet on the PlantVillage dataset. VGGNet achieved the highest accuracy of 99.53%, with AlexNet achieving 97.28%. This work reinforced the superiority of deeper architectures with larger parameter counts for fine-grained visual classification.

**Brahimi et al. (2017)** focused specifically on tomato diseases using deep CNNs and demonstrated high accuracy even when the image backgrounds were varied or realistic, pushing the field toward robustness to real-world conditions.

**Ramcharan et al. (2017)** applied transfer learning with InceptionV3 to detect cassava diseases from smartphone images taken in Tanzanian fields, achieving 93% accuracy. This was one of the first studies to validate deep learning plant disease detection on genuinely field-captured images rather than controlled laboratory photos, directly motivating the field-condition augmentation strategy used in the current project.

**Chen et al. (2020)** introduced attention mechanisms and residual connections into plant disease classification, showing that directing the network's focus to discriminative lesion regions improved performance on minority disease classes with fewer training samples.

## 2.4 EfficientNet and Compound Scaling

**Tan and Le (2019)** introduced EfficientNet in "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks" at ICML 2019. The key contribution was a principled compound scaling method that uniformly scales network depth, width, and input image resolution using a fixed set of scaling coefficients derived through neural architecture search (NAS).

EfficientNet-B0 to B7 achieved state-of-the-art performance on ImageNet while using significantly fewer parameters and FLOPS than competing architectures such as ResNet-152 and DenseNet-201. EfficientNetV2, the successor, introduced Fused-MBConv blocks and progressive learning, achieving even faster training with superior accuracy. EfficientNetV2-S, used in the current project, achieves ~84% top-1 accuracy on ImageNet with approximately 48 million parameters.

**Atila et al. (2021)** applied EfficientNetB7 to the PlantVillage dataset and achieved 99.28% accuracy, demonstrating the architecture's exceptional suitability for plant disease classification owing to its compound scaling principle. The current project uses EfficientNetV2-S, which offers improved training efficiency over B-series variants through its use of Fused-MBConv blocks.

## 2.5 MobileNet for Lightweight Inference

**Howard et al. (2017)** introduced MobileNet, a family of architectures designed for mobile and embedded vision applications using depthwise separable convolutions. MobileNetV3 (Howard et al., 2019) further refined the design using Neural Architecture Search and introduced the hard-swish activation function, reducing latency while maintaining accuracy.

**Tm et al. (2018)** applied MobileNet to plant disease detection on the PlantVillage dataset and achieved ~98.2% accuracy. MobileNet's reduced parameter count (~5M for MobileNetV3-Large versus ~48M for EfficientNetV2-S) makes it ideal as an ensemble partner that provides diverse error patterns while enabling fast inference.

**Karthik et al. (2020)** used MobileNetV2 for leaf disease detection on smartphones, achieving real-time inference at ~50ms per image, validating the architecture's practical suitability for mobile agricultural applications.

## 2.6 Ensemble Learning in Deep Learning

Ensemble methods — combining the predictions of multiple independently trained models — are among the most reliable techniques for improving classification accuracy and robustness.

**Opitz and Maclin (1999)** provided foundational theoretical and empirical evidence that ensemble methods improve accuracy over any individual constituent model, provided the models make different errors (i.e., have diverse error patterns). This is the key motivation for pairing EfficientNetV2-S (accuracy-focused, ~48M params) with MobileNetV3-Large (speed-focused, diverse architecture, ~5M params) in the current work.

**Pal et al. (2020)** applied ensemble deep learning specifically to plant disease detection, combining ResNet and DenseNet predictions through weighted averaging and reported a consistent +1–2% accuracy improvement over the single best model, confirming the value of diversity in ensemble composition.

**Guo et al. (2019)** demonstrated that weighted ensemble of softmax probabilities — assigning higher weight to the more accurate constituent model — consistently outperforms simple majority voting, justifying the 0.65 / 0.35 EfficientNet / MobileNet weighting scheme used in the current project.

## 2.7 Test-Time Augmentation (TTA)

Test-Time Augmentation is a technique where, instead of making a single prediction for each test image, the model makes N predictions on N augmented versions of the same image, and the results are averaged.

**Shorten and Khoshgoftaar (2019)** reviewed TTA comprehensively and found it consistently provides an accuracy boost of 1–3% on image classification benchmarks without any additional training cost. The effect is particularly pronounced for images captured under variable real-world conditions, making TTA especially valuable for farmer-uploaded field photographs.

The current system applies **8 distinct TTA transforms** at inference: clean centre crop, horizontal flip, vertical flip, 90° rotation, 180° rotation, brightness adjustment, top-left crop, and bottom-right crop. Predictions from all 8 passes are averaged before the final disease class is determined.

## 2.8 Explainable AI in Agriculture

**Selvaraju et al. (2017)** introduced **Grad-CAM (Gradient-weighted Class Activation Mapping)** as a technique for producing visual explanations for decisions made by CNN-based models. By computing the gradient of the predicted class score with respect to the feature maps of the final convolutional layer, Grad-CAM produces a localisation heatmap highlighting the regions of the input image most responsible for the prediction.

In the agricultural context, **Barman et al. (2022)** applied Grad-CAM to rice disease detection and found that the heatmaps consistently highlighted actual lesion regions, validating the model's biological plausibility and building farmer and agronomist trust in the AI system's recommendations.

The current project generates Grad-CAM overlays on the EfficientNetV2-S backbone for every prediction flagged as diseased, providing visual confirmation of the lesion region driving the diagnosis.

## 2.9 AI-Driven Agricultural Advisory Systems

**Kamilaris and Prenafeta-Boldú (2018)** reviewed 40 studies on deep learning applied to agriculture and highlighted that the most impactful agricultural AI systems are those that go beyond classification to deliver actionable insights — dosage recommendations, treatment schedules, and economic impact estimates.

**Barbedo (2019)** identified key limitations of existing plant disease AI systems in real-world deployment: poor performance on minor classes, sensitivity to image quality, and the absence of contextual advice. These findings directly motivated the advisory engine design in the current project, which provides structured treatment, organic alternatives, and yield impact estimates for each diagnosed disease.

**Jhuria et al. (2013)** proposed one of the early integrated systems combining disease detection with treatment recommendation for Indian crops, validating the concept of coupling AI classification with domain-knowledge-driven advisory systems.

## 2.10 Summary of Literature

The reviewed literature establishes a clear evolutionary trajectory from handcrafted feature engineering to end-to-end deep learning, and from academic benchmarking to real-world deployment. Key insights that directly shaped the design of the current system include:

- **Transfer learning** from ImageNet pre-trained weights is essential for achieving high accuracy on agricultural image datasets with limited annotated samples.
- **EfficientNetV2-S** offers the best balance of accuracy and training efficiency among modern CNN architectures for plant disease classification.
- **Ensemble of architecturally diverse models** with weighted probability averaging consistently outperforms any single model.
- **Heavy augmentation** simulating real field conditions (blur, shadows, weather, occlusion) is the single most impactful technique for bridging the gap between laboratory accuracy and real-world performance.
- **Test-Time Augmentation** provides a reliable, training-free accuracy boost at inference.
- **GradCAM visualisations** are essential for building farmer and agronomist trust in the system's recommendations.
- **Integrated advisory systems** that translate classification outputs into actionable recommendations have the highest real-world impact.

Building on these insights, the proposed system combines EfficientNetV2-S and MobileNetV3-Large in a weighted ensemble with 8-pass TTA, a heavy field-condition augmentation pipeline, GradCAM explainability, and a structured advisory engine, all deployed through a production-ready FastAPI and React.js full-stack platform.
