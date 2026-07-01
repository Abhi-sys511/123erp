from django.db import models
from django.conf import settings
from sales.models import Quotation

class Project(models.Model):
    STATUS_CHOICES = (
        ("SCHEDULED", "Scheduled"),
        ("INSTALLATION_STARTED", "Installation Started"),
        ("WORK_IN_PROGRESS", "Work in Progress"),
        ("HALFWAY_COMPLETED", "Halfway Completed"),
        ("INSTALLATION_COMPLETED", "Installation Completed"),
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects"
    )
    technician = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_projects"
    )
    quotation = models.OneToOneField(Quotation, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="SCHEDULED")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Project for {self.customer.username} - {self.status}"

class Invoice(models.Model):
    STATUS_CHOICES = (
        ("UNPAID", "Unpaid"),
        ("PAID", "Paid"),
    )
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invoices")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="UNPAID")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice for {self.project} - {self.status}"
