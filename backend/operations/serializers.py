from rest_framework import serializers
from .models import Project, Invoice


class ProjectSerializer(serializers.ModelSerializer):
    customer_username = serializers.ReadOnlyField(source='customer.username')
    technician_username = serializers.ReadOnlyField(source='technician.username')
    quotation_amount = serializers.ReadOnlyField(source='quotation.total_amount')
    quotation_items = serializers.ReadOnlyField(source='quotation.items_description')
    lead_name = serializers.ReadOnlyField(source='quotation.lead.name')
    sales_exec_id = serializers.ReadOnlyField(source='quotation.lead.assigned_sales_exec.id')

    class Meta:
        model = Project
        fields = [
            'id', 'customer', 'customer_username', 'technician', 'technician_username',
            'quotation', 'quotation_amount', 'quotation_items', 'lead_name', 'sales_exec_id',
            'status', 'created_at'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    customer_username = serializers.ReadOnlyField(source='customer.username')
    project_lead_name = serializers.ReadOnlyField(source='project.quotation.lead.name')
    project_technician_username = serializers.ReadOnlyField(source='project.technician.username')
    project_quotation_items = serializers.ReadOnlyField(source='project.quotation.items_description')
    project_quotation_amount = serializers.ReadOnlyField(source='project.quotation.total_amount')
    project_status = serializers.ReadOnlyField(source='project.status')
    sales_exec_id = serializers.ReadOnlyField(source='project.quotation.lead.assigned_sales_exec.id')

    class Meta:
        model = Invoice
        fields = [
            'id', 'project', 'customer', 'customer_username',
            'project_lead_name', 'project_technician_username',
            'project_quotation_items', 'project_quotation_amount', 'project_status',
            'sales_exec_id', 'amount', 'status', 'created_at',
        ]
