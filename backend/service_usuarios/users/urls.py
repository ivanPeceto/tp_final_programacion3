
from django.contrib import admin
from django.urls import path
from apps.usuarios.views import UserLoginView, UserSignUpView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    ##NO USADO - BORRAR DESPUES##
    #path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('signup/', UserSignUpView.as_view(), name='signup'),
]

