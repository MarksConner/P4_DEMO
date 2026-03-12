import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base

from app.models.users import Users
from app.models.chat import Chat
from app.models.messages import Messages

from app.services.messages_service import (
    create_message,
    get_message_by_id,
    get_messages_by_chat_id,
    update_message_content,
)

@pytest.fixture
def db():
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def setup_user_chat(db):
    user = Users(
        user_id=uuid.uuid4(),
        email="test@test.com",
        username="testuser",
        first_name="Test",
        last_name="User",
        password_hash="x",  # optional, but good to set
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    chat = Chat(
        chat_id=uuid.uuid4(),
        user_id=user.user_id,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return user, chat

def test_create_and_get_message_by_id(db, setup_user_chat):
    user, chat = setup_user_chat

    created = create_message(
        db,
        chat_id=chat.chat_id,
        content="hello",
        sender_is=True
    )

    fetched = get_message_by_id(db, created.message_id)

    assert fetched is not None
    assert fetched.message_id == created.message_id
    assert fetched.chat_id == chat.chat_id
    assert fetched.content == "hello"


def test_get_messages_by_chat_id(db, setup_user_chat):
    user, chat = setup_user_chat

    create_message(db, chat.chat_id, "a", True)
    create_message(db, chat.chat_id, "b", False)

    messages = get_messages_by_chat_id(db, chat.chat_id).all()

    assert len(messages) == 2
    assert messages[0].content == "a"
    assert messages[1].content == "b"
    print (messages[0].sent_at, messages[1].sent_at)
    print(messages[0].content, messages[1].content)

