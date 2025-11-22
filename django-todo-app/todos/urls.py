from django.urls import path
from . import views

urlpatterns = [
    path('', views.TodoListView.as_view(), name='todo_list'),
    path('create/', views.TodoCreateView.as_view(), name='todo_create'),
    path('<int:pk>/', views.TodoDetailView.as_view(), name='todo_detail'),
    path('<int:pk>/update/', views.TodoUpdateView.as_view(), name='todo_update'),
    path('<int:pk>/delete/', views.TodoDeleteView.as_view(), name='todo_delete'),
    path('<int:pk>/toggle/', views.todo_toggle, name='todo_toggle'),
]
