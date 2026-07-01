from django.db import models
from crm.models import Lead

class Quotation(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("REJECTED", "Rejected"),
    )
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="quotations")
    items_description = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quotation for {self.lead.name} - {self.status}"
