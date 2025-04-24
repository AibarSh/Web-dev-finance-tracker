# Finance Tracker (Angular + Django)
Group members: Асылбек Ансар 23B31173, Шакеев Айбар 23B031882, Акмурзаев Жанарыс 23B030280

This is a full-stack web application called **Finance Tracker**, which allows users to:
- **Manage their finances**
- **View and record expenses and incomes**
- **Set budget goals**

Built using:
- **Angular** (Frontend)
- **Django** + **Django REST Framework** (Backend)
- **PostgreSQL** (Database)
- **Chart.js** (For data visualization)
- **ngx-cookie-service** (For cookie management)

## 🔧 Prerequisites
Ensure you have the following installed on your system:
- **Python (>=3.8)**
- **Node.js (>=16.0)** and **npm**
- **Angular CLI**
- **Git**
- **PostgreSQL**

---

## 🖥 Backend (Django)
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/AibarSh/Web-dev-finance-tracker
cd Web-dev-finance-tracker
```


### 2️⃣ Set Up a Virtual Environment
```sh
python -m venv env
source env/bin/activate  # macOS/Linux
env\Scripts\activate  # Windows
```

### 3️⃣ Install Dependencies
```sh
pip install -r requirements.txt
```

### 4️⃣ Configure PostgreSQL Database
- Create a PostgreSQL database and update the `DATABASES` setting in `settings.py`:
python
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_database_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 5️⃣ Run Migrations & Start Server
```sh
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
The Django backend should now be running at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🌐 Frontend (Angular)

### 1️⃣ Install Dependencies
```sh
npm install
```

### 2️⃣ Install Chart.js and ngx-cookie-service
```sh
npm install chart.js ngx-cookie-service
```

### 3️⃣ Start the Angular Development Server
```sh
ng serve
```
The Angular app should now be running at: [http://localhost:4200](http://localhost:4200)

---

## 📌 Additional Commands
### Run Django Shell
```sh
python manage.py shell
```
### Create a Superuser for Admin Panel
```sh
python manage.py createsuperuser
```

### Access Django Admin Panel
Visit: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) and log in with your superuser credentials.

### Run Django Tests
```sh
python manage.py test
```

### Build Angular for Production
```sh
ng build --configuration production
```

---

## 🛠 Troubleshooting
### Common Issues & Fixes
1️⃣ **CORS Policy Error (Frontend cannot communicate with Backend)**
- Add the following to settings.py:
```python
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE.insert(1, 'corsheaders.middleware.CorsMiddleware')
CORS_ALLOW_ALL_ORIGINS = True  # (Or define specific allowed origins)
```
- Restart the server.

2️⃣ **ModuleNotFoundError**
- Run pip install -r requirements.txt again.

3️⃣ **Angular Fails to Compile**
- Delete node_modules and reinstall:
```sh
rm -rf node_modules package-lock.json  # macOS/Linux
rd /s /q node_modules && del package-lock.json  # Windows
npm install
```
4️⃣ **PostgreSQL Connection Error**
- Ensure PostgreSQL is running and the database credentials in settings.py are correct.
- Install the PostgreSQL adapter if missing:
```sh
pip install psycopg2-binary
```
