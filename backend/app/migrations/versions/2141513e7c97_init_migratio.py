"""Init migratio

Revision ID: 2141513e7c97
Revises: 
Create Date: 2024-03-20 00:27:38.059848

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2141513e7c97'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_session')
    op.add_column('users', sa.Column('image', sa.String(), nullable=True))
    op.add_column('users', sa.Column('status', sa.String(), nullable=True))
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_index('ix_users_username', table_name='users')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index('ix_users_username', 'users', ['username'], unique=False)
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.drop_column('users', 'status')
    op.drop_column('users', 'image')
    op.create_table('user_session',
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('session_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], name='user_session_session_id_fkey'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='user_session_user_id_fkey'),
    sa.PrimaryKeyConstraint('user_id', 'session_id', name='user_session_pkey')
    )
    # ### end Alembic commands ###
