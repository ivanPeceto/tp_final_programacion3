# Generated by Django 5.2.1 on 2025-05-29 18:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('pedidos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PedidoProductos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('id_producto', models.IntegerField(db_column='id_producto')),
                ('cantidad_producto', models.DecimalField(db_column='cantidad_producto', decimal_places=2, max_digits=3)),
                ('nombre_producto', models.CharField(db_column='nombre_producto', max_length=100)),
                ('id_pedido', models.ForeignKey(db_column='id_pedido', on_delete=django.db.models.deletion.CASCADE, to='pedidos.pedido')),
            ],
        ),
    ]
