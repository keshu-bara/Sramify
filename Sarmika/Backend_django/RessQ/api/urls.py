from django.urls import path
from thakedar.views import thakedar,sarmika,ThakedarAcc,SarmikaAcc,sermika_verify_api,thakedar_verify_api

urlpatterns = [
    path('thakedar/',thakedar,name='thakedar'),
    path('sarmika/<int:id>/',sarmika,name='sarmika'),
    path('thakedaracc/<int:id>/',ThakedarAcc,name='thakedaracc'),
    path('sarmikaacc/<int:id>/',SarmikaAcc,name='sarmikaacc'),
    path('sermikaverify/<int:id>/',sermika_verify_api,name='sermikaverify'),
    path('thakedarverify/<int:id>/',thakedar_verify_api,name='thakedarverify')
]