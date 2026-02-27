<<<<<<< HEAD
# MedOrion Backend

## MedOrion Overview
MedOrion is a Hospital Operational Intelligence backend built with Spring Boot and PostgreSQL. It provides real-time department stress analysis, short-term forecasting, what-if simulation for staffing, anomaly alerts, and delay cost impact estimates for operational decision support.

## Architecture Design
- Framework: Spring Boot 3.x (Java 17)
- API Layer: REST controllers under `/api/analytics`
- Business Layer: `AnalyticsService` for all analytical computations
- Data Layer: Spring Data JPA repositories
- Persistence: PostgreSQL
- Bootstrapping: Controlled fake data seeding with `CommandLineRunner`

Package structure:
- `entity`: JPA entities
- `repository`: repository interfaces + query methods
- `service`: analytical business logic
- `controller`: REST endpoints
- `dto`: request/response contracts
- `config`: startup seeding
- `enums`: enum models

## Stress Formula
For each department:

`stressScore = (activePatients * avgHandlingTimeMinutes) / (availableDoctors * 60.0)`

Guard:
- If `availableDoctors == 0`, `stressScore = 0`

Status buckets:
- `< 0.7` => `Healthy`
- `0.7 to 1.2` => `Moderate`
- `> 1.2` => `Critical`

## Forecasting Logic
7-day moving average load:

`predictedLoad = sum(last7Days.totalPatients) / numberOfDays`

Guard:
- If no records exist, `predictedLoad = 0`

## Simulation Explanation
Simulation input:
- `departmentId`
- `additionalDoctors`
- `shiftExtensionHours`

Computed:
- `oldStress` from current active load/capacity
- `newDoctorCount = currentAvailableDoctors + additionalDoctors`
- `adjustedCapacity = newDoctorCount * (60.0 + shiftExtensionHours * 60.0)`
- `newStress = (activePatients * avgHandlingTimeMinutes) / adjustedCapacity`
- `improvementPercentage = ((oldStress - newStress) / oldStress) * 100`

Guards:
- If `adjustedCapacity == 0`, `newStress = 0`
- If `oldStress == 0`, `improvementPercentage = 0`

## Anomaly Detection Logic
An anomaly is flagged when:

`todayTotalPatients > 1.25 * weeklyAverage`

Where `weeklyAverage` is computed from recent department `DailyStats`.

## Financial Impact Formula
Delay cost estimate per department:

`delayCost = avgWaitTime * totalPatients * costFactor`

Uses today's `DailyStats` when present, otherwise the most recent available stat.

## API Endpoints
- `GET /api/analytics/stress`  
  Returns stress index and category for all departments.

- `GET /api/analytics/forecast/{departmentId}`  
  Returns forecasted patient load from recent 7-day trend.

- `POST /api/analytics/simulate`  
  Runs staffing/shift simulation.

- `GET /api/analytics/anomalies`  
  Returns departments currently crossing anomaly threshold.

- `GET /api/analytics/cost-impact`  
  Returns delay-cost impact estimates per department.

## Setup Instructions
Prerequisites:
- Java 17
- PostgreSQL running on `localhost:5432`
- Database already created: `Medorion`

Database settings are configured in `src/main/resources/application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/Medorion
spring.datasource.username=postgres
spring.datasource.password=Rahul@#1345
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```

## How to Run
Windows:

```bash
.\gradlew.bat bootRun
```

Unix/macOS:

```bash
./gradlew bootRun
```

The fake data loader seeds realistic data only when no departments exist, so restarts do not duplicate data.

## Sample JSON Output
`GET /api/analytics/stress`

```json
[
  {
    "departmentId": 1,
    "departmentName": "Cardiology",
    "activePatients": 22,
    "availableDoctors": 4,
    "stressScore": 2.75,
    "category": "Critical"
  }
]
```

`POST /api/analytics/simulate`

Request:

```json
{
  "departmentId": 1,
  "additionalDoctors": 2,
  "shiftExtensionHours": 1.5
}
```

Response:

```json
{
  "departmentId": 1,
  "departmentName": "Cardiology",
  "activePatients": 22,
  "currentAvailableDoctors": 4,
  "newDoctorCount": 6,
  "oldStress": 2.75,
  "newStress": 0.92,
  "improvementPercentage": 66.55,
  "adjustedCapacity": 900.0
}
```
=======
# MedOrion
>>>>>>> abbc3aa8edd0a6033c7c64417f6e3a8b5319d60f
