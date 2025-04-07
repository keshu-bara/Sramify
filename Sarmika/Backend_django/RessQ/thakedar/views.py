from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Thakedar,Sarmika,SarmikaVerify,ThakedarVerify
from .serializers import ThakedarSerializer,SarmikaSerializer,ThakedarAccSerializer,SarmikaAccSerializer,ThakedarAccSerializer,SarmikaAccSerializer,SarmikaVerifySerializer,ThakedarVerifySerializer
from rest_framework import status
from rest_framework.generics import get_object_or_404




# Create your views here.

@api_view(['GET','POST','PUT','DELETE','PATCH'])
def thakedar(request):
    if request.method == 'GET':
        obj = Thakedar.objects.all()
        serializer = ThakedarSerializer(obj,many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data
        serializer = ThakedarSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    elif request.method == 'PUT':
        data = request.data
        serializer = ThakedarSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    elif request.method == 'PATCH':
        data = request.data
        obj = Thakedar.objects.get(id = data['id'])
        serializer = ThakedarSerializer(obj,data = data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    else:
        data = request.data
        obj = Thakedar.objects.get(id = data['id'])
        obj.delete()
        return Response({'msg':'Data Deleted'})


@api_view(['GET','POST','PUT','DELETE','PATCH'])
def sarmika(request,id):
    if request.method == 'GET':
        obj = Sarmika.objects.filter(tid = id)
        serializer = SarmikaSerializer(obj,many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data
        data['tid'] = id
        serializer = SarmikaSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    elif request.method == 'PUT':
        data = request.data
        serializer = SarmikaSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    elif request.method == 'PATCH':
        data = request.data
        obj = Sarmika.objects.get(id = data['id'])
        serializer = SarmikaSerializer(obj,data = data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    else:
        data = request.data
        obj = Sarmika.objects.get(id = data['id'])
        obj.delete()
        return Response({'msg':'Data Deleted'})
    

    
@api_view(['GET','POST'])
def SarmikaAcc(request,id):
    if request.method == 'GET':
        obj = Sarmika.objects.filter(owner__id = id)
        serializer = SarmikaAccSerializer(obj,many=True)
        print("This is the data")
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data
        data['owner'] = id
        serializer = SarmikaSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    

@api_view(['GET','POST'])    
def ThakedarAcc(request,id):
    if request.method == 'GET':
        obj = Thakedar.objects.filter(tid = id)
        serializer = ThakedarAccSerializer(obj,many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data
        data['tid'] = id
        serializer = ThakedarSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
# Compare this snippet from RessQ/thakedar/urls.py:
# Compare this snippet from RessQ/thakedar/views.py:

@api_view(['GET', 'POST'])
def sermika_verify_api(request,id):
    # Handle GET request
    if request.method == 'GET':
        verifications = SarmikaVerify.objects.filter(owner__id = id)
        serializer = SarmikaVerifySerializer(verifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Handle POST request
    elif request.method == 'POST':
        data = request.data
        data['owner__id'] = id
        serializer = SarmikaVerifySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def thakedar_verify_api(request,id):
    # Handle GET request
    if request.method == 'GET':
        verifications = ThakedarVerify.objects.filter(tid = id)
        serializer = ThakedarVerifySerializer(verifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Handle POST request
    elif request.method == 'POST':
        data = request.data
        data['tid'] = id
        
        serializer = ThakedarVerifySerializer(data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        

 
      



