# SteelSense AI - 5-Minute Demo Script

## 0:00 - 0:30 | The Hook
**Presenter:** "Welcome to SteelSense AI. In modern steel manufacturing, unscheduled downtime isn't just an inconvenience—it costs up to ₹25 Lakhs per hour. Today, we're going to show you how our industrial copilot moves beyond basic dashboards and isolated anomaly detection to actually understand the *business impact* of a failure."

*Action: Show the War Room Dashboard UI (Overview).*

## 0:30 - 2:30 | Scenario 1: The Cooling Cascade (LangGraph + Knowledge Graph)
**Presenter:** "Let's look at a live scenario. Our copilot has just ingested a query regarding a pressure drop and fluid contamination in `cooling-cs01`."

*Action: Point to the Alert Feed and the Failure Propagation Graph.*

**Presenter:** "Notice the graph. It doesn't just flag the cooling unit. Using our deterministic Knowledge Graph topology, it traverses the factory floor and identifies that a cooling failure will directly cause `motor-4` to overheat and `press-hp02` to thermally trip. The Copilot instantly calculates the downstream financial risk at ₹23 Lakhs/hr. 

But how does it know? Look at the Evidence Panel. It combines the deterministic Graph Likelihood with RAG—pulling the exact sentence from the equipment manual proving the overheating risk."

## 2:30 - 4:00 | Scenario 2: Predictive Maintenance (ML + Procurement)
**Presenter:** "Now let's zoom into `motor-4`. Our ML layer is constantly analyzing sensor telemetry."

*Action: Highlight the Asset Card showing the Sensor Trend and RUL.*

**Presenter:** "The Isolation Forest flagged an anomaly. Instead of just giving a black-box alert, we run a RandomForest regression on the degradation curve, estimating a Remaining Useful Life of just 2 days. 

Because the Copilot is tied to our procurement data, it immediately checks the catalog. It sees we have 0 SKF bearings in stock with a 12-day lead time. The Action Plan panel recommends expediting procurement *today* before the motor fails entirely."

### 4:00 - Execution & Operational Loop (The Differentiator)

*(Scroll to the bottom "Execution & Tracking" tier of the War Room)*

**Talking Track:**
"After generating the recommendation, SteelSense tracks the actual execution. Here you see our Digital Maintenance Logbook. It tracks when the work order was generated, when the spare part was physically reserved, and captures the engineer's feedback. 

Because the engineer accepted the recommendation and confirmed the bearing wear, the system stores this outcome locally. The next time a similar anomaly appears across the fleet, the Copilot's 'Historical Case Matching' engine will heavily weight this success. This creates a continuous, self-improving operational loop, making SteelSense a true Maintenance Operating System, not just an AI chat box."

---

### 4:45 - Wrap-Up & Vision
**Presenter:** "We built SteelSense AI with a dual-layer architecture: robust ML for anomaly detection, anchored by a determinist Knowledge Graph to prevent AI hallucinations and provide transparent, financial-first decision making. This is how you turn predictive maintenance into proactive industrial intelligence. Thank you."
