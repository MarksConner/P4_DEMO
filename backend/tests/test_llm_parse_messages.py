from backend.llm_agent import ask_llm
import json

message  = "Hi there! Can you tell me a joke?"
response = ask_llm(message)
print("LLM response:", response)

#Visual test to see if the response is valid JSON and has the expected structure