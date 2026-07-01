from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    customer_username = serializers.ReadOnlyField(source='customer.username')
    customer_email = serializers.ReadOnlyField(source='customer.email')
    assigned_technician_username = serializers.ReadOnlyField(source='assigned_technician.username')
    assigned_care_exec_username = serializers.ReadOnlyField(source='assigned_care_exec.username')

    # Project context
    project_lead_name = serializers.ReadOnlyField(source='project.quotation.lead.name')
    project_quotation_items = serializers.ReadOnlyField(source='project.quotation.items_description')
    project_technician_username = serializers.ReadOnlyField(source='project.technician.username')
    project_technician_id = serializers.ReadOnlyField(source='project.technician.id')
    project_status = serializers.ReadOnlyField(source='project.status')

    class Meta:
        model = Ticket
        fields = [
            'id', 'customer', 'customer_username', 'customer_email',
            'project', 'project_lead_name', 'project_quotation_items',
            'project_technician_username', 'project_technician_id', 'project_status',
            'assigned_care_exec', 'assigned_care_exec_username',
            'assigned_technician', 'assigned_technician_username',
            'subject', 'description', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['customer', 'created_at', 'updated_at']
