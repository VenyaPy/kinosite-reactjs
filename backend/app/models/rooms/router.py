from uuid import uuid4
from fastapi import FastAPI
import socketio

# Создаем экземпляр сервера Socket.IO
sio = socketio.AsyncServer(async_mode='asgi')
app = FastAPI()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Обработчики событий Socket.IO
@sio.event
async def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def create_room(sid, data):
    room_id = str(uuid4())
    await sio.enter_room(sid, room_id)
    await sio.emit('room_created', {'room_id': room_id}, room=room_id)
    print(f"Room {room_id} created by {sid}")

@sio.event
async def play_video(sid, data):
    await sio.emit('play', data, room=data['room_id'])

@sio.event
async def pause_video(sid, data):
    await sio.emit('pause', data, room=data['room_id'])

@sio.event
async def seek_video(sid, data):
    await sio.emit('seek', data, room=data['room_id'])

@sio.event
async def disconnect(sid):
    print('disconnect ', sid)






