
from django.contrib import admin
from django.urls import path
from apps.usuarios.views import UserLoginView, UserSignUpView

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('signup/', UserSignUpView.as_view(), name='signup'),
]

