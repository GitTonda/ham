# HAM Architecture: Text-to-Flux Flow

## Overview
HAM (Home Assistant Monitor) enables users to interact with their Home Assistant data using natural language. The system translates user intent into Flux queries (for InfluxDB), executes them, and visualizes the results.

## Data Flow
1. **User Input:** User enters a natural language query in the "ASK ON HOUSE" search bar.
2. **LLM Translation:** The query is sent to `/api/chat`, which uses `llm-service.ts` (Claude) to:
   - Identify the user's intent (e.g., "show me temperature in the living room for the last hour").
   - Map it to specific InfluxDB buckets, measurements, and fields.
   - Generate a valid Flux query.
   - Suggest an appropriate `ChartType`.
3. **Data Retrieval:** The generated Flux query is executed via `influx-client.ts`.
4. **Data Summarization:** The raw data is processed by `data-summarizer.ts` to generate a `DataSignature` (min, max, avg, etc.) and a summary for the LLM.
5. **UI Rendering:** The frontend receives the data and the suggested chart type, updating the dashboard or showing a `QueryInsightOverlay`.

## Component Structure
- **GlobalNav:** Top navigation and search bar.
- **DashboardGrid:** Main area displaying `ChartCard`s.
- **GlobalSettings:** Management of DB, LLM, and Card settings.
- **SystemDiagnostics:** Health checks for external services.

## Tech Stack Decisions
- **InfluxDB:** Optimized for time-series data from Home Assistant.
- **Claude:** High reasoning capabilities for complex Flux query generation.
- **Zustand:** Lightweight state management for dashboard cards and settings.
- **Recharts:** Responsive and composable React charts.
