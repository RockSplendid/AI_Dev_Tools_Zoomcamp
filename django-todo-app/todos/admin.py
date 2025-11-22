from django.contrib import admin
from .models import Todo, Category, Tag


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'due_date', 'is_resolved', 'created_at']
    list_filter = ['is_resolved', 'category', 'created_at']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description')
        }),
        ('Details', {
            'fields': ('category', 'tags', 'due_date', 'is_resolved')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['tags']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'created_at']
    search_fields = ['name']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
