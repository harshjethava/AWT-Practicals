from django.urls import path
from . import views

app_name = 'students'

urlpatterns = [
    path('', views.index, name='index'),
    path('add/', views.create_student, name='add_student'),
    path('edit/<str:pk>/', views.update_student, name='edit_student'),
    path('delete/<str:pk>/', views.delete_student, name='delete_student'),
]
