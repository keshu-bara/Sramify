from rest_framework import serializers
from .models import Thakedar,Sarmika,ThakedarAcc,SarmikaAcc,SarmikaVerify,ThakedarVerify


class ThakedarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thakedar
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},  # Example: Keep 'name' mandatory
            'email': {'required': False},  # Example: Make 'age' optional
            'address': {'required': False},  # Example: Make 'address' optional
            'verification': {'required': True},  # Example: Make 'verification' optional
            
        }
    
    def validate(self,data):
        special_c = "!@#$%^&*()_+-=|\\/'?.>,<;:/"
        if any(c in special_c for c in data['name']):
            raise serializers.ValidationError('Name Should Not contain Specail Char')
        if data['age'] < 18:
            raise serializers.ValidationError("Age should be greator than 18")
        return data

class SarmikaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sarmika
        fields = '__all__'

    def validate(self,data):
        special_c = "!@#$%^&*()_+-=|\\/'?.>,<;:/"
        if any(c in special_c for c in data['name']):
            raise serializers.ValidationError('Name Should Not contain Specail Char')
        if data['age'] < 18:
            raise serializers.ValidationError("Age should be greator than 18")
        return data
    
class ThakedarAccSerializer(serializers.ModelSerializer):

    class Meta:
        model = ThakedarAcc
        fields = '__all__'
class SarmikaAccSerializer(serializers.ModelSerializer):

    class Meta:
        model = SarmikaAcc
        fields = '__all__'

class SarmikaVerifySerializer(serializers.ModelSerializer):
    class Meta:
        model = SarmikaVerify
        fields = ['id', 'owner', 'ProfilePhoto', 'IdProof']  # Include necessary fields

class ThakedarVerifySerializer(serializers.ModelSerializer):
    class Meta:
        model = ThakedarVerify
        fields = ['id', 'owner', 'ProfilePhoto', 'IdProof']  # Include necessary fields