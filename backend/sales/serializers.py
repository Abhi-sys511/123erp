from rest_framework import serializers
from .models import Quotation
from crm.serializers import LeadSerializer

class QuotationSerializer(serializers.ModelSerializer):
    lead_details = LeadSerializer(source='lead', read_only=True)

    class Meta:
        model = Quotation
        fields = ['id', 'lead', 'lead_details', 'items_description', 'total_amount', 'status', 'created_at']
