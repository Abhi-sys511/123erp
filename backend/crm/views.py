from rest_framework import viewsets, permissions
from .models import Lead
from .serializers import LeadSerializer

class LeadViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Lead.objects.none()
        if getattr(user, 'role', None) == 'SALES_EXECUTIVE':
            return Lead.objects.filter(assigned_sales_exec=user)
        return Lead.objects.all()
    serializer_class = LeadSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        from django.contrib.auth import get_user_model
        from django.db.models import Count
        User = get_user_model()
        
        # Distribute leads: assign to the sales executive with the lowest number of leads
        sales_exec = User.objects.filter(role='SALES_EXECUTIVE').annotate(
            lead_count=Count('assigned_leads')
        ).order_by('lead_count').first()
        
        # Find registered customer matching the email
        email = serializer.validated_data.get('email')
        customer = User.objects.filter(email=email, role='CUSTOMER').first()
        
        serializer.save(assigned_sales_exec=sales_exec, customer=customer)
