# Generated by Django 2.0.1 on 2018-01-23 16:49

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('gather', '0002_project'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='project_id',
            field=models.UUIDField(default=uuid.uuid4),
        ),
    ]
