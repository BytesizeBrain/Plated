# backend/routes/proof_routes.py
"""
Proof-of-Cook Feature

When a user completes a recipe, they can optionally upload a photo as proof.
- Completions with proof get a ⭐ and bonus coins
- Shows "18 cooks · 5 with proof ⭐" on recipe chains
- Future: AI/Computer Vision verification of the dish
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import logging
import base64

from routes.user_routes import jwt_required, get_user_id_from_jwt

logger = logging.getLogger(__name__)

proof_bp = Blueprint("proof", __name__)

# ============================================================================
# MOCK DATA - Will be replaced with Supabase when tables are created
# ============================================================================

# Store proof submissions (recipe_id -> list of proofs)
MOCK_PROOFS = {
    "recipe-1": [
        {
            "id": "proof-1",
            "user_id": "user-1",
            "recipe_id": "recipe-1",
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
            "note": "Turned out amazing!",
            "verification_status": "verified",
            "verification_score": 0.92,
            "coins_awarded": 15,
            "created_at": "2025-01-20T14:30:00Z"
        },
        {
            "id": "proof-2",
            "user_id": "user-3",
            "recipe_id": "recipe-1",
            "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
            "note": "First time making this!",
            "verification_status": "verified",
            "verification_score": 0.88,
            "coins_awarded": 15,
            "created_at": "2025-01-21T09:15:00Z"
        },
        {
            "id": "proof-3",
            "user_id": "user-5",
            "recipe_id": "recipe-1",
            "image_url": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
            "note": None,
            "verification_status": "pending",
            "verification_score": None,
            "coins_awarded": 0,
            "created_at": "2025-01-22T18:45:00Z"
        }
    ],
    "recipe-2": [
        {
            "id": "proof-4",
            "user_id": "user-2",
            "recipe_id": "recipe-2",
            "image_url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
            "note": "Added extra cheese 🧀",
            "verification_status": "verified",
            "verification_score": 0.95,
            "coins_awarded": 15,
            "created_at": "2025-01-19T12:00:00Z"
        }
    ]
}

# Completion counts with proof tracking
MOCK_COMPLETION_STATS = {
    "recipe-1": {"total_cooks": 18, "with_proof": 5},
    "recipe-2": {"total_cooks": 12, "with_proof": 3},
    "recipe-3": {"total_cooks": 8, "with_proof": 2},
}

# Constants
PROOF_BONUS_COINS = 5  # Extra coins for submitting proof
VERIFIED_BONUS_COINS = 10  # Extra coins when AI verifies the dish


def _ensure_user_access(requested_user_id: str | None = None):
    """Return authenticated user_id and optionally enforce it matches requested_user_id."""
    user_id, error = get_user_id_from_jwt()
    if error:
        return None, error

    if requested_user_id and str(user_id) != str(requested_user_id):
        return None, (jsonify({"error": "Forbidden"}), 403)

    return user_id, None


# ============================================================================
# ROUTES
# ============================================================================

@proof_bp.route("/recipes/<recipe_id>/proof", methods=["POST"])
@jwt_required
def submit_proof(recipe_id):
    """
    Submit proof of cooking a recipe (photo + optional note).
    
    Request body (multipart/form-data or JSON):
        - image: File (image/jpeg, image/png) OR base64 string
        - note: str (optional) - Quick note about the cook
    
    Returns:
        {
            "proof_id": str,
            "verification_status": "pending" | "verified" | "rejected",
            "coins_awarded": int,
            "message": str
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error
    
    user_id = str(auth_user_id)
    
    try:
        # Get data from request
        if request.is_json:
            data = request.get_json() or {}
            image_data = data.get("image")  # Base64 string
            note = data.get("note", "").strip()
        else:
            # Multipart form data
            image_file = request.files.get("image")
            note = request.form.get("note", "").strip()
            image_data = image_file  # Will handle file upload
        
        if not image_data:
            return jsonify({"error": "Image is required for proof submission"}), 400
        
        # Generate proof ID
        proof_id = f"proof-{uuid.uuid4().hex[:8]}"
        
        # In production: Upload image to storage (Supabase Storage, S3, etc.)
        # For now, use a placeholder URL
        if isinstance(image_data, str) and image_data.startswith("data:image"):
            # Base64 image - in production, decode and upload
            image_url = f"https://plated-proofs.storage.example.com/{proof_id}.jpg"
        else:
            # File upload - in production, upload to storage
            image_url = f"https://plated-proofs.storage.example.com/{proof_id}.jpg"
        
        # Create proof record
        new_proof = {
            "id": proof_id,
            "user_id": user_id,
            "recipe_id": recipe_id,
            "image_url": image_url,
            "note": note if note else None,
            "verification_status": "pending",
            "verification_score": None,
            "coins_awarded": PROOF_BONUS_COINS,  # Base bonus for submitting proof
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Store in mock data
        if recipe_id not in MOCK_PROOFS:
            MOCK_PROOFS[recipe_id] = []
        MOCK_PROOFS[recipe_id].append(new_proof)
        
        # Update completion stats
        if recipe_id not in MOCK_COMPLETION_STATS:
            MOCK_COMPLETION_STATS[recipe_id] = {"total_cooks": 1, "with_proof": 1}
        else:
            MOCK_COMPLETION_STATS[recipe_id]["with_proof"] += 1
        
        # Trigger async AI verification (mock for now)
        # In production: Queue this for background processing
        verification_result = _mock_ai_verify(image_url, recipe_id)
        
        if verification_result["verified"]:
            new_proof["verification_status"] = "verified"
            new_proof["verification_score"] = verification_result["confidence"]
            new_proof["coins_awarded"] += VERIFIED_BONUS_COINS
        
        logger.info(
            "[PROOF_SUBMIT] user=%s recipe=%s proof_id=%s status=%s coins=%s",
            user_id, recipe_id, proof_id, 
            new_proof["verification_status"],
            new_proof["coins_awarded"]
        )
        
        return jsonify({
            "proof_id": proof_id,
            "verification_status": new_proof["verification_status"],
            "verification_score": new_proof.get("verification_score"),
            "coins_awarded": new_proof["coins_awarded"],
            "message": "Proof submitted successfully!" + (
                " ⭐ Verified!" if new_proof["verification_status"] == "verified" else " Pending verification..."
            )
        }), 201
        
    except Exception as e:
        logger.exception("Error submitting proof")
        return jsonify({"error": str(e)}), 500


@proof_bp.route("/recipes/<recipe_id>/proof/stats", methods=["GET"])
@jwt_required
def get_proof_stats(recipe_id):
    """
    Get proof statistics for a recipe.
    
    Returns:
        {
            "recipe_id": str,
            "total_cooks": int,
            "with_proof": int,
            "verified_proofs": int,
            "recent_proofs": [...]
        }
    """
    try:
        stats = MOCK_COMPLETION_STATS.get(recipe_id, {"total_cooks": 0, "with_proof": 0})
        proofs = MOCK_PROOFS.get(recipe_id, [])
        
        verified_count = len([p for p in proofs if p["verification_status"] == "verified"])
        
        # Get recent verified proofs for display
        recent_proofs = sorted(
            [p for p in proofs if p["verification_status"] == "verified"],
            key=lambda x: x["created_at"],
            reverse=True
        )[:5]
        
        return jsonify({
            "recipe_id": recipe_id,
            "total_cooks": stats["total_cooks"],
            "with_proof": stats["with_proof"],
            "verified_proofs": verified_count,
            "recent_proofs": [
                {
                    "id": p["id"],
                    "user_id": p["user_id"],
                    "image_url": p["image_url"],
                    "note": p["note"],
                    "created_at": p["created_at"]
                }
                for p in recent_proofs
            ]
        }), 200
        
    except Exception as e:
        logger.exception("Error fetching proof stats")
        return jsonify({"error": str(e)}), 500


@proof_bp.route("/recipes/<recipe_id>/proofs", methods=["GET"])
@jwt_required
def get_recipe_proofs(recipe_id):
    """
    Get all verified proofs for a recipe (for gallery view).
    
    Query params:
        - limit: int (default 20)
        - offset: int (default 0)
    
    Returns:
        {
            "proofs": [...],
            "total": int,
            "has_more": bool
        }
    """
    try:
        limit = request.args.get("limit", 20, type=int)
        offset = request.args.get("offset", 0, type=int)
        
        all_proofs = MOCK_PROOFS.get(recipe_id, [])
        verified_proofs = [p for p in all_proofs if p["verification_status"] == "verified"]
        
        # Sort by date, newest first
        verified_proofs.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Paginate
        paginated = verified_proofs[offset:offset + limit]
        
        return jsonify({
            "proofs": [
                {
                    "id": p["id"],
                    "user_id": p["user_id"],
                    "image_url": p["image_url"],
                    "note": p["note"],
                    "verification_score": p.get("verification_score"),
                    "created_at": p["created_at"]
                }
                for p in paginated
            ],
            "total": len(verified_proofs),
            "has_more": offset + limit < len(verified_proofs)
        }), 200
        
    except Exception as e:
        logger.exception("Error fetching recipe proofs")
        return jsonify({"error": str(e)}), 500


@proof_bp.route("/users/<user_id>/proofs", methods=["GET"])
@jwt_required
def get_user_proofs(user_id):
    """
    Get all proofs submitted by a user.
    
    Returns:
        {
            "proofs": [...],
            "total_verified": int,
            "total_pending": int
        }
    """
    try:
        user_proofs = []
        for recipe_id, proofs in MOCK_PROOFS.items():
            for proof in proofs:
                if proof["user_id"] == user_id:
                    user_proofs.append({
                        **proof,
                        "recipe_id": recipe_id
                    })
        
        # Sort by date
        user_proofs.sort(key=lambda x: x["created_at"], reverse=True)
        
        verified = len([p for p in user_proofs if p["verification_status"] == "verified"])
        pending = len([p for p in user_proofs if p["verification_status"] == "pending"])
        
        return jsonify({
            "proofs": user_proofs,
            "total_verified": verified,
            "total_pending": pending
        }), 200
        
    except Exception as e:
        logger.exception("Error fetching user proofs")
        return jsonify({"error": str(e)}), 500


@proof_bp.route("/proof/<proof_id>/verify", methods=["POST"])
@jwt_required
def manual_verify_proof(proof_id):
    """
    Manually trigger AI verification for a proof (admin/retry).
    
    In production, this would:
    1. Send image to computer vision API
    2. Compare against recipe expected output
    3. Update verification status
    
    Returns:
        {
            "verification_status": str,
            "verification_score": float,
            "coins_awarded": int
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error
    
    try:
        # Find the proof
        target_proof = None
        for recipe_id, proofs in MOCK_PROOFS.items():
            for proof in proofs:
                if proof["id"] == proof_id:
                    target_proof = proof
                    break
            if target_proof:
                break
        
        if not target_proof:
            return jsonify({"error": "Proof not found"}), 404
        
        # Run AI verification
        result = _mock_ai_verify(target_proof["image_url"], target_proof["recipe_id"])
        
        if result["verified"]:
            target_proof["verification_status"] = "verified"
            target_proof["verification_score"] = result["confidence"]
            if target_proof["coins_awarded"] == PROOF_BONUS_COINS:
                target_proof["coins_awarded"] += VERIFIED_BONUS_COINS
        else:
            target_proof["verification_status"] = "rejected"
            target_proof["verification_score"] = result["confidence"]
        
        logger.info(
            "[PROOF_VERIFY] proof_id=%s status=%s score=%s",
            proof_id,
            target_proof["verification_status"],
            target_proof["verification_score"]
        )
        
        return jsonify({
            "verification_status": target_proof["verification_status"],
            "verification_score": target_proof["verification_score"],
            "coins_awarded": target_proof["coins_awarded"]
        }), 200
        
    except Exception as e:
        logger.exception("Error verifying proof")
        return jsonify({"error": str(e)}), 500


# ============================================================================
# AI VERIFICATION (MOCK - Replace with real CV API)
# ============================================================================

def _mock_ai_verify(image_url: str, recipe_id: str) -> dict:
    """
    Mock AI verification function.
    
    In production, this would:
    1. Download/decode the image
    2. Send to computer vision API (e.g., Google Vision, AWS Rekognition, custom model)
    3. Compare detected food items against recipe ingredients/expected dish
    4. Return confidence score
    
    For now, returns mock verification with 80% success rate.
    """
    import random
    
    # Simulate AI processing delay would happen async in production
    
    # Mock: 80% chance of verification success
    is_verified = random.random() < 0.8
    
    # Mock confidence score
    if is_verified:
        confidence = round(random.uniform(0.75, 0.98), 2)
    else:
        confidence = round(random.uniform(0.20, 0.50), 2)
    
    logger.info(
        "[AI_VERIFY_MOCK] image=%s recipe=%s verified=%s confidence=%s",
        image_url[:50], recipe_id, is_verified, confidence
    )
    
    return {
        "verified": is_verified,
        "confidence": confidence,
        "detected_items": ["food", "plate", "dish"],  # Mock detected items
        "match_score": confidence
    }


# ============================================================================
# FUTURE: Real AI Verification Integration
# ============================================================================
"""
To integrate real computer vision verification:

1. Choose a CV API:
   - Google Cloud Vision API
   - AWS Rekognition
   - Azure Computer Vision
   - Custom trained model (e.g., food classification)

2. Create verification pipeline:
   async def verify_proof_image(image_url: str, recipe: dict) -> VerificationResult:
       # Download image
       image_data = await download_image(image_url)
       
       # Send to CV API
       labels = await cv_api.detect_labels(image_data)
       
       # Compare against recipe
       expected_items = extract_food_items(recipe)
       match_score = calculate_match(labels, expected_items)
       
       return VerificationResult(
           verified=match_score > 0.7,
           confidence=match_score,
           detected_items=labels
       )

3. Queue for async processing:
   - Use Celery, RQ, or similar
   - Process proofs in background
   - Update status when complete
   - Notify user of verification result

4. Add fraud detection:
   - Check for duplicate images
   - Verify image metadata (EXIF)
   - Rate limit submissions
   - Flag suspicious patterns
"""
