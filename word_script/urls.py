from django.contrib import admin
from django.urls import path, include
from main import views
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home),
    path('api/tech_conclusion/', views.ObjectViewSet.as_view()),
    path('download_file/', views.save_file)
]