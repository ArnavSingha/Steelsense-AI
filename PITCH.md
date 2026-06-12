# SteelSense AI - Hackathon Pitch Script (3 Minutes)

## Introduction (0:00 - 0:30)
*Slide/Visual: Present the War Room Dashboard.*

**"Good afternoon, judges. We are team ForgeMind AI, and this is SteelSense AI — an industrial predictive maintenance copilot built exclusively for heavy manufacturing like Tata Steel."**

**"Today, plant managers and engineers drown in raw data—sensor readings, alerts, and PDF manuals. When a critical machine like a cooling system fails, the cost of downtime skyrockets while engineers scramble to cross-reference manuals and diagnose the root cause."**

**"SteelSense AI solves this. It's not just a dashboard; it's a decision engine that bridges the gap between raw telemetry and actionable business intelligence."**

## Core Features & Demo (0:30 - 1:45)
*Slide/Visual: Navigate to the Diagnosis Page and click 'Run AI Generator'.*

**"Let me show you our War Room. As you can see, our Next.js frontend uses a sleek, data-dense glassmorphism design that immediately highlights critical risks without clutter."**

**"When an anomaly is detected by our Isolation Forest Machine Learning model, our system doesn't just throw a red alert. Watch this. [Click Run AI Generator]. Behind the scenes, our FastAPI backend triggers an agentic LangChain workflow."**

**"1. First, the agent analyzes the live sensor readings.**
**2. Second, it searches our FAISS Vector Database to retrieve relevant Standard Operating Procedures.**
**3. Finally, it uses the Gemini LLM to synthesize a full Root Cause Analysis."**

*Slide/Visual: Navigate to the Chat Page.*

**"But what if an engineer needs to drill down further? They can switch to our Conversational Assistant. Here, an engineer can chat directly with the Knowledge Graph to ask about safe alignment tolerances or required spare parts for the fix."**

## Business Impact & Architecture (1:45 - 2:30)
*Slide/Visual: Navigate to the Reports & Spare Parts Pages.*

**"This isn't just about cool AI; it's about operational execution. Our architecture includes a Spare Parts module that cross-references the AI's diagnosis with real-time inventory to prevent supply chain bottlenecks. Our Reporting module auto-generates shift summaries so plant managers always have the bottom line."**

**"We built this using a robust, modular FastAPI architecture with Pydantic schemas, ensuring it is production-ready, type-safe, and scalable for a massive enterprise like Tata Steel."**

## Conclusion (2:30 - 3:00)
*Slide/Visual: Final view of the Dashboard.*

**"In summary, SteelSense AI shifts maintenance from reactive scrambling to proactive, AI-guided precision. We reduce downtime, streamline engineering workflows, and protect the bottom line."**

**"Thank you. We are now open for questions."**
