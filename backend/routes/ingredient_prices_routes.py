# backend/routes/ingredient_prices_routes.py

from flask import Blueprint, request, jsonify
from supabase_client import supabase

ingredient_prices_bp = Blueprint("ingredient_prices", __name__)

@ingredient_prices_bp.route("/ingredient-prices/estimate", methods=["POST"])
def estimate_ingredient_prices():
    """
    Request body:
    {
      "ingredients": [
        { "name": "chicken breast", "quantity": 2, "unit": "lb" },
        { "name": "broccoli", "quantity": 1, "unit": "head" }
      ],
      "max_budget": 25.0,         # optional
      "location": "Anaheim, CA"   # optional (not used yet, but future-friendly)
    }
    """
    data = request.get_json() or {}

    ingredients = data.get("ingredients")
    max_budget = data.get("max_budget")
    location = data.get("location")  # you can use this later to filter by region

    # Basic validation
    if not isinstance(ingredients, list) or len(ingredients) == 0:
        return jsonify({"error": "ingredients must be a non-empty list"}), 400

    items = []
    total_cost = 0.0
    currency = "USD"

    for raw in ingredients:
        name = (raw.get("name") or "").strip()
        quantity = float(raw.get("quantity") or 1.0)
        unit = raw.get("unit")

        if not name:
            items.append({
                "ingredient_name": name,
                "quantity": quantity,
                "unit": unit,
                "found": False,
                "message": "Missing ingredient name"
            })
            continue

        # Query Supabase table `ingredient_prices`
        # Adjust table/column names here if your schema is slightly different
        try:
            query = (
                supabase
                .table("ingredient_prices")
                .select("*")
                .ilike("ingredient_name", f"%{name}%")
                .limit(1)
            )

            # If later you add a region column, you can narrow by location here
            # if location:
            #     query = query.eq("region", location_region)

            result = query.execute()
            rows = result.data or []
        except Exception as e:
            # If Supabase is unhappy, return partial info but don’t crash
            items.append({
                "ingredient_name": name,
                "quantity": quantity,
                "unit": unit,
                "found": False,
                "message": f"Error querying prices: {str(e)}"
            })
            continue

        if not rows:
            # No price data found
            items.append({
                "ingredient_name": name,
                "quantity": quantity,
                "unit": unit,
                "found": False,
                "message": "No price data found for this ingredient"
            })
            continue

        row = rows[0]
        price_per_unit = float(row.get("price_per_unit") or 0.0)
        row_unit = row.get("unit")
        store_name = row.get("store_name")
        store_location = row.get("store_location")
        row_currency = row.get("currency") or "USD"
        last_updated = row.get("last_updated")
        source_url = row.get("source_url")

        if price_per_unit <= 0:
            items.append({
                "ingredient_name": name,
                "quantity": quantity,
                "unit": unit or row_unit,
                "found": False,
                "message": "Invalid or zero price in database"
            })
            continue

        estimated_cost = price_per_unit * quantity
        total_cost += estimated_cost
        currency = row_currency  # if mixed currencies, you could handle that later

        items.append({
            "ingredient_name": name,
            "quantity": quantity,
            "unit": unit or row_unit,
            "found": True,
            "store_name": store_name,
            "store_location": store_location,
            "price_per_unit": price_per_unit,
            "currency": row_currency,
            "estimated_cost": estimated_cost,
            "source_url": source_url,
            "last_updated": last_updated,
        })

    response = {
        "items": items,
        "total_estimated_cost": total_cost,
        "currency": currency,
    }

    # Attach budget-goal / coins logic if user provided a budget
    if isinstance(max_budget, (int, float)):
        max_budget_val = float(max_budget)
        under_budget = total_cost <= max_budget_val
        savings = max(0.0, max_budget_val - total_cost)

        # Simple gamification rule: 1 coin for every $2 saved, rounded down
        coins_earned = int(savings // 2.0) if under_budget else 0

        response["budget_goal"] = {
            "max_budget": max_budget_val,
            "under_budget": under_budget,
            "savings": savings,
            "coins_earned": coins_earned,
        }

    return jsonify(response), 200
