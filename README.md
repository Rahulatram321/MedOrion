MedOrion
Hospital Operational Intelligence System

MedOrion is a real-time Hospital Operational Intelligence System designed to help administrators monitor departmental stress levels, detect operational anomalies, forecast patient load, simulate staffing decisions, and estimate financial impact caused by delays.

It combines a Spring Boot analytics backend with a React executive dashboard to provide actionable operational insights.

📊 Dashboard Preview

## Dashboard Overview
<img width="1919" height="1021" alt="image" src="https://github.com/user-attachments/assets/921c9561-af18-458f-ac62-9af8bf7ed235" />


## Patient Surge Simulation
<img width="1060" height="334" alt="image" src="https://github.com/user-attachments/assets/41184267-f5c9-4e0a-8139-4426dd01eecc" />


## Resource Simulation Panel
<img width="751" height="407" alt="image" src="https://github.com/user-attachments/assets/4bbcfc93-5455-400f-8f7a-c812d35a3513" />


🏗 Architecture Overview
Backend

Spring Boot 3.x (Java 17)

Spring Data JPA

PostgreSQL

Gradle

REST APIs

Frontend

React (Vite)

TailwindCSS

Axios

Recharts

Framer Motion

Backend Package Structure

entity → JPA entities

repository → Data access layer

service → Analytical computation engine

controller → REST endpoints

config → Controlled data seeding

enums → Status modeling

📈 Stress Index Model

Department stress is computed as:

stressScore = (activePatients × avgHandlingTimeMinutes) 
              / (availableDoctors × 60.0)

Guard:

If availableDoctors = 0 → stressScore = 0

Stress Categories:

< 0.7 → Healthy

0.7 – 1.2 → Moderate

1.2 → Critical

This models department overload relative to handling capacity.

🔮 Forecasting Logic

7-day moving average:

predictedLoad = sum(last7Days.totalPatients) / numberOfDays

If fewer than 7 records exist, available records are averaged.

Also includes a Stability Index derived from standard deviation to measure volatility.

🧪 Simulation Engine

Simulation Input:

departmentId

additionalDoctors

shiftExtensionHours

Computed:

oldStress

newDoctorCount

adjustedCapacity

newStress

improvementPercentage

Improvement formula:

improvementPercentage = ((oldStress - newStress) / oldStress) × 100

Used for operational decision support.

🚨 Anomaly Detection

An anomaly is flagged when:

todayTotalPatients > 1.25 × weeklyAverage

This detects abnormal demand spikes.

💰 Financial Impact Model

Delay cost estimate:

delayCost = avgWaitTime × totalPatients × costFactor

Used to quantify operational inefficiency in monetary terms.

🔌 API Endpoints

Base Path:

/api/analytics
Method	Endpoint	Description
GET	/stress	Department stress levels
GET	/forecast/{id}	7-day forecast
POST	/simulate	Staffing simulation
GET	/anomalies	Current anomaly flags
GET	/cost-impact	Delay cost per department
POST	/generate-load	Simulate patient surge
⚙️ Setup Instructions
Prerequisites

Java 17

PostgreSQL running locally

Database created: Medorion

Update configuration in:

src/main/resources/application.properties

Example:

spring.datasource.url=jdbc:postgresql://localhost:5432/Medorion
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

Avoid committing real passwords in public repositories.

▶ Running Backend

Windows:

.\gradlew.bat bootRun

Unix/macOS:

./gradlew bootRun
▶ Running Frontend
cd medorion-frontend
npm install
npm run dev
🎯 Demo Flow

Shows baseline system status

Trigger patient surge

Observe stress increase

Detect anomaly

Run simulation

Show stress reduction

Highlight financial impact

📁 Repository Structure
MedOrion/
 ├── backend (Spring Boot)
 ├── medorion-frontend (React + Tailwind)
 ├── screenshots/
 └── README.md
Objective

MedOrion demonstrates how real-time operational analytics and simulation modeling can support intelligent hospital resource management.

It is not a CRUD application — it is a decision-support system.
