from django.forms import ModelForm
from django.contrib.auth import get_user_model


class UserForm(ModelForm):
    class Meta:
        model = get_user_model()
        fields = ("username", "first_name", "last_name", "language")
