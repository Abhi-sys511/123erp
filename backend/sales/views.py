from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Quotation
from .serializers import QuotationSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'SALES_EXECUTIVE':
            return Quotation.objects.filter(lead__assigned_sales_exec=user)
        elif getattr(user, 'role', None) == 'CUSTOMER':
            return Quotation.objects.filter(Q(lead__customer=user) | Q(lead__email=user.email))
        return Quotation.objects.all()

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'ACCEPTED':
            from operations.models import Project
            from django.contrib.auth import get_user_model
            from django.db.models import Count
            User = get_user_model()
            
            # Check if project already exists for this quotation
            if not Project.objects.filter(quotation=instance).exists():
                # Find customer from lead or email
                customer = instance.lead.customer
                if not customer:
                    customer = User.objects.filter(email=instance.lead.email, role='CUSTOMER').first()
                
                if customer:
                    # Find technician with lowest project load
                    tech = User.objects.filter(role='TECHNICIAN').annotate(
                        proj_count=Count('assigned_projects')
                    ).order_by('proj_count').first()
                    
                    # Create project
                    Project.objects.create(
                        customer=customer,
                        technician=tech,
                        quotation=instance,
                        status='SCHEDULED'
                    )
                    
                    # Update Lead status to CONVERTED
                    lead = instance.lead
                    lead.status = 'CONVERTED'
                    lead.save()
        elif instance.status == 'REJECTED':
            lead = instance.lead
            lead.status = 'REJECTED'
            lead.save()
