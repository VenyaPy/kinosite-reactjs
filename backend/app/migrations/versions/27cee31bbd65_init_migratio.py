"""Init migratio

Revision ID: 27cee31bbd65
Revises: f1489f361d48
Create Date: 2024-03-24 00:33:30.163467

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '27cee31bbd65'
down_revision = 'f1489f361d48'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('session_users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('session_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_session_users_id'), 'session_users', ['id'], unique=False)
    op.add_column('sessions', sa.Column('room_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_sessions_room_id'), 'sessions', ['room_id'], unique=True)
    op.drop_column('sessions', 'user_id')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('sessions', sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_index(op.f('ix_sessions_room_id'), table_name='sessions')
    op.drop_column('sessions', 'room_id')
    op.drop_index(op.f('ix_session_users_id'), table_name='session_users')
    op.drop_table('session_users')
    # ### end Alembic commands ###
