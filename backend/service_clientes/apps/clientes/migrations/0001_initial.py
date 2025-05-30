# Generated by Django 4.2 on 2025-05-16 21:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.AutoField(db_column='id_cliente', primary_key=True, serialize=False)),
                ('nombre', models.CharField(db_column='nombre_cliente', max_length=100)),
                ('telefono', models.CharField(db_column='telefono_cliente', max_length=20)),
                ('direccion', models.TextField(db_column='direccion_cliente')),
                ('email', models.EmailField(db_column='email_cliente', max_length=100)),
            ],
            options={
                'db_table': 'cliente',
            },
        ),
    ]
