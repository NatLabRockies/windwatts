# System Overview

## Architecture

```mermaid
C4Context
      title System Context Diagram for WindWatts

      Person(user, "User", "A user wanting to access wind data")
      System_Boundary(windwatts, "WindWatts System") {
        Container(ui, "Frontend UI", "React, Vite", "Provides the web interface for users")
        Container(api, "Backend API", "FastAPI, Python", "Handles API requests and business logic")
        ContainerDb(db, "Database", "PostgreSQL", "Stores application data")
        Container(dw_tap, "Core Library", "Python", "Scientific data processing logic")
      }
      System_Ext(aws, "AWS Services", "S3, Athena, Glue", "Stores and queries large-scale wind data")

      Rel(user, ui, "Uses", "HTTPS")
      Rel(ui, api, "Makes API calls to", "JSON/HTTPS")
      Rel(api, db, "Reads/Writes", "SQL/TCP")
      Rel(api, dw_tap, "Imports", "Python Module")
      Rel(api, aws, "Queries", "Boto3/HTTPS")
```

WindWatts is a monorepo consisting of:
-   **Frontend**: React application (`windwatts-ui`)
-   **Backend**: Python FastAPI application (`windwatts-api`)
-   **Core Library**: Data processing logic (`dw_tap`)

## Tech Stack

### Frontend
-   **Language**: TypeScript / JavaScript
-   **Framework**: React 19
-   **Build Tool**: Vite
-   **UI Library**: Material UI v7
-   **Runtime**: Node.js >= 22.14.0

### Backend
-   **Language**: Python 3.13
-   **Framework**: FastAPI [standard]
-   **Server**: Gunicorn / Uvicorn
-   **ORM**: SQLAlchemy
-   **Database**: PostgreSQL

### Infrastructure
-   **Containerization**: Docker
-   **Cloud Provider**: AWS (S3, Athena, Glue)
