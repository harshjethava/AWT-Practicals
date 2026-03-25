# Django Student Management System (MongoDB Atlas + Mongoengine)

## Overview
Full student management CRUD app (Create/Read/Update/Delete) built with Django, Mongoengine, and MongoDB Atlas in `Practical_8`.

## Tech Stack
- **Framework**: Django 4.2.10
- **MongoDB ODM**: Mongoengine 1.9+
- **Database**: MongoDB Atlas (Cloud or Local)
- **Python**: 3.9+ (tested on 3.14)

## Setup Instructions

### 1. Create Virtual Environment (Python 3.9+)
```powershell
python -m venv venv
.\venv\Scripts\activate
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables
- Copy `.env.example` to `.env`
- Set MongoDB URI from MongoDB Atlas:
  ```
  MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/student_db?retryWrites=true&w=majority
  DJANGO_SECRET_KEY=your-secret-key-here
  DJANGO_DEBUG=True
  DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
  ```

### 4. Migrate Django Auth Tables (SQLite)
```powershell
python manage.py migrate
```
> Note: No `makemigrations` needed—mongoengine handles MongoDB schema directly.

### 5. Run Development Server
```powershell
python manage.py runserver
```

### 6. Access the Application
- **Student UI**: `http://127.0.0.1:8000/`
- **Django Admin**: `http://127.0.0.1:8000/admin/` (for auth/user management only)

## Features
- ✅ Add new student (first name, last name, email, age, department)
- ✅ View all students with pagination support
- ✅ Search students by name, email, or department
- ✅ Edit student details
- ✅ Delete student records
- ✅ Bootstrap 5 responsive UI
- ✅ Real-time MongoDB Atlas integration

## App Routes
| Route | Action |
|-------|--------|
| `/` | Display all students + search |
| `/add/` | Create new student |
| `/edit/<student_id>/` | Edit student by ObjectId |
| `/delete/<student_id>/` | Delete student by ObjectId |

## MongoDB Atlas Setup
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 tier)
3. Create database user with username/password
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
5. Add your IP to allowlist
6. Paste connection URI into `.env` file

## Project Structure
```
Practical_8/
├── manage.py
├── requirements.txt
├── .env
├── db.sqlite3 (Django auth DB)
├── README.md
├── student_management/
│   ├── settings.py (mongoengine config)
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── students/
    ├── models.py (mongoengine Document models)
    ├── views.py (CRUD logic)
    ├── forms.py (custom forms for mongoengine)
    ├── urls.py
    ├── admin.py
    └── templates/students/
        ├── base.html
        ├── student_list.html
        ├── student_form.html
        └── student_confirm_delete.html
```

## Key Differences from Django ORM
- **Models**: Use `mongoengine.Document` instead of `django.db.models.Model`
- **Queries**: Use `Student.objects()` instead of `Student.objects.all()`
- **IDs**: Use MongoDB ObjectId; convert URL string to ObjectId: `ObjectId(pk_string)`
- **Forms**: Custom form class (no ModelForm support)
- **Admin**: Student model handled by custom web UI, not Django admin

## Troubleshooting

### MongoDB Connection Error
```
ConnectionError: ... [Errno 'Connection refused']
```
- Verify `.env` has correct `MONGO_URI`
- Confirm IP whitelisted in MongoDB Atlas
- Test connection: `mongosh "<MONGO_URI>"`

### ImportError: No module named 'mongoengine'
```powershell
pip install mongoengine==1.9.0
```

### Email Uniqueness Violation
- Mongoengine enforces unique constraint at document level
- Error message shown in UI when duplicate email submitted

## Notes
- This setup uses **mongoengine** (object-based) instead of djongo (Django ORM layer)
- SQLite (`db.sqlite3`) stores Django auth/user tables only
- MongoDB stores all student records
- Compatible with Python 3.9, 3.10, 3.11, 3.12, 3.14+

## Future Enhancements
- Pagination for large student lists
- Export students to CSV/Excel
- Student grades/marks tracking
- REST API with DRF
- React/Vue frontend
- Student photo upload
