from django.db import models



class Thakedar(models.Model):
    # Owner (Thakedar) Fields
    name = models.CharField(max_length=100)  # Mandatory
    phone = models.CharField(max_length=15, unique=True)  # Mandatory and unique
    email = models.EmailField(max_length=100, blank=True, null=True)  # Mandatory and unique
    address = models.CharField(max_length=255, blank=True, null=True)  # Optional
    city = models.CharField(max_length=100, blank=True, null= True)  # Optional  
    Pincode = models.IntegerField(null=True, blank=True)  # Optional

    verification = models.BooleanField(default=False)  # Optional with a default value
    age = models.IntegerField(null=True, blank=True)  # Optional

    def __str__(self):
        return self.name
class ThakedarAcc(models.Model):
    owner = models.ForeignKey(Thakedar, on_delete=models.CASCADE)
    account_number = models.CharField(max_length=20)
    ifsc = models.CharField(max_length=20,blank=False,null=False)
    bank_name = models.CharField(max_length=100,blank=False,null=False)
    
    def __str__(self):
        return self.owner.name

class Sarmika(models.Model):
    # Worker (Sarmika) Fields
    tid = models.ForeignKey(
        Thakedar,
        on_delete=models.SET_NULL,  # Allow Thakedar deletion without removing Sarmika
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)  # Mandatory
    phone = models.CharField(max_length=15, unique=True)  # Mandatory and unique
    email = models.EmailField(max_length=100, blank=True, null=True)  # Optional
    address = models.CharField(max_length=255, blank=True, null=True)  # Optional
    verification = models.BooleanField(default=False)  # Optional with a default value
    age = models.IntegerField(null=True, blank=False,default=18)  # Optional
    work = models.CharField(max_length=100, blank=True, null=True)  # Optional
    city = models.CharField(max_length=100, blank=True, null= True)  # Optional
    Pincode = models.IntegerField(null=True, blank=True)  # Optional
    def __str__(self):
        return self.name

class SarmikaAcc(models.Model):
    # owner = models.ForeignKey(Sarmika, on_delete=models.CASCADE)
    account_number = models.CharField(max_length=20)
    ifsc = models.CharField(max_length=20,blank=False,null=False)
    bank_name = models.CharField(max_length=100,blank=False,null=False)
    
    def __str__(self):
        return self.owner.name
    
class SarmikaVerify(models.Model):
    owner = models.ForeignKey(Sarmika, on_delete=models.CASCADE,blank=True,null=True)
    ProfilePhoto = models.ImageField(upload_to='profile/',blank=False,null=False)
    IdProof = models.ImageField(upload_to='idproof/',blank=False,null=False)


    def __str__(self):
        return self.owner.name
    
class ThakedarVerify(models.Model):
    tid = models.ForeignKey(Thakedar, on_delete=models.CASCADE,blank=True,null=True)
    ProfilePhoto = models.ImageField(upload_to='profile/',blank=False,null=False)
    IdProof = models.ImageField(upload_to='idproof/',blank=False,null=False)


    def __str__(self):
        return self.owner.name
    
