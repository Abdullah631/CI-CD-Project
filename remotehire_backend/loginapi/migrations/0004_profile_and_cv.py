# Generated migration file - Add profile fields to User model and requirements to Job model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loginapi', '0003_application'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='full_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='user',
            name='cv',
            field=models.FileField(blank=True, null=True, upload_to='resumes/'),
        ),
        migrations.AddField(
            model_name='user',
            name='cv_metadata',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='user',
            name='cv_last_updated',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='job',
            name='requirements',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='application',
            name='similarity_score',
            field=models.FloatField(default=0.0),
        ),
    ]
