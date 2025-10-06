# 🏥 Medical Platform - Complete NestJS Backend

## 📋 Overview

A comprehensive medical platform built with NestJS featuring:

- ✅ **Authentication** - Phone OTP, Google, Apple OAuth
- ✅ **Appointments** - In-person & virtual consultations
- ✅ **Medical Records (EHR)** - Complete electronic health records
- ✅ **Emergency Services** - Real-time emergency response with WebSocket
- ✅ **Dashboard** - Personalized user dashboard
- ✅ **Doctors Management** - Specializations, schedules, availability
- ✅ **Multi-language** - Arabic & English support
- ✅ **Role-based Access** - Patient, Student, Doctor, Admin roles

## 🚀 Quick Start

### Prerequisites

```bash
Node.js v18+
PostgreSQL v14+
npm or yarn
```

### Installation

```bash
# Clone or create project directory
mkdir medical-platform && cd medical-platform

# Run the setup script
chmod +x setup.sh
./setup.sh

# Or manually install
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update database credentials
3. Configure optional services (Twilio, Stripe, etc.)

### Database Setup

```sql
CREATE DATABASE medical_platform;
CREATE USER medical_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE medical_platform TO medical_user;
```

### Run Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Access API

- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

## 📁 Project Structure

```
medical-platform/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── entities/
│   │   │   └── otp.entity.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                   # Users module
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── users.module.ts
│   │
│   ├── doctors/                 # Doctors module
│   │   ├── entities/
│   │   │   ├── doctor.entity.ts
│   │   │   └── specialization.entity.ts
│   │   ├── dto/
│   │   ├── doctors.controller.ts
│   │   ├── doctors.service.ts
│   │   └── doctors.module.ts
│   │
│   ├── appointments/            # Appointments module
│   │   ├── entities/
│   │   │   └── appointment.entity.ts
│   │   ├── dto/
│   │   ├── appointments.controller.ts
│   │   ├── appointments.service.ts
│   │   └── appointments.module.ts
│   │
│   ├── medical-records/         # Medical Records (EHR)
│   │   ├── entities/
│   │   │   ├── medical-record.entity.ts
│   │   │   └── allergy.entity.ts
│   │   ├── dto/
│   │   ├── medical-records.controller.ts
│   │   ├── medical-records.service.ts
│   │   └── medical-records.module.ts
│   │
│   ├── emergency/               # Emergency services
│   │   ├── entities/
│   │   │   └── emergency-case.entity.ts
│   │   ├── dto/
│   │   ├── emergency.controller.ts
│   │   ├── emergency.service.ts
│   │   ├── emergency.gateway.ts
│   │   └── emergency.module.ts
│   │
│   ├── dashboard/               # User dashboard
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   │
│   ├── consultations/           # Virtual consultations
│   ├── prescriptions/           # Prescriptions management
│   ├── laboratories/            # Lab tests
│   ├── home-visits/             # Home visit services
│   ├── notifications/           # Notifications
│   ├── payments/                # Payment processing
│   ├── ai-recommendations/      # AI-based recommendations
│   │
│   ├── common/                  # Shared utilities
│   │   ├── decorators/
│   │   │   ├── get-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   └── roles.guard.ts
│   │   ├── enums/
│   │   │   └── index.ts
│   │   └── ...
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Key Features Implementation

### 1. Authentication Flow

#### Registration
```typescript
POST /api/v1/auth/register
{
  "fullName": "Ahmed Mohamed",
  "phoneNumber": "+201234567890",
  "email": "ahmed@example.com",
  "password": "Password123!",
  "role": "patient",
  "termsAccepted": true,
  "privacyAccepted": true
}
```

#### OTP Verification
```typescript
POST /api/v1/auth/verify-otp
{
  "phoneNumber": "+201234567890",
  "code": "123456"
}
```

#### Login
```typescript
POST /api/v1/auth/login
{
  "phoneNumber": "+201234567890",
  "password": "Password123!"
}
```

### 2. Appointments

#### Create Appointment
```typescript
POST /api/v1/appointments
Headers: { Authorization: "Bearer <token>" }
{
  "doctorId": "uuid",
  "appointmentDate": "2025-10-15",
  "appointmentTime": "14:30",
  "consultationType": "in_person",
  "patientNotes": "Routine checkup",
  "paymentMethod": "card"
}
```

#### Reschedule
```typescript
POST /api/v1/appointments/:id/reschedule
{
  "newDate": "2025-10-16",
  "newTime": "15:00"
}
```

### 3. Medical Records

#### Add Record
```typescript
POST /api/v1/medical-records
{
  "recordType": "consultation",
  "title": "Annual Checkup",
  "description": "Regular health examination",
  "diagnosis": "Healthy",
  "visitDate": "2025-10-05"
}
```

#### Get All Records
```typescript
GET /api/v1/medical-records?recordType=consultation&fromDate=2025-01-01
```

### 4. Emergency Services

#### Create Emergency Case
```typescript
POST /api/v1/emergency
{
  "emergencyType": "chest_pain",
  "description": "Severe chest pain",
  "severity": "high",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "contactPhone": "+201234567890"
}
```

#### WebSocket Connection
```javascript
const socket = io('http://localhost:3000/emergency');

socket.emit('register', userId);
socket.emit('track', emergencyId);

socket.on('emergency:status', (data) => {
  console.log('Emergency status updated:', data);
});

socket.on('emergency:doctor_assigned', (data) => {
  console.log('Doctor assigned:', data);
});
```

### 5. Dashboard

#### Get Dashboard Overview
```typescript
GET /api/v1/dashboard
Response: {
  user: { ... },
  upcomingAppointments: [ ... ],
  recentRecords: [ ... ],
  stats: {
    totalAppointments: 15,
    completedAppointments: 12,
    upcomingAppointments: 3,
    totalRecords: 45
  },
  activeMedications: [ ... ],
  allergies: [ ... ]
}
```

## 🗄️ Database Schema

### Key Tables

- **users** - User accounts with roles
- **otps** - OTP verification codes
- **doctors** - Doctor profiles and schedules
- **specializations** - Medical specializations
- **appointments** - Appointment bookings
- **medical_records** - Electronic health records
- **allergies** - Patient allergies
- **emergency_cases** - Emergency requests
- **prescriptions** - Medical prescriptions
- **home_visits** - Home visit requests
- **lab_tests** - Laboratory tests
- **payments** - Payment transactions
- **notifications** - User notifications

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- OTP verification for phone numbers
- Role-based access control (RBAC)
- 2FA support
- Input validation with class-validator
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting ready

## 🌐 API Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/request-otp` - Request OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/reset-password` - Reset password
- `POST /auth/guest-login` - Guest access

### Doctors
- `GET /doctors` - List all doctors
- `GET /doctors/:id` - Get doctor details
- `GET /doctors/:id/schedule` - Get doctor schedule
- `GET /doctors/specializations` - List specializations

### Appointments
- `GET /appointments` - User appointments
- `POST /appointments` - Create appointment
- `GET /appointments/upcoming` - Upcoming appointments
- `PATCH /appointments/:id` - Update appointment
- `POST /appointments/:id/reschedule` - Reschedule
- `DELETE /appointments/:id` - Cancel appointment

### Medical Records
- `GET /medical-records` - Get all records
- `POST /medical-records` - Add new record
- `GET /medical-records/:id` - Get specific record
- `POST /medical-records/:id/upload` - Upload files
- `POST /medical-records/:id/share` - Share record
- `GET /medical-records/export/pdf` - Export to PDF
- `POST /medical-records/allergies` - Add allergy
- `GET /medical-records/allergies` - Get allergies

### Emergency
- `POST /emergency` - Create emergency case
- `GET /emergency/my-cases` - User emergency history
- `GET /emergency/nearest` - Nearest facilities
- `GET /emergency/:id` - Get case details
- `PATCH /emergency/:id/status` - Update status (Doctor/Admin)

### Dashboard
- `GET /dashboard` - Dashboard overview
- `GET /dashboard/stats` - User statistics
- `GET /dashboard/upcoming` - Upcoming appointments
- `GET /dashboard/medications` - Active medications
- `GET /dashboard/nutrition` - Nutrition plan
- `GET /dashboard/activity` - Recent activity

## 🛠️ Development

### Running Tests
```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

### Linting
```bash
npm run lint
npm run format
```

### Building
```bash
npm run build
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: medical_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 📝 Environment Variables

Required:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`

Optional:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - SMS OTP
- `STRIPE_SECRET_KEY` - Payments
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `FIREBASE_*` - Push notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 👥 Support

For support: support@medicalplatform.com

---

**Built with ❤️ using NestJS**
