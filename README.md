# AI-based-commute-assistant

**A minimal, demo-ready application that recommends practical, low-carbon travel modes for any route in India or worldwide.**

The application computes road, rail, or air distances, travel time, **carbon footprint**, and **energy saved**. It then suggests the best mode and displays up to three sensible alternatives, promoting sustainable transportation choices.

---

## ✨ Features & Technology

| Category | Component | Details |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+ (App Router), TypeScript** | Modern, performant UI with server-side rendering capability. |
| **Styling** | **Tailwind CSS, shadcn/ui** | Utility-first styling for a clean, consistent look. |
| **Core Logic** | **Client-side routing with server fallback** | Frontend can operate standalone, or delegate to the optional Java backend. |
| **Geocoding** | **Nominatim (OpenStreetMap)** | Converts place names to geographical coordinates. |
| **Road Routing** | **OSRM (Open Source Routing Machine)** | High-speed road routing, selecting the most **highway-like alternative** (highest fraction of $\ge 80 \text{ km/h}$ segments). |
| **Transit** | **OpenTripPlanner (OTP)** | Optional local integration for accurate, track-based Train/Metro/Bus distances and times. Otherwise, uses heuristic estimates. |
| **Backend (Optional)** | **Spring Boot 3, Java 17, Maven** | Centralizes and hardens routing logic, avoids CORS/rate limits, and prepares for future secure features. |

---

## 🛠️ How It Works (The Flow)

The application prioritizes robust routing with a full client-side fallback:

1.  **Submission:** The user enters the Origin and Destination in the Next.js frontend.
2.  **API Check:** The frontend first attempts to make a `POST` request to the optional Java backend at `${NEXT_PUBLIC_API_BASE_URL}/api/commute/analyze`.
3.  **Backend Success:** If the backend responds successfully, its standardized results are used immediately.
4.  **Client Fallback:** If the backend is unavailable or fails, the frontend takes over, performing the client-side routing logic:
    * Calls **Nominatim** for coordinates.
    * Calls **OSRM** for road routing.
    * Checks for a running **OpenTripPlanner (OTP)** instance at `http://localhost:8081` for accurate rail/transit data.
    * If all services fail, it falls back to **geodesic distance** with pre-defined speeds.
5.  **Filtering & Suggestion:** The results are filtered using **Sensibility Rules** (e.g., hiding walking $>8 \text{ km}$ or Aeroplane $<500 \text{ km}$ from the primary suggestion). The best mode is chosen by minimizing a combined score: $\min(\text{carbonKg} \times 2 + \text{timeMins})$.

**## 💡 Notes & Trade-offsRate Limits:**

1. *The default configuration uses public instances of OSRM and Nominatim, which are subject to rate limits.
For heavy use, self-host these services or introduce caching in the backend.

2. *OTP: The backend logic currently uses approximations for Train/Metro. For exact track-based distances,
you must run a local OpenTripPlanner (OTP) instance and integrate it into the backend.

3. "Highway Route" Heuristic: The selection of a road route by the highest share of high-speed segments ($\ge 80 \text{ km/h}$) is an approximation for normal, fast driving/bus routes.
The accuracy depends on how the underlying map data is tagged.


**---### 1. Frontend Only (Standalone)**

The application will run locally and use public API instances (OSRM, Nominatim).

```bash
# Clone the repository
git clone [YOUR_REPO_URL]
cd ai-commute-assistant

# Install Next.js dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000






**### 2. Full Stack (Frontend + Java Backend)**


**RUN THE BACK END**
# From the project root, navigate to the backend folder
cd backend
# Build and run the Spring Boot application
mvn spring-boot:run

# The backend API will start at http://localhost:8080




**RUN THE FRONTEND**
# Return to the project root
cd ..

# Set the environment variable to enable backend communication
# Linux/macOS
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"
# Windows (Command Prompt)
set NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# Windows (PowerShell)
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"

# Run the development server
npm run dev

## 🚀 Getting Started

You can run the frontend standalone, or run both the frontend and the optional Java backend for a more robust setup.

### Prerequisites

* **Node.js** and **npm** (for the frontend)
* **Java 17** and **Maven** (for the optional backend)
