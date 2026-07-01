from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        if role == 'CUSTOMER':
            return Ticket.objects.filter(customer=user).order_by('-created_at')
        elif role == 'CUSTOMER_CARE':
            return Ticket.objects.all().order_by('-created_at')
        elif role == 'TECHNICIAN':
            return Ticket.objects.filter(assigned_technician=user).order_by('-created_at')
        elif role == 'SALES_EXECUTIVE':
            # Tickets for projects from their leads
            return Ticket.objects.filter(
                project__quotation__lead__assigned_sales_exec=user
            ).order_by('-created_at')
        # ADMIN — all
        return Ticket.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-assign the requesting customer as the ticket owner
        serializer.save(customer=self.request.user)
