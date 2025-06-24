from fastapi import FastAPI, APIRouter, HTTPException
from models.todos import Todo
from config.database import collection_name
from schema.schemas import list_serial
from bson import ObjectId

router = APIRouter(
    prefix='/todos',
    tags=['routines']
)

@router.get("/")
async def get_todos():
    try:
        todos = list_serial(collection_name.find())
        return todos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching todos: {str(e)}")


@router.post("/")
async def create_todo(todo: Todo):
    try:
        result = collection_name.insert_one(dict(todo))
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create todo")
        return {"id": str(result.inserted_id), "message": "Todo created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating todo: {str(e)}")


@router.put("/{id}")
async def update_todo(id: str, todo: Todo):
    try:
        result = collection_name.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": dict(todo)},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Todo not found")
        return {"message": "Todo updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating todo: {str(e)}")


@router.delete("/{id}")
async def delete_todo(id: str):
    try:
        result = collection_name.find_one_and_delete({"_id": ObjectId(id)})
        if not result:
            raise HTTPException(status_code=404, detail="Todo not found")
        return {"message": "Todo deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting todo: {str(e)}")
