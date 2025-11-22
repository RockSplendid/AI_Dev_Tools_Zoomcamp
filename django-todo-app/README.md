# Django TODO Application

A full-featured TODO application built with Django, featuring create, read, update, and delete operations with advanced filtering and search capabilities.

![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- ✅ Create, Read, Update, Delete TODOs
- ✅ Assign due dates to tasks
- ✅ Mark TODOs as resolved/completed
- ✅ Filter by status (Active, Resolved, Overdue)
- ✅ Search functionality
- ✅ Category and tag support
- ✅ Responsive Bootstrap 5 UI
- ✅ Comprehensive test suite

## Tech Stack

- **Backend:** Django 4.2
- **Frontend:** Bootstrap 5, Bootstrap Icons
- **Database:** SQLite (development), PostgreSQL ready
- **Testing:** Django TestCase

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/django-todo-app.git
   cd django-todo-app
   ```

2. **Create a virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Open your browser and go to: `http://127.0.0.1:8000/`
   - Admin panel: `http://127.0.0.1:8000/admin/`

## Usage

### Creating a TODO
1. Click "Add New TODO" button
2. Fill in the title (required) and optional fields
3. Set a due date if needed
4. Click "Save TODO"

### Managing TODOs
- **View:** Click on any TODO to see full details
- **Edit:** Click the edit icon to modify a TODO
- **Delete:** Click the delete icon and confirm
- **Complete:** Click the checkmark to mark as resolved
- **Filter:** Use filter pills to view Active, Resolved, or Overdue tasks
- **Search:** Use the search bar to find specific TODOs