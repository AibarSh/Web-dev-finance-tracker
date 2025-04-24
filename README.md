Finance Tracker (Angular + Django + PostgreSQL)
Group members: Асылбек Ансар 23B31173, Шакеев Айбар 23B031882, Акмурзаев Жанарыс 23B030280

This is a full-stack web application called Finance Tracker, which allows users to:

Manage their finances

View and record expenses and incomes

Set budget goals

Built using:

Angular (Frontend)

Django + Django REST Framework (Backend)

PostgreSQL (Database)

Chart.js (For data visualization)

ngx-cookie-service (For managing authentication tokens in cookies)

🔧 Prerequisites
Make sure you have the following installed:

Python (>=3.8)

PostgreSQL

Node.js (>=16.0) and npm

Angular CLI

Git

🖥 Backend (Django + PostgreSQL)
1️⃣ Clone the Repository
sh
Копировать
Редактировать
git clone https://github.com/AibarSh/Web-dev-finance-tracker
cd Web-dev-finance-tracker
2️⃣ Set Up a Virtual Environment
sh
Копировать
Редактировать
python -m venv env
source env/bin/activate  # macOS/Linux
env\Scripts\activate  # Windows
3️⃣ Install Dependencies
sh
Копировать
Редактировать
pip install -r requirements.txt
4️⃣ Configure PostgreSQL Database
Update your settings.py with your PostgreSQL credentials:

python
Копировать
Редактировать
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
5️⃣ Run Migrations & Start Server
sh
Копировать
Редактировать
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
Django backend should now be running at: http://127.0.0.1:8000

🌐 Frontend (Angular)
1️⃣ Install Dependencies
sh
Копировать
Редактировать
npm install
2️⃣ Install Chart.js and ngx-cookie-service
sh
Копировать
Редактировать
npm install chart.js
npm install ngx-cookie-service
3️⃣ Start Angular Development Server
sh
Копировать
Редактировать
ng serve
Angular app should now be available at: http://localhost:4200

📌 Additional Commands
Django Shell
sh
Копировать
Редактировать
python manage.py shell
Create Django Superuser
sh
Копировать
Редактировать
python manage.py createsuperuser
Access Django Admin Panel
http://127.0.0.1:8000/admin/

Run Django Tests
sh
Копировать
Редактировать
python manage.py test
Build Angular for Production
sh
Копировать
Редактировать
ng build --configuration production
🛠 Troubleshooting
1️⃣ CORS Policy Error
Add this to settings.py:

python
Копировать
Редактировать
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE.insert(1, 'corsheaders.middleware.CorsMiddleware')
CORS_ALLOW_ALL_ORIGINS = True  # or define specific origins
2️⃣ ModuleNotFoundError
sh
Копировать
Редактировать
pip install -r requirements.txt
3️⃣ Angular Fails to Compile
sh
Копировать
Редактировать
rm -rf node_modules package-lock.json  # macOS/Linux
rd /s /q node_modules && del package-lock.json  # Windows
npm install
