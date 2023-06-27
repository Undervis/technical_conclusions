import os.path
from wsgiref.util import FileWrapper
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from docxtpl import DocxTemplate
from .models import *
from word_script.settings import BASE_DIR


def home(request):
    return render(request, 'base.html')


# Сохранение файла на стороне сервера
def save_file(request):
    # Список месяцев для подставления на место даты
    months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
              "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"]
    # указание ссылки к шаблону
    doc_dir = os.path.join(BASE_DIR / "static/TechnicalConclusion_Template.docx")
    doc = DocxTemplate(doc_dir)
    if request.GET:
        # обработка данных с сайта
        data = request.GET.dict()
        year, month, day = str(data['tc_date']).split(sep="-")
        data['tc_date'] = f'{day} "{months[int(month)]}" {year} .г'
        # вставка данных в шаблон
        doc.render(data)
        file_name = f"{data['tc_id']} - {data['object_name']}.docx"
        new_doc_dir = os.path.join(BASE_DIR / "media" / file_name)
        # сохранение файла
        doc.save(new_doc_dir)
        file = open(new_doc_dir, "rb")
        # передача файла в виде набора байтов
        response = HttpResponse(FileWrapper(file), content_type="application/force-download")
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'
        return response
    else:
        return HttpResponse({'status': 'error: Query is empty'}, status=status.HTTP_400_BAD_REQUEST)


# Взаимодействие с моделью базы данных
class ObjectViewSet(APIView):
    # Получения списка записей
    def get(self, request):
        tc = TechnicalConclusion.objects.all()
        serializer = ObjectSerial(tc, many=True)
        return Response(serializer.data)

    # Обработка POST запроса для сохранения записи в базу данных
    def post(self, request):
        data = request.data
        for v in list(data.dict().values()):
            if v == '':
                return Response(data={"status": 'error: Some fields are empty'}, status=status.HTTP_400_BAD_REQUEST)
        obj = TechnicalConclusion.objects.filter(pk=data['tc_id'])
        if len(obj) == 1:
            obj.update(**data.dict())
            return Response(data={"status": 'updated'}, status=status.HTTP_200_OK)
        else:
            TechnicalConclusion.objects.create(**data.dict())
            return Response(data={"status": 'created'}, status=status.HTTP_201_CREATED)

    # Обработка DELETE запроса
    def delete(self, request):
        try:
            tc_id = self.request.query_params.get('tc_id')
            obj = TechnicalConclusion.objects.filter(pk=tc_id)
            if len(obj) == 1:
                obj.delete()
                return Response(data={"status": 'deleted'}, status=status.HTTP_200_OK)
            else:
                return Response(data={"status": f'error: Object with ID {tc_id} is not found'},
                                status=status.HTTP_404_NOT_FOUND)
        except KeyError:
            return Response(data={"status": 'error: ID field is empty'}, status=status.HTTP_400_BAD_REQUEST)
