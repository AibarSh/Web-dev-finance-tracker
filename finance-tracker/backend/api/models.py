from django.db import models
from django.contrib.auth.models import User

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name="workspaces")

class Page(models.Model):
    title = models.CharField(max_length=255)
    workspace = models.ForeignKey(Workspace,on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Block(models.Model):
    TEXT = 'text'
    IMAGE = 'image'
    BLOCK_TYPES = [(TEXT, 'Text'), (IMAGE, 'Image')]

    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='blocks')
    type = models.CharField(max_length=10, choices=BLOCK_TYPES, default=TEXT)
    content = models.TextField(blank=True, null=True)
    order = models.IntegerField()