# Generated by Django 2.1.2 on 2018-10-16 12:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gather', '0006_usertokens_couchdb_sync_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='survey',
            name='family',
            field=models.TextField(default='gather', help_text='This schema family englobes all the schemas autogenerated by this project.', verbose_name='Schema family'),
        ),
    ]
