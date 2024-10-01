import os
from PIL import Image
import aiohttp
import io


async def download_and_compress_image(id: str, url: str, quality: int = 70):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                image_data = await response.read()
                image = Image.open(io.BytesIO(image_data))
                image = image.convert("RGB")

                image.save(f"/photos/photo_{id}.jpeg", format="JPEG", quality=quality)
