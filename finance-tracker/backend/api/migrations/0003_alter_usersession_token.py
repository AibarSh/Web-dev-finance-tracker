# Generated by Django 5.1.7 on 2025-04-24 13:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_asset_goal_goaltransaction_remove_block_page_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usersession',
            name='token',
            field=models.CharField(max_length=500),
        ),
    ]
