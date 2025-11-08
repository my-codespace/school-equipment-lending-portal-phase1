```mermaid
graph TD;
    %% Style Definitions
    classDef provider fill:#d6e4ff,stroke:#333,stroke-width:2px;
    classDef page fill:#e1f7d5,stroke:#333,stroke-width:2px;
    classDef protected fill:#ffdec9,stroke:#333,stroke-width:2px;
    classDef router fill:#f9f3c2,stroke:#333,stroke-width:2px;

    %% Component Hierarchy
    A[App] --> B(AuthProvider);
    B --> C(Router);
    C --> D{Routes};

    class A,B provider;
    class C,D router;

    subgraph Public Routes
        D --> Login[Login<br>/login];
        D --> Register[Register<br>/register];
        D --> Unauthorized[Unauthorized<br>/unauthorized];
        D --> ErrorPage[ErrorPage<br>/*];
        D --> Navigate[Navigate<br>to /login];
    end

    subgraph Protected Routes
        D --> P1(ProtectedRoute);
        P1 --> EL[EquipmentList<br>/equipment];

        D --> P2(ProtectedRoute<br>roles: ['admin']);
        P2 --> AD[AdminDashboard<br>/admin/dashboard];
        
        D --> P3(ProtectedRoute<br>roles: ['admin', 'staff']);
        P3 --> RM[RequestManagement<br>/requests];

        D --> P4(ProtectedRoute);
        P4 --> MR[MyRequests<br>/my-requests];
    end

    %% Apply Page and ProtectedRoute styles
    class Login,Register,Unauthorized,ErrorPage,Navigate,EL,AD,RM,MR page;
    class P1,P2,P3,P4 protected;
```
```mermaid
graph TD
    subgraph "Client (on Browser)"
        Client[<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="30" /> <br> React SPA]
    end

    subgraph "Backend"
        Server[<img src="https://static-00.iconduck.com/assets.00/nodejs-icon-2048x2048-rpc0nxxb.png" width="30" /> <br> Node.js / Express Server]
    end
    
    subgraph "Database"
        DB[(<img src="https://static-00.iconduck.com/assets.00/mongodb-icon-2048x2048-n0crh6w2.png" width="30" /> <br> MongoDB Database)]
    end

    Client -- "<b>REST API Calls</b><br>(GET, POST, PATCH, etc.)" --> Server
    Server -- "Mongoose (CRUD Operations)" --> DB
```
```mermaid
sequenceDiagram
    participant C as React Client
    participant S as Express Server
    participant DB as MongoDB

    C ->> S: 1. POST /api/auth/login (email, password)
    S ->> DB: 2. Find user by email
    DB -->> S: Return user (with hashed password)
    S ->> S: 3. Verify password (bcrypt.compare)
    
    alt Credentials Correct
        S ->> S: 4. Create JWT (sign with JWT_SECRET)
        S -->> C: 5. 200 OK (Response with JWT)
        C ->> C: 6. Store token in localStorage/Context
    else Credentials Incorrect
        S -->> C: 4. 401 Unauthorized
    end
```

```mermaid
sequenceDiagram
    participant C as React Client (Student)
    participant S as Server (Node.js/Express)
    participant DB as MongoDB

    C ->> S: 1. POST /api/request <br> (Header: {Authorization: Bearer JWT})
    
    S ->> S: 2. authMiddleware.js runs <br> (Verifies JWT & 'student' role)
    
    S ->> DB: 3. requestController.js <br> (Find equipment, check availableCount > 0)
    DB -->> S: Equipment data (e.g., availableCount: 5)
    
    S ->> DB: 4. requestController.js <br> (Check for user's existing active requests for this item)
    DB -->> S: Existing requests (e.g., 0)
    
    note right of S: Assume all checks pass
    
    S ->> DB: 5. requestController.js <br> (Create new Request document, status: 'pending')
    DB -->> S: New request object
    
    S -->> C: 6. Server sends 201 Created (with new request)
    C ->> C: 7. Client updates UI (shows 'Success!')
```
