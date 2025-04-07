from django.contrib import admin
from thakedar.models import Thakedar,Sarmika, ThakedarAcc, SarmikaAcc,SarmikaVerify, ThakedarVerify

# Register your models here.
admin.site.register(Thakedar)
admin.site.register(Sarmika)
admin.site.register(ThakedarAcc)
admin.site.register(SarmikaAcc)
admin.site.register(SarmikaVerify)
admin.site.register(ThakedarVerify)

