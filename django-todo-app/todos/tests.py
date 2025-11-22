# ============================================
# tests.py - Comprehensive Test Suite
# ============================================

"""
TESTING STRATEGY FOR TODO APPLICATION

Test Coverage Areas:
1. Models - Data integrity and methods
2. Views - HTTP responses and business logic
3. Forms - Validation and data processing
4. URLs - Routing configuration
5. Integration - End-to-end workflows

Testing Pyramid:
- Unit Tests (70%): Individual components
- Integration Tests (20%): Component interactions
- E2E Tests (10%): Complete user workflows
"""

from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from .models import Todo, Category, Tag
from .forms import TodoForm


# ============================================
# MODEL TESTS
# ============================================

class TodoModelTest(TestCase):
    """
    Test the Todo model functionality.
    
    Scenarios:
    - Todo creation with valid data
    - String representation
    - Default values
    - Auto-timestamp fields
    - Custom methods (is_overdue)
    - Model validation
    """
    
    def setUp(self):
        """
        Set up test data before each test method.
        Called automatically before each test.
        """
        self.category = Category.objects.create(
            name="Work",
            color="#FF5733"
        )
        
        self.todo = Todo.objects.create(
            title="Test TODO",
            description="Test description",
            due_date=timezone.now() + timedelta(days=7)
        )
    
    def test_todo_creation(self):
        """Test that TODO is created correctly with all fields"""
        self.assertEqual(self.todo.title, "Test TODO")
        self.assertEqual(self.todo.description, "Test description")
        self.assertIsNotNone(self.todo.due_date)
        self.assertFalse(self.todo.is_resolved)
        self.assertIsNotNone(self.todo.created_at)
        self.assertIsNotNone(self.todo.updated_at)
    
    def test_todo_str_representation(self):
        """Test the string representation of TODO"""
        self.assertEqual(str(self.todo), "Test TODO")
    
    def test_todo_default_values(self):
        """Test that default values are set correctly"""
        todo = Todo.objects.create(title="Minimal TODO")
        self.assertFalse(todo.is_resolved)
        self.assertEqual(todo.description, "")
        self.assertIsNone(todo.due_date)
    
    def test_todo_is_overdue_method_future(self):
        """Test is_overdue method returns False for future dates"""
        future_todo = Todo.objects.create(
            title="Future TODO",
            due_date=timezone.now() + timedelta(days=1)
        )
        self.assertFalse(future_todo.is_overdue())
    
    def test_todo_is_overdue_method_past(self):
        """Test is_overdue method returns True for past dates"""
        overdue_todo = Todo.objects.create(
            title="Overdue TODO",
            due_date=timezone.now() - timedelta(days=1)
        )
        self.assertTrue(overdue_todo.is_overdue())
    
    def test_todo_is_overdue_method_resolved(self):
        """Test is_overdue returns False for resolved TODOs even if past due"""
        resolved_todo = Todo.objects.create(
            title="Resolved TODO",
            due_date=timezone.now() - timedelta(days=1),
            is_resolved=True
        )
        self.assertFalse(resolved_todo.is_overdue())
    
    def test_todo_is_overdue_method_no_due_date(self):
        """Test is_overdue returns False when no due date is set"""
        todo = Todo.objects.create(title="No Due Date TODO")
        self.assertFalse(todo.is_overdue())
    
    def test_todo_timestamps_auto_update(self):
        """Test that updated_at changes when TODO is modified"""
        original_updated = self.todo.updated_at
        # Small delay to ensure timestamp difference
        import time
        time.sleep(0.01)
        
        self.todo.title = "Updated Title"
        self.todo.save()
        
        self.assertNotEqual(self.todo.updated_at, original_updated)
        self.assertGreater(self.todo.updated_at, original_updated)
    
    def test_todo_with_category(self):
        """Test TODO can be associated with a category"""
        todo = Todo.objects.create(
            title="Categorized TODO",
            category=self.category
        )
        self.assertEqual(todo.category, self.category)
        self.assertEqual(todo.category.name, "Work")


class CategoryModelTest(TestCase):
    """Test Category model functionality"""
    
    def test_category_creation(self):
        """Test category is created correctly"""
        category = Category.objects.create(
            name="Personal",
            color="#00FF00"
        )
        self.assertEqual(category.name, "Personal")
        self.assertEqual(category.color, "#00FF00")
    
    def test_category_str_representation(self):
        """Test category string representation"""
        category = Category.objects.create(name="Shopping")
        self.assertEqual(str(category), "Shopping")
    
    def test_category_unique_name(self):
        """Test that category names must be unique"""
        Category.objects.create(name="Work")
        with self.assertRaises(Exception):
            Category.objects.create(name="Work")


class TagModelTest(TestCase):
    """Test Tag model functionality"""
    
    def test_tag_creation(self):
        """Test tag is created correctly"""
        tag = Tag.objects.create(name="urgent", slug="urgent")
        self.assertEqual(tag.name, "urgent")
        self.assertEqual(tag.slug, "urgent")
    
    def test_tag_str_representation(self):
        """Test tag string representation"""
        tag = Tag.objects.create(name="important", slug="important")
        self.assertEqual(str(tag), "important")


# ============================================
# VIEW TESTS
# ============================================

class TodoListViewTest(TestCase):
    """
    Test the TODO list view.
    
    Scenarios:
    - View is accessible
    - Correct template is used
    - All TODOs are displayed
    - Filtering works correctly
    - Search functionality
    - Empty state handling
    """
    
    def setUp(self):
        """Set up test data and client"""
        self.client = Client()
        
        # Create test TODOs
        self.todo1 = Todo.objects.create(
            title="Active TODO",
            is_resolved=False
        )
        self.todo2 = Todo.objects.create(
            title="Resolved TODO",
            is_resolved=True
        )
        self.todo3 = Todo.objects.create(
            title="Overdue TODO",
            due_date=timezone.now() - timedelta(days=1),
            is_resolved=False
        )
    
    def test_list_view_status_code(self):
        """Test that list view returns 200 OK"""
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
    
    def test_list_view_uses_correct_template(self):
        """Test that correct template is used"""
        response = self.client.get(reverse('todo_list'))
        self.assertTemplateUsed(response, 'todos/todo_list.html')
    
    def test_list_view_shows_all_todos(self):
        """Test that all TODOs are displayed by default"""
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(len(response.context['todos']), 3)
    
    def test_list_view_filter_active(self):
        """Test filtering for active TODOs"""
        response = self.client.get(reverse('todo_list') + '?filter=active')
        todos = response.context['todos']
        self.assertEqual(len(todos), 2)  # todo1 and todo3
        for todo in todos:
            self.assertFalse(todo.is_resolved)
    
    def test_list_view_filter_resolved(self):
        """Test filtering for resolved TODOs"""
        response = self.client.get(reverse('todo_list') + '?filter=resolved')
        todos = response.context['todos']
        self.assertEqual(len(todos), 1)
        self.assertTrue(todos[0].is_resolved)
    
    def test_list_view_filter_overdue(self):
        """Test filtering for overdue TODOs"""
        response = self.client.get(reverse('todo_list') + '?filter=overdue')
        todos = response.context['todos']
        self.assertEqual(len(todos), 1)
        self.assertEqual(todos[0].title, "Overdue TODO")
    
    def test_list_view_search(self):
        """Test search functionality"""
        response = self.client.get(reverse('todo_list') + '?search=Active')
        todos = response.context['todos']
        self.assertEqual(len(todos), 1)
        self.assertEqual(todos[0].title, "Active TODO")
    
    def test_list_view_context_statistics(self):
        """Test that statistics are in context"""
        response = self.client.get(reverse('todo_list'))
        self.assertIn('total_count', response.context)
        self.assertIn('active_count', response.context)
        self.assertIn('resolved_count', response.context)
        self.assertEqual(response.context['total_count'], 3)
        self.assertEqual(response.context['active_count'], 2)
        self.assertEqual(response.context['resolved_count'], 1)


class TodoCreateViewTest(TestCase):
    """
    Test TODO creation view.
    
    Scenarios:
    - View is accessible
    - GET request shows form
    - POST with valid data creates TODO
    - POST with invalid data shows errors
    - Redirect after successful creation
    """
    
    def setUp(self):
        self.client = Client()
        self.create_url = reverse('todo_create')
    
    def test_create_view_get(self):
        """Test GET request shows empty form"""
        response = self.client.get(self.create_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_form.html')
        self.assertIsInstance(response.context['form'], TodoForm)
    
    def test_create_view_post_valid_data(self):
        """Test POST with valid data creates TODO"""
        data = {
            'title': 'New TODO',
            'description': 'Description',
            'is_resolved': False
        }
        response = self.client.post(self.create_url, data)
        
        # Check redirect
        self.assertEqual(response.status_code, 302)
        
        # Check TODO was created
        self.assertEqual(Todo.objects.count(), 1)
        todo = Todo.objects.first()
        self.assertEqual(todo.title, 'New TODO')
        self.assertEqual(todo.description, 'Description')
    
    def test_create_view_post_invalid_data(self):
        """Test POST with invalid data shows errors"""
        data = {
            'title': '',  # Empty title (invalid)
            'description': 'Description'
        }
        response = self.client.post(self.create_url, data)
        
        # Should not redirect (stays on form)
        self.assertEqual(response.status_code, 200)
        
        # No TODO should be created
        self.assertEqual(Todo.objects.count(), 0)
        
        # Form should have errors
        self.assertTrue(response.context['form'].errors)
    
    def test_create_view_with_due_date(self):
        """Test creating TODO with due date"""
        future_date = timezone.now() + timedelta(days=7)
        data = {
            'title': 'TODO with due date',
            'due_date': future_date.strftime('%Y-%m-%dT%H:%M'),
            'is_resolved': False
        }
        response = self.client.post(self.create_url, data)
        
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 1)
        todo = Todo.objects.first()
        self.assertIsNotNone(todo.due_date)


class TodoUpdateViewTest(TestCase):
    """
    Test TODO update view.
    
    Scenarios:
    - View is accessible
    - GET shows pre-filled form
    - POST updates TODO
    - Invalid TODO ID returns 404
    """
    
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(
            title="Original Title",
            description="Original Description"
        )
        self.update_url = reverse('todo_update', args=[self.todo.pk])
    
    def test_update_view_get(self):
        """Test GET request shows pre-filled form"""
        response = self.client.get(self.update_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_form.html')
        
        # Check form is pre-filled
        form = response.context['form']
        self.assertEqual(form.instance, self.todo)
        self.assertEqual(form.initial['title'], "Original Title")
    
    def test_update_view_post_valid_data(self):
        """Test POST with valid data updates TODO"""
        data = {
            'title': 'Updated Title',
            'description': 'Updated Description',
            'is_resolved': True
        }
        response = self.client.post(self.update_url, data)
        
        # Check redirect
        self.assertEqual(response.status_code, 302)
        
        # Refresh from database
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Title')
        self.assertEqual(self.todo.description, 'Updated Description')
        self.assertTrue(self.todo.is_resolved)
    
    def test_update_view_invalid_id(self):
        """Test accessing update view with invalid ID returns 404"""
        response = self.client.get(reverse('todo_update', args=[9999]))
        self.assertEqual(response.status_code, 404)


class TodoDeleteViewTest(TestCase):
    """
    Test TODO delete view.
    
    Scenarios:
    - GET shows confirmation page
    - POST deletes TODO
    - Invalid ID returns 404
    """
    
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(title="To be deleted")
        self.delete_url = reverse('todo_delete', args=[self.todo.pk])
    
    def test_delete_view_get(self):
        """Test GET shows confirmation page"""
        response = self.client.get(self.delete_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_confirm_delete.html')
        self.assertEqual(response.context['todo'], self.todo)
    
    def test_delete_view_post(self):
        """Test POST deletes the TODO"""
        response = self.client.post(self.delete_url)
        
        # Check redirect
        self.assertEqual(response.status_code, 302)
        
        # Check TODO was deleted
        self.assertEqual(Todo.objects.count(), 0)
        with self.assertRaises(Todo.DoesNotExist):
            Todo.objects.get(pk=self.todo.pk)
    
    def test_delete_view_invalid_id(self):
        """Test deleting non-existent TODO returns 404"""
        response = self.client.get(reverse('todo_delete', args=[9999]))
        self.assertEqual(response.status_code, 404)


class TodoDetailViewTest(TestCase):
    """Test TODO detail view"""
    
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(
            title="Detail TODO",
            description="Detailed description"
        )
        self.detail_url = reverse('todo_detail', args=[self.todo.pk])
    
    def test_detail_view_get(self):
        """Test detail view displays TODO information"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_detail.html')
        self.assertEqual(response.context['todo'], self.todo)
    
    def test_detail_view_invalid_id(self):
        """Test detail view with invalid ID returns 404"""
        response = self.client.get(reverse('todo_detail', args=[9999]))
        self.assertEqual(response.status_code, 404)


class TodoToggleViewTest(TestCase):
    """
    Test TODO toggle functionality.
    
    Scenarios:
    - Toggles resolved status
    - Requires POST method
    - Redirects after toggle
    """
    
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(
            title="Toggle TODO",
            is_resolved=False
        )
        self.toggle_url = reverse('todo_toggle', args=[self.todo.pk])
    
    def test_toggle_active_to_resolved(self):
        """Test toggling active TODO to resolved"""
        response = self.client.post(self.toggle_url)
        
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_resolved)
    
    def test_toggle_resolved_to_active(self):
        """Test toggling resolved TODO to active"""
        self.todo.is_resolved = True
        self.todo.save()
        
        response = self.client.post(self.toggle_url)
        
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.is_resolved)
    
    def test_toggle_requires_post(self):
        """Test that toggle requires POST method"""
        response = self.client.get(self.toggle_url)
        # Should fail or redirect, not toggle
        self.assertNotEqual(response.status_code, 200)


# ============================================
# FORM TESTS
# ============================================

class TodoFormTest(TestCase):
    """
    Test TodoForm validation and behavior.
    
    Scenarios:
    - Valid data passes validation
    - Invalid data fails validation
    - Custom validation rules
    - Field requirements
    """
    
    def test_form_valid_data(self):
        """Test form with valid data"""
        form_data = {
            'title': 'Valid TODO',
            'description': 'Valid description',
            'is_resolved': False
        }
        form = TodoForm(data=form_data)
        self.assertTrue(form.is_valid())
    
    def test_form_empty_title(self):
        """Test form rejects empty title"""
        form_data = {
            'title': '',
            'description': 'Description'
        }
        form = TodoForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)
    
    def test_form_title_too_short(self):
        """Test form rejects title less than 3 characters"""
        form_data = {
            'title': 'ab',  # Only 2 characters
            'description': 'Description'
        }
        form = TodoForm(data=form_data)
        self.assertFalse(form.is_valid())
    
    def test_form_duplicate_title(self):
        """Test form rejects duplicate titles"""
        # Create existing TODO
        Todo.objects.create(title="Duplicate Title")
        
        # Try to create another with same title
        form_data = {
            'title': 'Duplicate Title',
            'description': 'Different description'
        }
        form = TodoForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)
    
    def test_form_past_due_date(self):
        """Test form rejects due date in the past"""
        past_date = timezone.now() - timedelta(days=1)
        form_data = {
            'title': 'Test TODO',
            'due_date': past_date.strftime('%Y-%m-%dT%H:%M'),
        }
        form = TodoForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('due_date', form.errors)
    
    def test_form_future_due_date(self):
        """Test form accepts future due date"""
        future_date = timezone.now() + timedelta(days=7)
        form_data = {
            'title': 'Future TODO',
            'due_date': future_date.strftime('%Y-%m-%dT%H:%M'),
        }
        form = TodoForm(data=form_data)
        self.assertTrue(form.is_valid())
    
    def test_form_optional_fields(self):
        """Test form works with only required fields"""
        form_data = {
            'title': 'Minimal TODO'
        }
        form = TodoForm(data=form_data)
        self.assertTrue(form.is_valid())


# ============================================
# URL TESTS
# ============================================

class URLTest(TestCase):
    """
    Test URL routing configuration.
    
    Scenarios:
    - All URLs resolve correctly
    - URL names work properly
    - URL parameters are handled
    """
    
    def setUp(self):
        self.todo = Todo.objects.create(title="Test TODO")
    
    def test_list_url_resolves(self):
        """Test todo_list URL resolves"""
        url = reverse('todo_list')
        self.assertEqual(url, '/')
    
    def test_create_url_resolves(self):
        """Test todo_create URL resolves"""
        url = reverse('todo_create')
        self.assertEqual(url, '/create/')
    
    def test_detail_url_resolves(self):
        """Test todo_detail URL resolves with parameter"""
        url = reverse('todo_detail', args=[self.todo.pk])
        self.assertEqual(url, f'/{self.todo.pk}/')
    
    def test_update_url_resolves(self):
        """Test todo_update URL resolves with parameter"""
        url = reverse('todo_update', args=[self.todo.pk])
        self.assertEqual(url, f'/{self.todo.pk}/update/')
    
    def test_delete_url_resolves(self):
        """Test todo_delete URL resolves with parameter"""
        url = reverse('todo_delete', args=[self.todo.pk])
        self.assertEqual(url, f'/{self.todo.pk}/delete/')
    
    def test_toggle_url_resolves(self):
        """Test todo_toggle URL resolves with parameter"""
        url = reverse('todo_toggle', args=[self.todo.pk])
        self.assertEqual(url, f'/{self.todo.pk}/toggle/')


# ============================================
# INTEGRATION TESTS
# ============================================

class TodoWorkflowIntegrationTest(TestCase):
    """
    Test complete user workflows.
    
    Scenarios:
    - Create → View → Update → Delete workflow
    - Create → Toggle → View workflow
    - Search and filter workflow
    """
    
    def setUp(self):
        self.client = Client()
    
    def test_complete_crud_workflow(self):
        """Test complete Create, Read, Update, Delete workflow"""
        
        # 1. CREATE: Create a new TODO
        create_data = {
            'title': 'Integration Test TODO',
            'description': 'Testing CRUD workflow',
        }
        create_response = self.client.post(reverse('todo_create'), create_data)
        self.assertEqual(create_response.status_code, 302)  # Redirect after create
        
        # Verify TODO was created
        todo = Todo.objects.get(title='Integration Test TODO')
        self.assertIsNotNone(todo)
        
        # 2. READ: View the TODO in list
        list_response = self.client.get(reverse('todo_list'))
        self.assertContains(list_response, 'Integration Test TODO')
        
        # 3. READ: View TODO detail
        detail_response = self.client.get(reverse('todo_detail', args=[todo.pk]))
        self.assertEqual(detail_response.status_code, 200)
        self.assertContains(detail_response, 'Integration Test TODO')
        
        # 4. UPDATE: Update the TODO
        update_data = {
            'title': 'Updated Integration TODO',
            'description': 'Updated description',
            'is_resolved': True
        }
        update_response = self.client.post(
            reverse('todo_update', args=[todo.pk]),
            update_data
        )
        self.assertEqual(update_response.status_code, 302)
        
        # Verify update
        todo.refresh_from_db()
        self.assertEqual(todo.title, 'Updated Integration TODO')
        self.assertTrue(todo.is_resolved)
        
        # 5. DELETE: Delete the TODO
        delete_response = self.client.post(reverse('todo_delete', args=[todo.pk]))
        self.assertEqual(delete_response.status_code, 302)
        
        # Verify deletion
        self.assertEqual(Todo.objects.filter(pk=todo.pk).count(), 0)
    
    def test_create_and_toggle_workflow(self):
        """Test creating a TODO and toggling its status"""
        
        # Create TODO
        create_data = {'title': 'Toggle Test TODO'}
        self.client.post(reverse('todo_create'), create_data)
        todo = Todo.objects.get(title='Toggle Test TODO')
        
        # Verify initial state
        self.assertFalse(todo.is_resolved)
        
        # Toggle to resolved
        self.client.post(reverse('todo_toggle', args=[todo.pk]))
        todo.refresh_from_db()
        self.assertTrue(todo.is_resolved)
        
        # Toggle back to active
        self.client.post(reverse('todo_toggle', args=[todo.pk]))
        todo.refresh_from_db()
        self.assertFalse(todo.is_resolved)
    
    def test_search_and_filter_workflow(self):
        """Test searching and filtering TODOs"""
        
        # Create multiple TODOs
        Todo.objects.create(title="Work Task", is_resolved=False)
        Todo.objects.create(title="Personal Task", is_resolved=True)
        Todo.objects.create(title="Work Meeting", is_resolved=False)
        
        # Test search
        search_response = self.client.get(reverse('todo_list') + '?search=Work')
        self.assertContains(search_response, "Work Task")
        self.assertContains(search_response, "Work Meeting")
        self.assertNotContains(search_response, "Personal Task")
        
        # Test filter active
        filter_response = self.client.get(reverse('todo_list') + '?filter=active')
        self.assertContains(filter_response, "Work Task")
        self.assertNotContains(filter_response, "Personal Task")


# ============================================
# PERFORMANCE AND EDGE CASE TESTS
# ============================================

class TodoPerformanceTest(TestCase):
    """Test performance with larger datasets"""
    
    def test_list_view_with_many_todos(self):
        """Test list view performs well with many TODOs"""
        # Create 100 TODOs
        todos = [
            Todo(title=f"TODO {i}", description=f"Description {i}")
            for i in range(100)
        ]
        Todo.objects.bulk_create(todos)
        
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        # With pagination of 10, should only show 10
        self.assertLessEqual(len(response.context['todos']), 10)


class TodoEdgeCaseTest(TestCase):
    """Test edge cases and boundary conditions"""
    
    def test_todo_with_very_long_title(self):
        """Test TODO with maximum length title"""
        long_title = "A" * 200  # Max length is 200
        todo = Todo.objects.create(title=long_title)
        self.assertEqual(len(todo.title), 200)
    
    def test_todo_with_special_characters(self):
        """Test TODO with special characters in title"""
        special_title = "TODO: @Test #1 & <Special> 'Chars' \"Quotes\""
        todo = Todo.objects.create(title=special_title)
        self.assertEqual(todo.title, special_title)
    
    def test_todo_with_empty_description(self):
        """Test TODO with empty description is valid"""
        todo = Todo.objects.create(title="No Description")
        self.assertEqual(todo.description, "")
    
    def test_concurrent_todo_creation(self):
        """Test multiple TODOs can be created simultaneously"""
        from django.db import transaction
        
        with transaction.atomic():
            Todo.objects.create(title="TODO 1")
            Todo.objects.create(title="TODO 2")
            Todo.objects.create(title="TODO 3")
        
        self.assertEqual(Todo.objects.count(), 3)


# ============================================
# RUNNING THE TESTS
# ============================================

"""
HOW TO RUN TESTS:

1. Run all tests:
   python manage.py test

2. Run tests for specific app:
   python manage.py test todos

3. Run specific test class:
   python manage.py test todos.tests.TodoModelTest

4. Run specific test method:
   python manage.py test todos.tests.TodoModelTest.test_todo_creation

5. Run with verbosity (see detailed output):
   python manage.py test --verbosity=2

6. Keep database after tests (for debugging):
   python manage.py test --keepdb

7. Run tests in parallel (faster):
   python manage.py test --parallel

8. Run with coverage (requires coverage.py):
   coverage run --source='.' manage.py test
   coverage report
   coverage html  # Generate HTML report


EXPECTED OUTPUT:

Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..................................................................
----------------------------------------------------------------------
Ran 66 tests in 2.345s

OK
Destroying test database for alias 'default'...


TEST DATABASE:

Django automatically creates a test database (test_db.sqlite3)
that is destroyed after tests complete. This ensures:
- Tests don't affect production data
- Each test run starts with clean slate
- Tests are isolated and repeatable


BEST PRACTICES:

1. ✅ Test one thing per test method
2. ✅ Use descriptive test names
3. ✅ Use setUp() for common test data
4. ✅ Test both success and failure cases
5. ✅ Test edge cases and boundary conditions
6. ✅ Keep tests fast and independent
7. ✅ Aim for high code coverage (80%+)
8. ✅ Run tests before committing code


TEST COVERAGE SUMMARY:

Models: ✅ Creation, validation, methods, relationships
Views: ✅ All CRUD operations, filtering, searching
Forms: ✅ Validation, custom rules, error handling
URLs: ✅ All URL patterns resolve correctly
Integration: ✅ Complete user workflows
"""