from django.db import models

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    photo = models.ImageField(upload_to='photos/')

    def __str__(self):
        return self.username
