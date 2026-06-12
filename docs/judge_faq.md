# Judge FAQ & Defense Strategy

## Why Knowledge Graph?
**Question:** Why did you use a Knowledge Graph instead of just relying on an LLM or Vector DB?
**Answer:** RAG retrieves text. A Knowledge Graph models relationships. Failure propagation requires structured topology. A vector database alone cannot reliably determine downstream equipment impact. We need deterministic traversal to calculate financial risk without hallucination.

## Why LangGraph?
**Question:** Why use LangGraph for the backend logic?
**Answer:** Maintenance decisions are multi-step workflows. Diagnosis, prediction, and procurement are distinct intents requiring distinct tools. Standard LangChain agents often get stuck in loops or pick the wrong tools. LangGraph provides a cyclical, state-driven execution path guaranteeing the Copilot follows standard operating procedures.

## Why Isolation Forest + RandomForest?
**Question:** Why not use Deep Learning (LSTMs/Transformers) for anomaly detection?
**Answer:** In an industrial setting, explainability is key, and true failure data is extremely rare. Isolation Forest is highly effective for unsupervised anomaly detection on healthy baselines. RandomForest provides robust, interpretable regression for Remaining Useful Life (RUL) estimation while being fast enough for real-time edge deployment.

---

# Known Limitations (For Transparency)

1. **Static Topology:** Currently, the Knowledge Graph topology is statically seeded. In a production environment, this should be dynamically generated via ERP/SCADA integration or automated P&ID parsing.
2. **Simplified RUL Baseline:** The synthetic data uses a simplified linear degradation assumption. Real-world RUL models require significantly more historical failure curves to generalize across different fault modes.
3. **Environment Constraint (XGBoost):** Due to strict Windows Application Control policies in this specific demo environment blocking `.dll` loading, the RUL estimator utilizes `scikit-learn`'s `RandomForestRegressor` instead of `XGBoost`. The architectural logic remains identical.
