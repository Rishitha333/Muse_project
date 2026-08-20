def fuse_sarcasm(text_score, audio_score, alpha=0.6):
    """
    Late fusion of text + audio sarcasm signals
    """
    beta = 1 - alpha
    final_score = alpha * text_score + beta * audio_score
    return round(final_score, 3)
