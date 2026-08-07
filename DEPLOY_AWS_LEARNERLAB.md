# Despliegue backend + BD en AWS Academy LearnerLab

Guía paso a paso para desplegar el backend (Node/Express + MySQL) de EmpleaMe en un LearnerLab de AWS Academy.

> **Restricciones del LearnerLab:** no se pueden crear roles IAM nuevos (solo usar `LabRole` / `LabInstanceProfile`), la sesión dura ~4h y hay que reanudarla, las credenciales AWS son temporales (STS).

---

## 0. Preparar el lab

- [ ] AWS Academy → **Start Lab** → esperar círculo verde.
- [ ] Abrir consola AWS (link "AWS" del lab).
- [ ] Confirmar región (normalmente `us-east-1`).

---

## 1. Base de datos (RDS MySQL)

- [ ] RDS → **Crear base de datos** → botón desplegable arriba a la derecha → elegir **Configuración completa** (NO "Configuración expres": oculta opciones que necesitas configurar a mano, como el security group y el usuario/password custom).
- [ ] Motor: **MySQL** → versión 8.0.x (compatible con `mysql2`).
- [ ] **Plantillas**: elegir **Desarrollo y pruebas** (NO "Producción" — esa activa Multi-AZ, duplica el consumo de crédito y no la necesitas para un LearnerLab de 4h).
- [ ] **Disponibilidad y durabilidad**: elegir **Implementación de una instancia de base de datos de zona de disponibilidad única (1 instancia)** (la opción de la derecha, NO la del medio "Multi-AZ (2 instancias)" que viene preseleccionada — esa crea una instancia en espera extra y duplica el gasto).
- [ ] Identificador de instancia de BD: `empleame-db`.
- [ ] Credenciales: usuario master (ej. `admin`) + password propio (autogenerada o manual) — guardar en lugar seguro, no vuelve a mostrarse.
- [ ] Clase de instancia: **db.t3.micro** (o la más pequeña disponible en burstable classes).
- [ ] Almacenamiento: 20 GB gp2/gp3, sin autoescalado (para no pasarte de crédito sin darte cuenta).
- [ ] Conectividad → **No conectar a un recurso de proposito compute EC2** si prefieres configurar la red manual, o dejar que asocie tu instancia EC2 si ya la creaste.
- [ ] **Acceso público**: `No` si el backend vive en la misma VPC (recomendado). `Sí` solo temporalmente si necesitas importar el schema desde tu máquina local (paso 2), luego desactivar.
- [ ] Grupo de seguridad de VPC: **Crear nuevo** → `empleame-db-sg` — abrir puerto **3306** solo desde el security group del EC2 (paso 3), no desde `0.0.0.0/0`.
- [ ] Autenticación: contraseña (no IAM, no Kerberos — LearnerLab no lo soporta bien).
- [ ] Dejar el resto en valores por defecto → **Crear base de datos**.
- [ ] Esperar estado `Available` (puede tardar 5-10 min) → copiar el **endpoint** (pestaña Connectivity & security).

---

## 2. Importar schema

Desde tu máquina (si RDS es público) o desde un bastion en la misma VPC:

```bash
mysql -h <rds-endpoint> -u <usuario> -p < sql/schema.sql
mysql -h <rds-endpoint> -u <usuario> -p < sql/inserts.sql
```

---

## 3. EC2 para el backend

- [ ] EC2 → **Launch instance** (Lanzar instancia).
- [ ] Nombre: `empleame-backend`.
- [ ] AMI: **Amazon Linux 2023** (Free tier eligible, marcado por defecto).
- [ ] Tipo de instancia: **t2.micro** o **t3.micro** (Free tier eligible).
- [ ] Par de claves (key pair): **Crear nuevo par de claves** → tipo RSA, formato `.pem` → descargar y guardar (no se puede volver a descargar).
- [ ] Configuración de red → **Editar**:
  - VPC/Subred: la misma VPC/subred donde está el RDS (paso 1).
  - Auto-assign public IP: **Enable**.
  - Firewall (security groups): **Crear grupo de seguridad nuevo** → `empleame-backend-sg`:
    - Regla SSH (22): origen **Mi IP** (no `0.0.0.0/0`).
    - Regla custom TCP (3001) o HTTP (80) / HTTPS (443) si usas nginx: origen **Anywhere (0.0.0.0/0)** — necesario para que el frontend/cualquier dispositivo acceda.
- [ ] Configurar almacenamiento: 8-16 GB gp3 (default está bien).
- [ ] Detalles avanzados → **IAM instance profile**: `LabInstanceProfile` (da acceso a S3 si el bucket usa el mismo rol del lab; en LearnerLab no puedes crear uno nuevo).
- [ ] **Launch instance** → esperar estado `Running` y "2/2 status checks passed" → copiar IP pública (IPv4).
- [ ] (Recomendado) EC2 → **Elastic IPs** → **Allocate Elastic IP address** → **Associate** con esta instancia, para que la IP no cambie al reiniciar el lab.

---

## 4. Instalar dependencias en la instancia

```bash
ssh -i key.pem ec2-user@<ip-publica>
sudo dnf update -y
sudo dnf install -y git nodejs npm
node -v   # verificar >=18
```

---

## 5. Desplegar código

```bash
git clone <tu-repo-url>
cd empleame/backend
npm install
```

---

## 6. Configurar `.env` en el servidor

Crear `backend/.env` (nunca subir a git):

```
DB_HOST=<rds-endpoint>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<password>
DB_NAME=<nombre_db>
PORT=3001
JWT_SECRET=<valor-fuerte>
S3_BUCKET=<tu-bucket>
```

> ⚠️ Si el EC2 tiene `LabInstanceProfile` asociado, **no** pongas `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` en el `.env` — el SDK toma credenciales automáticamente del rol de la instancia. Si en cambio usas keys manuales del lab (`AWS_SESSION_TOKEN` incluido), recuerda que expiran con la sesión y hay que refrescarlas al reanudar el lab.

---

## 7. Proceso persistente (PM2)

```bash
sudo npm install -g pm2
pm2 start index.js --name empleame-backend
pm2 save
pm2 startup   # seguir la instrucción que imprime, para arrancar al boot
```

---

## 8. (Opcional, recomendado) Nginx como reverse proxy

```bash
sudo dnf install -y nginx
sudo systemctl enable --now nginx
```

`/etc/nginx/conf.d/empleame.conf`:

```nginx
server {
    listen 80;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. Frontend

- [ ] Actualizar `VITE_API_URL` apuntando a `http://<ip-o-dominio-ec2>` (o `:3001` si no usas nginx).
- [ ] Redeploy del frontend (Vercel) con esa variable.

---

## 10. Verificar

```bash
curl http://<ip-publica>/          # debe responder {"status":"EmpleaMe API corriendo"}
curl http://<ip-publica>/api/vacantes
```

---

## Puntos críticos LearnerLab

- **Sesión expira ~4h**: al reiniciar el lab, la IP pública de EC2 puede cambiar salvo que uses Elastic IP.
- **Credenciales STS**: expiran con la sesión — reconfigurar (`aws configure`) al reanudar si las usas.
- **RDS puede tardar en arrancar** tras una pausa del lab — revisar estado antes de asumir caída.
- Los recursos persisten entre sesiones del mismo lab, pero se pierden si el lab termina definitivamente (fin de curso). No es infraestructura de producción real.
