"""Initial schema for SafeAI (users, assessments, audit_log).

Revision ID: 001_initial
Revises: 
Create Date: 2026-11-05
"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='analyst'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('venue', sa.String(length=200), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('crowd_size', sa.Integer(), nullable=False),
        sa.Column('venue_capacity', sa.Integer(), nullable=False),
        sa.Column('weather', sa.String(length=50), nullable=False),
        sa.Column('temperature_c', sa.Float(), nullable=False),
        sa.Column('previous_incidents', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('holiday', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('time_slot', sa.String(length=20), nullable=False),
        sa.Column('day_of_week', sa.String(length=20), nullable=False),
        sa.Column('risk_level', sa.String(length=20), nullable=False),
        sa.Column('risk_score', sa.Integer(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('model_version', sa.String(length=100), nullable=True),
        sa.Column('security_personnel', sa.Integer(), nullable=True),
        sa.Column('police_units', sa.Integer(), nullable=True),
        sa.Column('medical_teams', sa.Integer(), nullable=True),
        sa.Column('ambulances', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessments_id'), 'assessments', ['id'], unique=False)
    op.create_index(op.f('ix_assessments_risk_level'), 'assessments', ['risk_level'], unique=False)
    op.create_index(op.f('ix_assessments_venue'), 'assessments', ['venue'], unique=False)
    op.create_index(op.f('ix_assessments_created_at'), 'assessments', ['created_at'], unique=False)

    # Audit log table
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('detail', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_log_id'), 'audit_log', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('assessments')
    op.drop_table('users')

