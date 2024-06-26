"""Добавление даты регистрации в модель Users

Revision ID: 9a196be06dc1
Revises: 2141513e7c97
Create Date: 2024-03-20 23:38:22.277543

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9a196be06dc1'
down_revision = '2141513e7c97'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('date', sa.DateTime(), nullable=False, server_default=sa.func.now()))
    op.alter_column('users', 'date', server_default=None)


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'date')
    # ### end Alembic commands ###
