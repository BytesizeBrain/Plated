import { useState, useRef } from 'react';
import { submitProof } from '../../utils/proofApi';
import type { ProofSubmitResponse } from '../../types';
import './ProofUploadModal.css';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  recipeName?: string;
  onSuccess?: (result: ProofSubmitResponse) => void;
}

export function ProofUploadModal({
  isOpen,
  onClose,
  recipeId,
  recipeName,
  onSuccess
}: ProofUploadModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProofSubmitResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await submitProof(recipeId, selectedImage, note.trim() || undefined);
      setResult(response);
      onSuccess?.(response);
    } catch (err: any) {
      setError(err.message || 'Failed to submit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setNote('');
    setError(null);
    setResult(null);
    onClose();
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setNote('');
    setError(null);
    setResult(null);
  };

  return (
    <div className="proof-modal-overlay" onClick={handleClose}>
      <div className="proof-modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proof-modal-header">
          <h2>
            <span className="proof-icon">📸</span>
            {result ? 'Proof Submitted!' : 'Add Proof of Cook'}
          </h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Result View */}
        {result ? (
          <div className="proof-result">
            <div className={`result-badge ${result.verification_status}`}>
              {result.verification_status === 'verified' ? (
                <>
                  <span className="result-star">⭐</span>
                  <span>Verified!</span>
                </>
              ) : (
                <>
                  <span className="result-clock">⏳</span>
                  <span>Pending Verification</span>
                </>
              )}
            </div>
            
            {imagePreview && (
              <div className="result-image">
                <img src={imagePreview} alt="Your proof" />
              </div>
            )}
            
            <div className="result-rewards">
              <div className="reward-row">
                <span className="reward-icon">🪙</span>
                <span className="reward-text">+{result.coins_awarded} coins earned</span>
              </div>
              {result.verification_status === 'verified' && (
                <div className="reward-row verified">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-text">Includes +10 verification bonus!</span>
                </div>
              )}
              {result.verification_score && (
                <div className="confidence-score">
                  AI Confidence: {Math.round(result.verification_score * 100)}%
                </div>
              )}
            </div>
            
            <p className="result-message">{result.message}</p>
            
            <button className="done-btn" onClick={handleClose}>
              Done
            </button>
          </div>
        ) : (
          /* Upload Form */
          <div className="proof-form">
            {recipeName && (
              <p className="recipe-name">
                Proving you cooked: <strong>{recipeName}</strong>
              </p>
            )}
            
            {/* Image Upload Area */}
            <div 
              className={`upload-area ${imagePreview ? 'has-image' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    className="remove-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetForm();
                    }}
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Click or drag to upload your dish photo</p>
                  <span className="upload-hint">JPG, PNG up to 10MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Note Input */}
            <div className="note-section">
              <label htmlFor="proof-note">Add a note (optional)</label>
              <textarea
                id="proof-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How did it turn out? Any modifications?"
                maxLength={200}
                rows={2}
              />
              <span className="char-count">{note.length}/200</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="info-box">
              <div className="info-row">
                <span className="info-icon">🪙</span>
                <span>+5 coins for submitting proof</span>
              </div>
              <div className="info-row highlight">
                <span className="info-icon">⭐</span>
                <span>+10 bonus if AI verifies your dish!</span>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="submit-proof-btn"
              onClick={handleSubmit}
              disabled={!selectedImage || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Submit Proof
                </>
              )}
            </button>

            {/* Skip Option */}
            <button className="skip-btn" onClick={handleClose}>
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProofUploadModal;
