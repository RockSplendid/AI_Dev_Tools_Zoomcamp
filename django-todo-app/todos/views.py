from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.urls import reverse_lazy
from django.contrib import messages
from django.db.models import Q, Count
from django.utils import timezone
from django.views.decorators.http import require_POST
from .models import Todo, Category, Tag
from .forms import TodoForm


class TodoListView(ListView):
    model = Todo
    template_name = 'todos/todo_list.html'
    context_object_name = 'todos'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        filter_type = self.request.GET.get('filter', 'all')
        
        if filter_type == 'active':
            queryset = queryset.filter(is_resolved=False)
        elif filter_type == 'resolved':
            queryset = queryset.filter(is_resolved=True)
        elif filter_type == 'overdue':
            queryset = queryset.filter(
                is_resolved=False,
                due_date__lt=timezone.now()
            )
        
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        sort_by = self.request.GET.get('sort', '-created_at')
        queryset = queryset.order_by(sort_by)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        context['total_count'] = Todo.objects.count()
        context['active_count'] = Todo.objects.filter(is_resolved=False).count()
        context['resolved_count'] = Todo.objects.filter(is_resolved=True).count()
        context['overdue_count'] = Todo.objects.filter(
            is_resolved=False,
            due_date__lt=timezone.now()
        ).count()
        
        context['categories'] = Category.objects.annotate(
            todo_count=Count('todos')
        )
        
        context['filter_type'] = self.request.GET.get('filter', 'all')
        context['search_query'] = self.request.GET.get('search', '')
        context['current_sort'] = self.request.GET.get('sort', '-created_at')
        
        return context


class TodoDetailView(DetailView):
    model = Todo
    template_name = 'todos/todo_detail.html'
    context_object_name = 'todo'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_overdue'] = self.object.is_overdue()
        return context


class TodoCreateView(CreateView):
    model = Todo
    form_class = TodoForm
    template_name = 'todos/todo_form.html'
    success_url = reverse_lazy('todo_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            f'TODO "{self.object.title}" created successfully!'
        )
        return response
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['action'] = 'Create'
        return context


class TodoUpdateView(UpdateView):
    model = Todo
    form_class = TodoForm
    template_name = 'todos/todo_form.html'
    success_url = reverse_lazy('todo_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            f'TODO "{self.object.title}" updated successfully!'
        )
        return response
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['action'] = 'Update'
        context['todo'] = self.object
        return context


class TodoDeleteView(DeleteView):
    model = Todo
    template_name = 'todos/todo_confirm_delete.html'
    success_url = reverse_lazy('todo_list')
    context_object_name = 'todo'
    
    def delete(self, request, *args, **kwargs):
        todo = self.get_object()
        messages.success(request, f'TODO "{todo.title}" deleted successfully!')
        return super().delete(request, *args, **kwargs)


@require_POST
def todo_toggle(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save()
    
    status = "resolved" if todo.is_resolved else "reopened"
    messages.success(request, f'TODO "{todo.title}" {status}!')
    
    return redirect('todo_list')
