# HelpDesk — IT Ticket Management System

A clean full-stack starter for an IT help desk ticket management project.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Java 17
- Database: MySQL
- Database connectivity: JDBC
- DSA: `PriorityQueue` + `HashMap`
- Backend API: Java's lightweight `HttpServer`
- JSON: Gson

## Core requirements covered

### Ticket Creation
Employee submits a problem, priority and optional assignee.

### Priority
`Critical > High > Medium > Low`

`PriorityQueue` determines which unresolved ticket should be handled first.

### Employee Assignment
Each ticket can be assigned to an IT support employee.

### Resolution Tracking
Ticket status moves through:
`Open → Assigned → In Progress → Resolved`

### HashMap
`HashMap<String, Ticket>` stores tickets by Ticket ID for fast average O(1) lookup.

### JDBC
Java backend uses JDBC to persist tickets in MySQL.

## Folder Structure

```text
it-helpdesk-ticket-system/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/helpdesk/
│       ├── App.java
│       ├── Database.java
│       ├── Ticket.java
│       └── TicketManager.java
├── database/
│   └── schema.sql
└── README.md
```

## Setup

### 1. Database

Install MySQL and run:

```sql
SOURCE database/schema.sql;
```

Then open:

`backend/src/main/java/com/helpdesk/Database.java`

Change:

```java
private static final String PASSWORD = "YOUR_MYSQL_PASSWORD";
```

to your MySQL password.

### 2. Backend

Install JDK 17+ and Maven.

From the `backend` folder:

```bash
mvn clean compile
mvn exec:java
```

Backend runs at:

`http://localhost:8080`

### 3. Frontend

Open `frontend/index.html` in a browser.

For the demo UI, sample data is included. The UI is intentionally usable before the backend is connected.

## Connecting the UI to the backend

The frontend currently uses local demo data so the design can be viewed immediately.

The API endpoints are:

```text
GET  /api/tickets
POST /api/tickets/create
POST /api/tickets/status
GET  /api/tickets/next
```

In `frontend/app.js`, the API base is:

```javascript
const API = "http://localhost:8080/api";
```

For production integration, replace the local ticket insertion in the form submit handler with a `fetch()` call to:

```text
POST http://localhost:8080/api/tickets/create
```

and load tickets from:

```text
GET http://localhost:8080/api/tickets
```

## Suggested presentation explanation

> "The frontend provides the ticket management dashboard. Requests are sent to a Java backend through HTTP. The backend uses a HashMap for fast ticket lookup and a PriorityQueue to process tickets according to priority. JDBC connects the Java backend to MySQL for permanent storage. Ticket status and resolution are tracked throughout the lifecycle."

## Important

This is a strong starter/demo architecture. For a production deployment, add authentication, server-side validation, environment variables for database credentials, connection pooling, proper logging, and role-based access control.
