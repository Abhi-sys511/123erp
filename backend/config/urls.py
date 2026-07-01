from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from crm.views import LeadViewSet
from sales.views import QuotationViewSet
from operations.views import ProjectViewSet, InvoiceViewSet
from support.views import TicketViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include(router.urls)),
]
