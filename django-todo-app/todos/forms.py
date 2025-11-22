from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Todo, Category, Tag


class TodoForm(forms.ModelForm):
    class Meta:
        model = Todo
        fields = ['title', 'description', 'due_date', 'category', 'tags', 'is_resolved']
        
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter TODO title',
                'required': True
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Enter description (optional)'
            }),
            'due_date': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local'
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            }),
            'tags': forms.CheckboxSelectMultiple(),
            'is_resolved': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].required = False
        self.fields['category'].empty_label = "-- No Category --"
        self.fields['tags'].required = False
    
    def clean_title(self):
        title = self.cleaned_data.get('title', '').strip()
        
        if not title:
            raise ValidationError('Title cannot be empty.')
        
        if len(title) < 3:
            raise ValidationError('Title must be at least 3 characters long.')
        
        existing = Todo.objects.filter(title__iexact=title)
        if self.instance.pk:
            existing = existing.exclude(pk=self.instance.pk)
        
        if existing.exists():
            raise ValidationError('A TODO with this title already exists.')
        
        return title
    
    def clean_due_date(self):
        due_date = self.cleaned_data.get('due_date')
        
        if due_date and due_date < timezone.now():
            raise ValidationError('Due date cannot be in the past.')
        
        return due_date
