from pydantic import BaseModel, Field, field_validator

class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)

    @field_validator("content", mode="before")
    @classmethod
    def validate_content(cls, value):
        if isinstance(value, str):
            value = value.strip()

            if not value:
                raise ValueError("Content cannot be empty or whitespace.")

        return value



class Message(BaseModel):
    id: int
    content: str