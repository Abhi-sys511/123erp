from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Invoice
from .serializers import ProjectSerializer, InvoiceSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'TECHNICIAN':
            return Project.objects.filter(technician=user)
        elif getattr(user, 'role', None) == 'CUSTOMER':
            return Project.objects.filter(customer=user)
        elif getattr(user, 'role', None) == 'SALES_EXECUTIVE':
            return Project.objects.filter(quotation__lead__assigned_sales_exec=user)
        return Project.objects.all()

    def perform_update(self, serializer):
        instance = serializer.save()
        # Auto-generate invoice when installation is completed
        if instance.status == 'INSTALLATION_COMPLETED':
            if not Invoice.objects.filter(project=instance).exists():
                Invoice.objects.create(
                    project=instance,
                    customer=instance.customer,
                    amount=instance.quotation.total_amount,
                    status='UNPAID'
                )

    @action(detail=True, methods=['get'], url_path='report')
    def report(self, request, pk=None):
        """
        Returns a full project completion report with all related data.
        Admin-only endpoint.
        """
        # Restrict access to ADMIN role only
        if getattr(request.user, 'role', None) != 'ADMIN':
            return Response({'error': 'Permission denied. Admins only.'}, status=403)

        try:
            project = self.get_object()
        except Exception:
            return Response({'error': 'Project not found.'}, status=404)

        if project.status != 'INSTALLATION_COMPLETED':
            return Response({'error': 'Report is only available for completed projects.'}, status=400)

        quotation = project.quotation
        lead = quotation.lead

        # Customer details
        customer = project.customer
        customer_data = {
            'id': customer.id,
            'username': customer.username,
            'email': customer.email,
            'first_name': customer.first_name,
            'last_name': customer.last_name,
        } if customer else None

        # Lead details
        lead_data = {
            'id': lead.id,
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'interest_details': lead.interest_details,
            'status': lead.status,
            'created_at': lead.created_at,
        } if lead else None

        # Quotation details
        quotation_data = {
            'id': quotation.id,
            'items_description': quotation.items_description,
            'total_amount': str(quotation.total_amount),
            'status': quotation.status,
        } if quotation else None

        # Sales Executive details
        sales_exec = lead.assigned_sales_exec if lead else None
        sales_exec_data = {
            'id': sales_exec.id,
            'username': sales_exec.username,
            'email': sales_exec.email,
            'first_name': sales_exec.first_name,
            'last_name': sales_exec.last_name,
        } if sales_exec else None

        # Technician details
        technician = project.technician
        technician_data = {
            'id': technician.id,
            'username': technician.username,
            'email': technician.email,
            'first_name': technician.first_name,
            'last_name': technician.last_name,
        } if technician else None

        # Invoice details
        try:
            invoice = Invoice.objects.get(project=project)
            invoice_data = {
                'id': invoice.id,
                'amount': str(invoice.amount),
                'status': invoice.status,
                'created_at': invoice.created_at,
            }
        except Invoice.DoesNotExist:
            invoice_data = None

        # Support tickets linked to this project
        from support.models import Ticket
        tickets = Ticket.objects.filter(project=project).order_by('created_at')
        tickets_data = [
            {
                'id': t.id,
                'subject': t.subject,
                'description': t.description,
                'status': t.status,
                'assigned_technician': t.assigned_technician.username if t.assigned_technician else None,
                'created_at': t.created_at,
                'updated_at': t.updated_at,
            }
            for t in tickets
        ]

        return Response({
            'project': {
                'id': project.id,
                'status': project.status,
                'created_at': project.created_at,
            },
            'customer': customer_data,
            'lead': lead_data,
            'quotation': quotation_data,
            'sales_executive': sales_exec_data,
            'technician': technician_data,
            'invoice': invoice_data,
            'tickets': tickets_data,
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'CUSTOMER':
            return Invoice.objects.filter(customer=user).order_by('-created_at')
        elif role == 'SALES_EXECUTIVE':
            return Invoice.objects.filter(
                project__quotation__lead__assigned_sales_exec=user
            ).order_by('-created_at')
        return Invoice.objects.all().order_by('-created_at')
