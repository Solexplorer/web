# Generated by Django 2.2.4 on 2020-05-13 03:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0107_auto_20200512_0022'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='max_num_issues_start_work',
            field=models.IntegerField(default=5),
        ),
    ]
