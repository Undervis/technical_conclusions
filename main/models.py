from django.db import models
from rest_framework.serializers import ModelSerializer


class TechnicalConclusion(models.Model):
    # Данные о техническом заключении
    tc_id = models.CharField("Номер заключения", max_length=32, primary_key=True)
    tc_date = models.DateField("Дата заключения")
    tc_organisation = models.CharField("Организация", max_length=96)

    # Данные об объекте
    object_name = models.CharField("Наименование объекта", max_length=96)
    object_inventory_id = models.CharField("Инвентарный номер", max_length=64)
    object_creation_id = models.CharField("Заводской номер", max_length=64, blank=True)
    object_creation_year = models.CharField("Год выпуска", max_length=16, blank=True)
    object_start_using = models.CharField("Дата ввода в эксплуатацию", max_length=16, blank=True)
    object_fix_count = models.CharField("Количество ремонтов", max_length=128)

    # Результаты обследования
    object_troubles = models.TextField("Выявленные неисправности")
    object_reason = models.TextField("Причина списания")
    object_reuse_info = models.TextField("Возможное использование объекта")
    object_reuse_mats_info = models.TextField("Возможное использование материалов объекта")
    object_metals_info = models.TextField("Наличие металлов")
    object_danger_info = models.TextField("Наличие опасных элементов")
    object_conclusion = models.TextField("Заключение")

    def __str__(self):
        return self.object_name


class ObjectSerial(ModelSerializer):
    class Meta:
        model = TechnicalConclusion
        fields = '__all__'

    def create(self, validated_data):
        return TechnicalConclusion(**validated_data)

    def update(self, instance, validated_data):
        instance.save()
        return instance
