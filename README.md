# Capture App

Application de capture d'écran et d'annotation vidéo, composée de trois modules :

- **backend/** — API REST en Java (Spring Boot) : gestion des menus, modules, captures et vidéos, authentification et uploads d'images.
- **frontend/** — Interface React (Vite + Tailwind CSS) : tableau de bord, arborescence des menus, éditeur vidéo.
- **video-python/** — Microservice Python : traitement et génération des vidéos.


## Structure du projet

```
├── backend/            # API Spring Boot (port 8080)
│   └── src/main/java/com/capture/app/
│       ├── controller/   # Endpoints REST
│       ├── service/      # Logique métier
│       ├── repository/   # Accès aux données (Spring Data JPA)
│       ├── entity/       # Entités JPA
│       └── config/       # Sécurité, gestion des exceptions
├── frontend/           # Interface React (Vite + Tailwind)
│   ├── src/
│   │   ├── api/        # Appels axios
│   │   ├── components/ # Composants React
│   │   ├── pages/      # Pages
│   │   └── context/    # Contextes React (auth, module)
│   ├── public/
│   └── package.json
└── video-python/       # Script de génération vidéo
    └── app.py
```

## Installation et lancement

### 1. Base de données

Créer la base MySQL :

```sql
CREATE DATABASE capture_app CHARACTER SET utf8mb4;
```

Configurer l'accès dans `backend/src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/capture_app
spring.datasource.username=VOTRE_USER
spring.datasource.password=VOTRE_MOT_DE_PASSE
spring.jpa.hibernate.ddl-auto=update
```

### 2. Backend (Spring Boot)

```bash
cd backend
mvnw.cmd spring-boot:run      # Windows
```

L'API démarre sur `http://localhost:8080`.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

### 4. Service vidéo (Python)

```bash
cd video-python
pip install -r requirements.txt
python app.py
```

## API principale

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion |
| GET/POST | `/api/modules` | Liste / création de modules |
| GET/POST/PUT/DELETE | `/api/menus` | Gestion des menus |
| POST | `/api/captures` | Enregistrement d'une capture |
| POST | `/api/videos` | Génération d'une vidéo |

## Technologies

- **Backend** : Spring Boot, Spring Data JPA, Spring Security, MySQL
- **Frontend** : React, Vite, Tailwind CSS, Axios
- **Vidéo** : Python

