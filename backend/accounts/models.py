from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SALES_EXECUTIVE = "SALES_EXECUTIVE", "Sales Executive"
        TECHNICIAN = "TECHNICIAN", "Technician"
        CUSTOMER_CARE = "CUSTOMER_CARE", "Customer Care"
        CUSTOMER = "CUSTOMER", "Customer"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.CUSTOMER)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
