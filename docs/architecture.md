# System Architecture

## Architecture Diagram

```mermaid
graph TD
    subgraph UI [Frontend - Next.js]
        A[War Room Dashboard]
        B[React Flow Graph]
        C[Recharts Sensor Trends]
    end

    subgraph API [FastAPI Backend]
        D[api/copilot/query]
        E[api/ml/predict]
    end

    subgraph LangGraph [Maintenance Brain]
        F{Intent Router}
        G[Diagnostic Node]
        H[Predictive Node]
        I[Planning Node]
    end

    subgraph Intelligence Core
        RC[Root Cause Engine]
        RS[Risk Scoring Engine]
        PI[Procurement Engine]
    end

    subgraph ML [Machine Learning Layer]
        N[Isolation Forest - Anomaly]
        O[Random Forest - RUL]
    end

    subgraph Knowledge [Knowledge Layer]
        P[Knowledge Graph - NetworkX]
        Q[Vector Store - FAISS + SQLite]
    end
    
    subgraph Execution & Tracking
        FB[Feedback Loop]
        OT[Outcome Tracking]
        DL[Digital Logbook]
    end

    subgraph Data [Data Assets]
        R[(Sensor CSVs)]
        S[(Equipment Manuals / Logs)]
        T[(Spare Parts JSON)]
    end

    A --> D
    B --> D
    C --> E
    
    D --> F
    F --> G
    F --> H
    F --> I
    
    G --> RC
    H --> RS
    I --> PI
    
    RC --> Q
    RS --> P
    PI --> T
    
    E --> N
    E --> O
    N --> R
    O --> R
    
    A -->|Engineer Approval| FB
    FB --> OT
    OT --> DL
    DL -.->|Historical Cases| RC
```

## Component Overview

1. **Frontend**: Next.js App Router with Tailwind CSS v4. Uses `@xyflow/react` for visual failure propagation maps, ensuring highly interactive presentations.
2. **Maintenance Brain**: LangGraph state-machine orchestrating LLM tool-calling. Ensures deterministic routing without infinite LLM loops.
3. **Dual-Layer Retrieval**:
   - **FAISS**: Dense vector search for semantic matching.
   - **SQLite**: Hard metadata pre-filtering (by manual type, asset ID) to prevent hallucinated references.
4. **Knowledge Graph**: Seeded topology of the factory floor using `NetworkX`. Evaluates the cumulative hourly downtime cost of cascading failures.
5. **ML Layer**: Replaces black-box thresholding with statistical modeling. `IsolationForest` handles unsupervised anomaly detection on healthy baselines, while `RandomForest` performs regression to estimate remaining useful life.
