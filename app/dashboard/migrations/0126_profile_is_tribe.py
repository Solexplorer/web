# Generated by Django 2.2.4 on 2020-07-08 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0125_auto_20200630_1304'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='is_tribe',
            field=models.BooleanField(default=False, help_text='Is this profile a Tribe (only applies to orgs)?'),
        ),
    ]
