# Generated by Django 5.1.6 on 2025-03-08 11:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('thakedar', '0004_auto_20250301_0409'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sarmikaacc',
            name='owner',
        ),
    ]
