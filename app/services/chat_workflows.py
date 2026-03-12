
from app.services import chat_service, messages_service
from backend.llm_agent import ask_llm
import json


#This function serves the purpose of removing looping in the chat service when calling create_message function in the create_chat function 
# (remeber that create_chat calls create_message to add the first message to the chat, and create_message calls create_chat to create a chat if it doesn't exist, which creates a loop).
    
def create_chat_with_first_message(session, user_id, content):
    chat = chat_service.create_chat_record(session, user_id, content)
    
    session.commit()
    return chat
'''
def generate_llm_response(session, chat_id, user_id, content):
    llm_output = ask_llm(content, calendar_context=None)
    if not llm_output:
        return "The assistant returned an empty response."

    try:
        info = json.loads(llm_output)
    except Exception:
        return "Invalid response from assistant."

    intent = info.get("intent", "unknown")

    if intent == "add_event":
        title = info.get("title", "Untitled Event")
        return f"I will schedule '{title}'."

    if intent == "traffic_info":
        location = info.get("location")
        return f"I will check traffic to {location}."

    return "I did not understand that."

def send_message_with_ai(session, chat_id, content):
    user_message = messages_service.create_message(
        session=session,
        chat_id=chat_id,
        content=content,
        sender_is=True
    )

    ai_reply = generate_llm_response(session, chat_id, user_id=None, content=content)

    assistant_message = messages_service.create_message(
        session=session,
        chat_id=chat_id,
        content=ai_reply,
        sender_is=False
    )

    return {
        "user_message": user_message,
        "assistant_message": assistant_message
    }
'''