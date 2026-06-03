# Comisiones — Front v2 (React + Vite)

Front **nuevo** de la app de fichaje + comisiones. A diferencia del primero
(`comisiones-frontend`, Supabase + GitHub Pages), **este consume el backend
Spring Boot** (`comisiones-backend`) vía su API REST y se despliega junto a él
en DigitalOcean.

## Stack
- **React 19 + Vite 7** (Vite 7, NO 8: la PC tiene Smart App Control y bloquea el
  binario nativo de Vite 8 / rolldown).
- Sin librerías de estado ni de UI: `fetch` + CSS a mano (mobile-first, dark auto).
- El cálculo de comisiones lo hace el **backend** (única fuente de verdad); el
  front solo carga datos y muestra los valores que ya vienen calculados.

## Correr en local
Necesitás el backend corriendo en `http://localhost:8080`
(`docker compose up` en `comisiones-backend`, o `./mvnw spring-boot:run`).

```bash
npm install
npm run dev        # http://localhost:5173
```
Vite redirige `/api` al backend (configurable con `VITE_API_TARGET`, ver `.env.example`).

```bash
npm run build      # genera dist/ (lo que sirve nginx en prod)
npm run preview    # previsualiza el build
```

## Producción
El `Dockerfile` hace build con Node y sirve el `dist/` con **nginx**, que además
**reenvía `/api` al contenedor de la API** (`proxy_pass http://api:8080`). Así el
front y la API quedan en el mismo origen y no hace falta CORS.

Se levanta como 3er contenedor desde `comisiones-backend/docker-compose.prod.yml`.
Ver `DEPLOY-digitalocean.md` en el repo del backend.

## Estructura
```
src/api.js                  cliente REST (rutas relativas /api/jornadas)
src/lib/format.js           formato CLP / horas / fechas
src/components/JornadaForm  carga/edición de un día (bottom-sheet)
src/components/ResumenMensual  lista del mes
src/App.jsx                 navegación de mes + totales + orquestación
src/styles.css              estilos (mobile-first, dark, animaciones)
```
