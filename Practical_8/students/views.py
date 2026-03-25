from django.shortcuts import render, redirect
from django.contrib import messages
from mongoengine.errors import NotUniqueError, DoesNotExist
from mongoengine import Q
from .models import Student
from .forms import StudentForm
from bson.objectid import ObjectId


def index(request):
    q = request.GET.get('q', '')
    try:
        if q:
            students = Student.objects(
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(email__icontains=q) |
                Q(department__icontains=q)
            )
        else:
            students = Student.objects.all()
        students = list(students.order_by('-_id'))
    except Exception as e:
        messages.error(request, f"Error fetching students: {str(e)}")
        students = []
    return render(request, 'students/student_list.html', {'students': students, 'q': q})


def create_student(request):
    form = StudentForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        try:
            form.save()
            messages.success(request, 'Student created successfully.')
            return redirect('students:index')
        except NotUniqueError:
            messages.error(request, 'Email already exists.')
        except Exception as e:
            messages.error(request, f"Error saving student: {str(e)}")
    return render(request, 'students/student_form.html', {'form': form, 'title': 'Add Student'})


def update_student(request, pk):
    try:
        student = Student.objects.get(id=ObjectId(pk))
    except (DoesNotExist, Exception):
        messages.error(request, 'Student not found.')
        return redirect('students:index')
    
    form = StudentForm(request.POST or None)
    if request.method == 'GET':
        form.populate_from_instance(student)
    elif request.method == 'POST' and form.is_valid():
        try:
            form.save(instance=student)
            messages.success(request, 'Student updated successfully.')
            return redirect('students:index')
        except NotUniqueError:
            messages.error(request, 'Email already exists.')
        except Exception as e:
            messages.error(request, f"Error updating student: {str(e)}")
    return render(request, 'students/student_form.html', {'form': form, 'title': 'Edit Student', 'student': student})


def delete_student(request, pk):
    try:
        student = Student.objects.get(id=ObjectId(pk))
    except (DoesNotExist, Exception):
        messages.error(request, 'Student not found.')
        return redirect('students:index')
    
    if request.method == 'POST':
        try:
            student.delete()
            messages.success(request, 'Student deleted successfully.')
            return redirect('students:index')
        except Exception as e:
            messages.error(request, f"Error deleting student: {str(e)}")
    return render(request, 'students/student_confirm_delete.html', {'student': student})
