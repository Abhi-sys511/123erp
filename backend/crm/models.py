from django.db import models
from django.conf import settings

class Lead(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("CONTACTED", "Contacted"),
        ("CONVERTED", "Converted"),
        ("REJECTED", "Rejected"),
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    interest_details = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    assigned_sales_exec = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name="assigned_leads"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="leads"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.status}"
