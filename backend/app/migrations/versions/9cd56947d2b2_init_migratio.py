"""Init migratio

Revision ID: 9cd56947d2b2
Revises: 12d0dbb3378e
Create Date: 2024-03-24 21:46:46.433995

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9cd56947d2b2'
down_revision = '12d0dbb3378e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('sessions', sa.Column('username', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('sessions', 'username')
    # ### end Alembic commands ###
