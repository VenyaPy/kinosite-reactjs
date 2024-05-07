"""Init migratio

Revision ID: 29718ffe472e
Revises: 9cd56947d2b2
Create Date: 2024-04-14 22:21:48.089230

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '29718ffe472e'
down_revision = '9cd56947d2b2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('sessions', sa.Column('movie_name', sa.String(), nullable=True))
    op.add_column('sessions', sa.Column('movie_poster', sa.String(), nullable=True))
    op.create_unique_constraint(None, 'sessions', ['movie_name'])
    op.create_unique_constraint(None, 'sessions', ['movie_poster'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'sessions', type_='unique')
    op.drop_constraint(None, 'sessions', type_='unique')
    op.drop_column('sessions', 'movie_poster')
    op.drop_column('sessions', 'movie_name')
    # ### end Alembic commands ###