from fastapi import APIRouter, UploadFile, File, HTTPException
import boto3
import httpx
from .config import (
    AWS_ACCESS_KEY_ID, 
    AWS_SECRET_ACCESS_KEY, 
    AWS_REGION,
    NUTRITIONIX_APP_ID,
    NUTRITIONIX_API_KEY,
    NUTRITIONIX_API_ENDPOINT
)
from typing import Dict, List
import base64

router = APIRouter()

rekognition_client = boto3.client(
    'rekognition',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

async def get_enhanced_nutrition_info(food_item: str) -> Dict:
    """Get calorie information from Nutritionix API."""
    headers = {
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "query": food_item,
        "timezone": "US/Eastern"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                NUTRITIONIX_API_ENDPOINT,
                json=data,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            if "foods" in data and len(data["foods"]) > 0:
                food = data["foods"][0]
                return {
                    "food_name": food.get("food_name", ""),
                    "calories": food.get("nf_calories", 0),
                    "serving_qty": food.get("serving_qty", 1),
                    "serving_unit": food.get("serving_unit", "serving"),
                    "protein": food.get("nf_protein", 0),
                    "carbohydrates": food.get("nf_total_carbohydrate", 0),
                    "fat": food.get("nf_total_fat", 0),
                    "fiber": food.get("nf_dietary_fiber", 0),
                    "sugars": food.get("nf_sugars", 0),
                    "sodium": food.get("nf_sodium", 0),
                    "cholesterol": food.get("nf_cholesterol", 0)
                }
        except Exception as e:
            print(f"Error fetching nutrition info for {food_item}: {str(e)}")
            return None

@router.post("/analyze-food")
async def analyze_food(file: UploadFile = File(...)):
    contents = await file.read()
    
    try:
        response = rekognition_client.detect_labels(
            Image={'Bytes': contents},
            MaxLabels=20,
            MinConfidence=60
        )
        
        food_items = []
        total_calories = 0
        
        food_labels = [label for label in response['Labels'] 
                      if any(category['Name'] in ['Food', 'Drink', 'Beverage'] 
                            for category in label.get('Categories', []))]
        
        if not food_labels:
            food_labels = response['Labels']

        # Create a set of generic food categories to filter out
        generic_categories = {'food', 'fruit', 'vegetable', 'beverage', 'drink', 'meat', 'dairy'}
        
        # Filter out generic categories and sort by confidence
        specific_foods = [
            label for label in food_labels 
            if label['Name'].lower() not in generic_categories
        ]
        
        # Sort by confidence score
        specific_foods.sort(key=lambda x: x['Confidence'], reverse=True)
        
        
        for label in specific_foods:
            label_name = label['Name'].lower()
            nutrition_info = await get_enhanced_nutrition_info(label_name)
            
            if nutrition_info:
                food_item = {
                    'name': label_name,
                    'confidence': label['Confidence'],
                    'calories': nutrition_info["calories"],
                    'serving_info': f"{nutrition_info['serving_qty']} {nutrition_info['serving_unit']}",
                    'protein': nutrition_info["protein"],
                    'carbohydrates': nutrition_info["carbohydrates"],
                    'fat': nutrition_info["fat"],
                    'fiber': nutrition_info["fiber"],
                    'sugars': nutrition_info["sugars"],
                    'sodium': nutrition_info["sodium"],
                    'cholesterol': nutrition_info["cholesterol"]
                }
                
                food_items.append(food_item)
                total_calories += nutrition_info["calories"]
        
        return {
            'food_items': food_items,
            'total_calories': total_calories,
            'success': True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/barcode/{barcode}")
async def get_food_info_by_barcode(barcode: str):
    """Fetch food information based on the scanned barcode using Open Food Facts API."""
    print(f"Received barcode: {barcode}")  # Log the received barcode
    try:
        async with httpx.AsyncClient() as client:
            # Using Open Food Facts API
            response = await client.get(
                f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
            )
            
            print(f"Response status code: {response.status_code}")  # Log the response status code
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response data: {data}")  # Log the response data
                
                if data.get('status') == 1 and data.get('product'):
                    product = data['product']
                    nutriments = product.get('nutriments', {})
                    
                    return {
                        "food_name": product.get("product_name", ""),
                        "calories": nutriments.get("energy-kcal_100g", 0),
                        "protein": nutriments.get("proteins_100g", 0),
                        "fat": nutriments.get("fat_100g", 0),
                        "carbohydrates": nutriments.get("carbohydrates_100g", 0),
                        "serving_qty": 100,  # Values are per 100g
                        "serving_unit": "g",
                        "brand": product.get("brands", ""),
                        "image_url": product.get("image_url", "")
                    }
            
            print("Product not found or status not 1")  # Log if product not found
            raise HTTPException(
                status_code=404, 
                detail="Product not found. Try scanning the barcode again."
            )
            
    except Exception as e:
        print(f"Error fetching product information: {str(e)}")  # Log any errors
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching product information: {str(e)}"
        )

@router.get("/nutritionix/search/{query}")
async def search_food(query: str):
    """Search for food items using Nutritionix API."""
    headers = {
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "query": query,
        "timezone": "US/Eastern"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                NUTRITIONIX_API_ENDPOINT,
                json=data,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            if "foods" in data and len(data["foods"]) > 0:
                return {"foods": data["foods"]}
            else:
                return {"foods": []}
        except Exception as e:
            print(f"Error searching for food: {str(e)}")
            raise HTTPException(status_code=500, detail="Error searching for food")