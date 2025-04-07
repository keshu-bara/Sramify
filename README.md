# 📱 Sramify

**Empowering Work, Simplifying Workforce Solutions**

---

## 📌 What is Sramify?

Sramify bridges the gap between **unskilled labor workers** and **job providers**, making labor hiring **fast, seamless, and efficient**.  
The platform empowers workers with better job opportunities while ensuring businesses and individuals get reliable manpower effortlessly.

Derived from the Sanskrit word **"Śrama" (श्रम)** meaning *labor* or *effort*, and the suffix **"-ify"** implying *transformation*, **Sramify** represents the evolution of the labor market through technology and accessibility.

---

## ⚙️ Tech Stack

| Layer       | Technology           |
|-------------|----------------------|
| Frontend    | React Native (Expo)  |
| Backend     | Django (REST API)    |
| Database    | SQLite               |

---

## 🔧 Features

- Contractor Dashboard (Add new labors, register labor)
- Referral-Based Trust System
- Ratings & Video Verification
- Worker Insurance & Tracking
- Multiple Revenue Streams:
  - Commission-based model
  - Subscription for job providers
  - Lead generation from workers
  - Upskilling & certification
  - Featured listings, surge pricing, etc.

---

## 🚀 Getting Started

### 📲 Frontend (React Native using Expo)

#### Prerequisites:

- Node.js installed
- `expo-cli` installed globally:
```bash
  npm install -g expo-cli
```
1. Clone the Repository:
```bash
git clone https://github.com/your-username/sramify.git
cd sramify/Sramkia
```
2. Install Dependencies:
```bash
npm install
```
3. Start Expo Development Server:
```bash
expo start
```
📱 Scan the QR Code from your Expo Go app to run the mobile app on your phone.

🖥 Backend (Django)
Prerequisites:
Python 3.9+

pip installed

1. Navigate to Backend:
```bash
cd ../backend
```
2. Create a Virtual Environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activat
```
3. Install Requirements:
```bash
pip install -r requirements.txt
```
4. Run Migrations:
```bash
python manage.py migrate
```
5. Run Development Server:
```bash
python manage.py runserver
```
🌐 API will be available at http://127.0.0.1:8000/.
📡 API Endpoints (Example)
Endpoint	Description
/api/labors/	List/Add labors
/api/contractors/	Contractor registration
/api/login/	User authentication


📦 Future Enhancements
Voice-based booking (via WhatsApp)

Microfinance, insurance & tool rentals

Integration with municipal job fairs

Apartment society worker tie-ups
```
