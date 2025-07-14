from typing import Optional, Dict, Any
from uuid import UUID
import json
import base64
from datetime import datetime
from io import BytesIO

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.unified_models import Form, AuditLog
from app.services.audit_service import get_audit_trail

# For production, you would use libraries like:
# import pdfkit  # For HTML to PDF conversion
# from reportlab.pdfgen import canvas  # For programmatic PDF generation
# import weasyprint  # Alternative HTML to PDF

class PDFExportService:
    """
    Service for generating PDF exports of forms and audit trails
    Note: This is a basic implementation. In production, you would use
    proper PDF generation libraries like pdfkit, reportlab, or weasyprint
    """
    
    def __init__(self):
        self.default_styles = {
            "font_family": "Arial, sans-serif",
            "font_size": "12px",
            "line_height": "1.4",
            "margin": "20px",
            "header_color": "#2563eb",
            "border_color": "#e5e7eb"
        }
    
    async def generate_form_pdf(
        self,
        db: AsyncSession,
        form_id: UUID,
        include_audit_trail: bool = False,
        watermark: Optional[str] = None
    ) -> bytes:
        """
        Generate PDF for a form
        """
        # Get form with all related data
        result = await db.execute(
            select(Form)
            .options(
                selectinload(Form.creator),
                selectinload(Form.approver),
                selectinload(Form.rejector),
                selectinload(Form.project)
            )
            .where(Form.id == form_id)
        )
        form = result.scalar_one_or_none()
        
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Form not found"
            )
        
        # Generate HTML content
        html_content = self._generate_form_html(form, watermark)
        
        # Add audit trail if requested
        if include_audit_trail:
            audit_logs = await get_audit_trail(
                db=db,
                resource_type="form",
                resource_id=form_id,
                limit=1000
            )
            audit_html = self._generate_audit_html(audit_logs)
            html_content += audit_html
        
        # Convert HTML to PDF (basic implementation)
        pdf_bytes = self._html_to_pdf(html_content)
        
        return pdf_bytes
    
    def _generate_form_html(self, form: Form, watermark: Optional[str] = None) -> str:
        """
        Generate HTML content for a form
        """
        status_color = {
            "draft": "#6b7280",
            "submitted": "#3b82f6", 
            "approved": "#10b981",
            "rejected": "#ef4444",
            "locked": "#6366f1"
        }.get(form.status, "#6b7280")
        
        watermark_html = ""
        if watermark:
            watermark_html = f"""
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                        font-size: 72px; color: rgba(0,0,0,0.1); z-index: -1; font-weight: bold;">
                {watermark}
            </div>
            """
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Form: {form.title}</title>
            <style>
                body {{
                    font-family: {self.default_styles['font_family']};
                    font-size: {self.default_styles['font_size']};
                    line-height: {self.default_styles['line_height']};
                    margin: {self.default_styles['margin']};
                    color: #374151;
                }}
                .header {{
                    color: {self.default_styles['header_color']};
                    border-bottom: 2px solid {self.default_styles['border_color']};
                    padding-bottom: 15px;
                    margin-bottom: 30px;
                }}
                .form-meta {{
                    background-color: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    border: 1px solid {self.default_styles['border_color']};
                }}
                .status {{
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
                    background-color: {status_color};
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                }}
                .form-data {{
                    margin-top: 30px;
                }}
                .field {{
                    margin-bottom: 15px;
                    padding: 10px 0;
                    border-bottom: 1px solid #f3f4f6;
                }}
                .field-label {{
                    font-weight: bold;
                    color: #374151;
                    margin-bottom: 5px;
                }}
                .field-value {{
                    color: #6b7280;
                    margin-left: 20px;
                }}
                .page-break {{
                    page-break-before: always;
                }}
                @media print {{
                    body {{ margin: 0; }}
                    .no-print {{ display: none; }}
                }}
            </style>
        </head>
        <body>
            {watermark_html}
            
            <div class="header">
                <h1>Electronic Data Capture Form</h1>
                <h2>{form.title}</h2>
            </div>
            
            <div class="form-meta">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <strong>Form ID:</strong> {form.id}<br>
                        <strong>Form Type:</strong> {form.form_type}<br>
                        <strong>Version:</strong> {form.version}<br>
                        <strong>Status:</strong> <span class="status">{form.status}</span><br>
                        <strong>Created:</strong> {form.created_at.strftime('%Y-%m-%d %H:%M:%S') if form.created_at else 'N/A'}<br>
                        <strong>Created By:</strong> {form.creator.full_name if form.creator else 'N/A'}
                    </div>
                    <div>
                        <strong>Case ID:</strong> {form.case_id or 'N/A'}<br>
                        <strong>Volunteer ID:</strong> {form.volunteer_id or 'N/A'}<br>
                        <strong>Study Number:</strong> {form.study_number or 'N/A'}<br>
                        <strong>Period Number:</strong> {form.period_number or 'N/A'}<br>
                        <strong>Project:</strong> {form.project.name if form.project else 'N/A'}<br>
                        <strong>Submitted:</strong> {form.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if form.submitted_at else 'Not submitted'}
                    </div>
                </div>
                
                {self._generate_approval_info(form)}
            </div>
            
            <div class="form-data">
                <h3>Form Data</h3>
                {self._format_form_data(form.form_data)}
            </div>
            
            {self._generate_comments_section(form)}
            
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid {self.default_styles['border_color']}; 
                        font-size: 10px; color: #9ca3af; text-align: center;">
                Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC<br>
                EDC - Electronic Data Capture System
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _generate_approval_info(self, form: Form) -> str:
        """Generate approval/rejection information"""
        if form.status == "approved" and form.approved_at:
            return f"""
            <div style="margin-top: 15px; padding: 10px; background-color: #dcfce7; border-radius: 4px; border-left: 4px solid #10b981;">
                <strong>Approved:</strong> {form.approved_at.strftime('%Y-%m-%d %H:%M:%S')}<br>
                <strong>Approved By:</strong> {form.approver.full_name if form.approver else 'N/A'}
            </div>
            """
        elif form.status == "rejected" and form.rejected_at:
            return f"""
            <div style="margin-top: 15px; padding: 10px; background-color: #fef2f2; border-radius: 4px; border-left: 4px solid #ef4444;">
                <strong>Rejected:</strong> {form.rejected_at.strftime('%Y-%m-%d %H:%M:%S')}<br>
                <strong>Rejected By:</strong> {form.rejector.full_name if form.rejector else 'N/A'}<br>
                {f'<strong>Reason:</strong> {form.rejection_reason}' if form.rejection_reason else ''}
            </div>
            """
        return ""
    
    def _generate_comments_section(self, form: Form) -> str:
        """Generate comments section"""
        if form.review_comments:
            return f"""
            <div style="margin-top: 30px;">
                <h3>Review Comments</h3>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
                    {form.review_comments}
                </div>
            </div>
            """
        return ""
    
    def _format_form_data(self, form_data: Dict[str, Any]) -> str:
        """Format form data as HTML"""
        if not form_data:
            return "<p>No form data available.</p>"
        
        html = ""
        for key, value in form_data.items():
            formatted_key = key.replace('_', ' ').title()
            
            if isinstance(value, dict):
                formatted_value = self._format_nested_data(value)
            elif isinstance(value, list):
                formatted_value = self._format_list_data(value)
            else:
                formatted_value = str(value) if value is not None else "N/A"
            
            html += f"""
            <div class="field">
                <div class="field-label">{formatted_key}</div>
                <div class="field-value">{formatted_value}</div>
            </div>
            """
        
        return html
    
    def _format_nested_data(self, data: Dict[str, Any], indent: int = 0) -> str:
        """Format nested dictionary data"""
        html = "<div style='margin-left: 20px;'>"
        for key, value in data.items():
            formatted_key = key.replace('_', ' ').title()
            if isinstance(value, dict):
                html += f"<strong>{formatted_key}:</strong><br>{self._format_nested_data(value, indent + 1)}"
            elif isinstance(value, list):
                html += f"<strong>{formatted_key}:</strong> {self._format_list_data(value)}<br>"
            else:
                html += f"<strong>{formatted_key}:</strong> {value if value is not None else 'N/A'}<br>"
        html += "</div>"
        return html
    
    def _format_list_data(self, data: list) -> str:
        """Format list data"""
        if not data:
            return "None"
        
        if all(isinstance(item, (str, int, float, bool)) for item in data):
            return ", ".join(str(item) for item in data)
        else:
            html = "<ul style='margin: 5px 0; padding-left: 20px;'>"
            for item in data:
                if isinstance(item, dict):
                    html += f"<li>{self._format_nested_data(item)}</li>"
                else:
                    html += f"<li>{item}</li>"
            html += "</ul>"
            return html
    
    def _generate_audit_html(self, audit_logs: list) -> str:
        """Generate HTML for audit trail"""
        if not audit_logs:
            return ""
        
        html = """
        <div class="page-break">
            <div class="header">
                <h2>Audit Trail</h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f9fafb;">
                        <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">Timestamp</th>
                        <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">User</th>
                        <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">Action</th>
                        <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">Changes</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for log in audit_logs:
            user_name = log.user.full_name if log.user else "System"
            timestamp = log.created_at.strftime('%Y-%m-%d %H:%M:%S') if log.created_at else "N/A"
            
            changes_html = ""
            if log.field_changes:
                changes_html = "<ul style='margin: 0; padding-left: 15px; font-size: 11px;'>"
                for field, change in log.field_changes.items():
                    changes_html += f"<li><strong>{field}:</strong> {change.get('old', 'N/A')} → {change.get('new', 'N/A')}</li>"
                changes_html += "</ul>"
            elif log.reason:
                changes_html = f"<em>{log.reason}</em>"
            
            html += f"""
                <tr>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 11px;">{timestamp}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 11px;">{user_name}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 11px;">{log.action}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 11px;">{changes_html}</td>
                </tr>
            """
        
        html += """
                </tbody>
            </table>
        </div>
        """
        
        return html
    
    def _html_to_pdf(self, html_content: str) -> bytes:
        """
        Convert HTML to PDF
        Note: This is a basic implementation that returns the HTML as base64-encoded bytes
        In production, you would use a proper PDF library like:
        
        # Using pdfkit (requires wkhtmltopdf)
        # import pdfkit
        # return pdfkit.from_string(html_content, False)
        
        # Using weasyprint
        # import weasyprint
        # pdf = weasyprint.HTML(string=html_content).write_pdf()
        # return pdf
        
        # Using reportlab for programmatic generation
        # (more complex but gives full control)
        """
        
        # For now, return HTML content as bytes (for demonstration)
        # In production, replace this with actual PDF generation
        return html_content.encode('utf-8')

# Export service instance
pdf_export_service = PDFExportService()