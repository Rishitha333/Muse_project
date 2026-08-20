"""
Test text processing module
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    print("Testing text processing module...")
    
    from text_processing.text_sarcasm import extract_text_features, predict_sarcasm
    
    test_text = "This is a test sentence to check sarcasm detection"
    
    print(f"\nTest text: {test_text}")
    print("\n1. Extracting text features...")
    
    features = extract_text_features(test_text)
    
    if features is None:
        print("❌ Feature extraction failed!")
        sys.exit(1)
    
    print(f"✅ Features extracted successfully (shape: {features.shape})")
    
    print("\n2. Predicting sarcasm...")
    
    sarcasm_score = predict_sarcasm(features)
    
    if sarcasm_score is None:
        print("❌ Sarcasm prediction failed!")
        sys.exit(1)
    
    print(f"✅ Sarcasm prediction successful: {sarcasm_score}")
    
    print("\n✅ All tests passed!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
