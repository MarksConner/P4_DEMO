#This function serves the purpose of removing looping in the chat service when calling create_message function in the create_chat function 
# (remeber that create_chat calls create_message to add the first message to the chat, and create_message calls create_chat to create a chat if it doesn't exist, which creates a loop).

from app.services import chat_service, messages_service


def create_chat_with_first_message(session, user_id, content):
    chat = chat_service.create_chat_record(session, user_id, content)
    session.commit()
    return chat