from pydantic import BaseModel
class APIConfig:
    api_hbtv = "0befa987b7d85bcdad0b31e2e7c3f4ec"
    api_key = "VBZ63SW-PFHMYEM-M3384F6-X6BXVSY"
    kinoclub = ('Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiM2E2NGI2NzdhYzk0YmQwMTEyN2U2NDc'
                '1Yzg1ODY3N2E3N2Y4ZmRmN2ZhOTExM2U5MjhjOTg0MzNmOWJjM2UxZGEyODY3NmVmOWExZDQyZWYiLCJpYXQiOjE3MTI0MTc3Nj'
                'YuNDcyMDYsIm5iZiI6MTcxMjQxNzc2Ni40NzIwNjMsImV4cCI6MjAyNzk1MDU2Ni40Njg4NDcsInN1YiI6IjMzIiwic2NvcGVzI'
                'jpbXX0.DDjEOCdTWkGIrPHU-WlfLOEis89L6gLVwDpxXSzYKOmFMZx7sfWvr7YqR0kqyaqbkOJ6BXMlJTu6-rJosmyWhuRhE0tH'
                'IBQe8_z19LyyporfZcSg6puvEjGn1RinE2vd3FTWWmuh2UqsW7iDJKcOg1eic5KESdfC_fk4JcVcHYHkK9_r3pJczglE2i-XjUQ'
                'pe8y4JuzIqHX7e7da9FE8mONjghWHUvnVysKFX09Fh1m4QvY4plw3TuqND8SlaU75Ys-SAVHHkVzfcvhsBYbjlp71AIjevNvU0p'
                'PPXrRYfWOUWIRn-QaHpwJfsXu71WAzNYn4S7j1OQi1z5l02BZZu-XuaxFSXxt36R8JN4Rb0TmRzYYx0F9hv05BGnMtc0XW8wdvS'
                'uj1RgFV_ifZEV4HZbaxCatJZI8MofHuVd57SwaDzrPAx9JE5UDNhD9Zo3Kyj50Alcu3CXO9p6ahJtk1Bk6bTxjt0c9R0-wUbRsc'
                'mSgKSSpsx8k6OB_sJh2kWEGXN-pZgGJo8cfWhVQmVMP1I_b6OS97Zr-YYm3dGAKdiKm3WjaXW7zJHAqQ19kJDYyGKbAvAO8uC-W'
                'kV5mNq9MIL8YHLx6LpKhu5kAvHm1W8ryDjvbzq7HRLxkSIGInHrNOvIn9BCWVjLMST2M9l3wzX8fdaaJ3H6CW510GnPJizSw')
    current_api_key = 'be0bf35a-8449-4a49-bc28-a2738381f5d0'
class AuthJWT:
    private_key = """
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/zEqrhdjW6Kzi
syIzvUwMz0LUdscX5BcLnFk+PCNnk6gG8khC+1df/rE7VmYzZ7jlIBPS+2qcLctd
BQDZGk+PFNOKQ2xmr+rNv6Lj0sFq+EF+7w/2uaRAPRMQO2HP8KPHP0FizgVlndSE
4VFd4BuFct+4ZSDiGUu+WJeqjb5mFiAylMGY3e2PBzBA9vlsjn8LqxQQAhVFeLYz
RquNrKdaKg25ubxINRXwrTtrM3xXvYXnDZ1ZTkl7w0I/Y1rQCZ3c9VjeTr3+wEic
opxeM8aih8Yue2vwKR3Ncl4H7z6bFeY0J2IWPyxJKT9+0iP6MkW8K5CH8uOo1o1Y
CP+RHqTDAgMBAAECggEAT8ZuTHeIoKL4vfZaRID4798JYgvhdat2dmrap8slwsAk
xHbj3ZBjYFc0aoTeT4VV319/P2M5japyisc4+hQ6gT3dWwX+QZvsIxYRb4dK0e5e
d6iB0FKY4etFUZwRbAcgaBCEZs9gaUrDiV2alVxQtin4qd7OVZzF52877kG0rwrN
78fe80MVx7DhgJ2VW8wR9TomSIGLSVvuxC/MTf84KHIf/A9a/HwHCdMHQY588i5K
6SVU6PHupFaqACvXY33haZrafHV8I5jg4Hzs7ZeLkkdlDZN+NmSdywM+sKaRhY2b
tItjKh9+8+DVjpI4uHg90vZd8op61ZUr6PjMzCDwWQKBgQDxApx7N9Yw4237fyA5
Di3dCNifpY8jVNtl132vG9+DE3CCioRHH4QYvXo2GUK3VBwscfdSznYo8WiRQTtA
egA3DC8wyd8J096Mm/Qphys6Cm5+PGv/o+VlEmh7nMNOV5tmRPxDEsuYM0p/EW+u
D1UVJWTOwi/vgqlMEny+AmFR/wKBgQDLuh545OKTKZZSNDTae4iiEu/MTcAiiClP
axQQ0P85fDTDnZUqN5YDFvynO0p2SgtxcsF3s/YUhFTdk0ZRsfnXSqv9xMdgT5yB
h0V3umA0+V2g5EcnT08Xw/9lpUOtqJ9i/3iVhzAQIgF8gUJGCJtfRYxmT4KvVBKM
9J/9VGvlPQKBgQCCkJeVaTpwYcVDaitavYO7Kv+v/VD+Iwp4sbU1GDSOHgnlroTa
wwgdHwkGJcku6DIbIeKKya7Zn262wlAHLhDPwZoPJE3gVRdLtXEgzklsuBoD6VfY
tkGf78kKrnJgDrXxQY4oCBaj7aV+EUQfV88QFaH3INw3NOHihGFvznpKoQKBgB/r
PTL7yXP9JAwlGdLRYArkpKWB2QSQCMjkofQwioxbJXkwi1pd8ybwxwz8gSIfX8Oa
ky1KCNgWE6XTmUTbeaV9kYzk88fnMUIqC3xCuygRmdXHbk5+Yon6r10hk4T10mMU
W7QxxhoA+fKj3dpTJuS6ZNDyzCrkJTPob9ilDXKRAoGBAMxCfHK7SCJ9To6wrdwu
ur+sbdXVt5JMK6g2m8WSGZgv3pQvdeDMyUaUZB4+PI1HXDMPMv+UwODqb2Ym2f3W
HTi5KwwuHU4DGBwxMymI/INx+C5D7pS8GesYJ0ss23mO5q5JlcW8O0/fKSjhO6qu
3DyqAnIgBvYXXcLotuv+T99f
-----END PRIVATE KEY-----
"""
    public_key = """
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv8xKq4XY1uis4rMiM71M
DM9C1HbHF+QXC5xZPjwjZ5OoBvJIQvtXX/6xO1ZmM2e45SAT0vtqnC3LXQUA2RpP
jxTTikNsZq/qzb+i49LBavhBfu8P9rmkQD0TEDthz/Cjxz9BYs4FZZ3UhOFRXeAb
hXLfuGUg4hlLvliXqo2+ZhYgMpTBmN3tjwcwQPb5bI5/C6sUEAIVRXi2M0arjayn
WioNubm8SDUV8K07azN8V72F5w2dWU5Je8NCP2Na0Amd3PVY3k69/sBInKKcXjPG
oofGLntr8CkdzXJeB+8+mxXmNCdiFj8sSSk/ftIj+jJFvCuQh/LjqNaNWAj/kR6k
wwIDAQAB
-----END PUBLIC KEY-----
"""
    algorithm = "RS256"