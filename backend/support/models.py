from django.db import models
from django.conf import settings


class Ticket(models.Model):
    STATUS_CHOICES = (
        ("OPEN", "Open"),
        ("ASSIGNED", "Assigned"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
        ("SUCCESSFULLY_RESOLVED", "Successfully Resolved"),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tickets"
    )
    project = models.ForeignKey(
        "operations.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets"
    )
    assigned_care_exec = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets"
    )
    assigned_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="technician_tickets"
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="OPEN")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} - {self.status}"
