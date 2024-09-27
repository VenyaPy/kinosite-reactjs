from tasks.celery import celery
from pathlib import Path
from PIL import Image


@celery.task()
def process_pic(
        path: str
):
    im_path = Path(path)
    im = Image.open(im_path)

    im_resized_1000_500 = im.resize((1000, 500))
    im_resized_200_100 = im.resize((200, 200))

    im_resized_1000_500.save(f"app/models/images/image_1000_500/{im_path.name}")
    im_resized_200_100.save(f"app/models/images/image_200_200/{im_path.name}")