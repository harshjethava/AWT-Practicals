from django import forms
from .models import Student

class StudentForm(forms.Form):
    first_name = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}))
    last_name = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}))
    age = forms.IntegerField(widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Age'}))
    department = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Department'}))

    def save(self, instance=None):
        data = self.cleaned_data
        if instance:
            instance.first_name = data['first_name']
            instance.last_name = data['last_name']
            instance.email = data['email']
            instance.age = data['age']
            instance.department = data['department']
            instance.save()
            return instance
        else:
            student = Student(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                age=data['age'],
                department=data['department']
            )
            student.save()
            return student

    def populate_from_instance(self, instance):
        if instance:
            self.fields['first_name'].initial = instance.first_name
            self.fields['last_name'].initial = instance.last_name
            self.fields['email'].initial = instance.email
            self.fields['age'].initial = instance.age
            self.fields['department'].initial = instance.department
