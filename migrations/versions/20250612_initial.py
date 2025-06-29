"""Initial migration

Revision ID: 20250612_initial
Revises: 
Create Date: 2025-06-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20250612_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create volunteers table
    op.create_table(
        'volunteers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('screening_date', sa.Date(), nullable=True),
        sa.Column('dob', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(), nullable=True),
        sa.Column('bmi', sa.Numeric(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # Create form_templates table
    op.create_table(
        'form_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sections', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('side_headers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('logic', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # Create forms table
    op.create_table(
        'forms',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('form_templates.id', ondelete='CASCADE'), nullable=False),
        sa.Column('volunteer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('volunteers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(), server_default='draft', nullable=False),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # Create change_log table
    op.create_table(
        'change_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('form_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('forms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('field', sa.String(), nullable=True),
        sa.Column('old', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('new', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('changed_by', postgresql.UUID(as_uuid=True), nullable=True),
    )
    
    # Create indexes
    op.create_index(op.f('ix_volunteers_created_at'), 'volunteers', ['created_at'], unique=False)
    op.create_index(op.f('ix_form_templates_name'), 'form_templates', ['name'], unique=False)
    op.create_index(op.f('ix_form_templates_created_at'), 'form_templates', ['created_at'], unique=False)
    op.create_index(op.f('ix_forms_volunteer_id'), 'forms', ['volunteer_id'], unique=False)
    op.create_index(op.f('ix_forms_template_id'), 'forms', ['template_id'], unique=False)
    op.create_index(op.f('ix_forms_status'), 'forms', ['status'], unique=False)
    op.create_index(op.f('ix_forms_created_at'), 'forms', ['created_at'], unique=False)
    op.create_index(op.f('ix_change_log_form_id'), 'change_log', ['form_id'], unique=False)
    op.create_index(op.f('ix_change_log_changed_at'), 'change_log', ['changed_at'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('change_log')
    op.drop_table('forms')
    op.drop_table('form_templates')
    op.drop_table('volunteers')